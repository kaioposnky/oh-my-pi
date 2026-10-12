import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { JevClient } from "./jev.js";
import type { QuestionConfig } from "./types.js";
import { JEV_THRESHOLD } from "./skills.js";
void JEV_THRESHOLD; // reserved: plan's informational confidence threshold

export interface CompletionJev {
  allTasksDone?: number;
  /** Collected but informational only for now; the plan reserves it for future gating. */
  verificationDone?: number;
  prematureStop?: number;
}

export interface CompletionDecision {
  continueSession: boolean;
  reason?: string;
}

// JEV_THRESHOLD is informational here; the plan pins both decision thresholds at 0.7.
const COMPLETION_THRESHOLD = 0.7;
const PREMATURE_STOP_THRESHOLD = 0.7;

const INCOMPLETE_STATUSES = new Set(["pending", "in_progress", "blocked"]);

/**
 * Pure completion decision: whether the session should keep going.
 * Incomplete todos always continue (deterministic, Jev cannot override);
 * Jev scores only get a vote once every todo is done, and missing Jev
 * fails open (no continuation).
 */
export function decideCompletion(
  todos: { phases: Array<{ name: string; tasks: Array<{ content: string; status: string }> }> },
  jev?: CompletionJev,
): CompletionDecision {
  const incomplete = todos.phases.flatMap((p) => p.tasks).filter((t) => INCOMPLETE_STATUSES.has(t.status));
  if (incomplete.length > 0) {
    return { continueSession: true, reason: `todos pending: ${incomplete.map((t) => t.content).join(", ")}` };
  }
  if (jev === undefined) return { continueSession: false };
  if (jev.prematureStop !== undefined && jev.prematureStop > PREMATURE_STOP_THRESHOLD) {
    return { continueSession: true, reason: `Jev flagged premature stop (${jev.prematureStop})` };
  }
  if (jev.allTasksDone !== undefined && jev.allTasksDone < COMPLETION_THRESHOLD) {
    return { continueSession: true, reason: `Jev doubts task completion (${jev.allTasksDone})` };
  }
  return { continueSession: false };
}

/** Runtime override for the completion gate; null = fall back to PI_JEV_COMPLETION env. */
export const completionOverride: { enabled: boolean | null } = { enabled: null };

export const COMPLETION_QUESTIONS: Record<string, QuestionConfig> = {
  all_tasks_done: {
    type: "noul",
    instructions: "Does the final response indicate all requested work was completed?",
  },
  premature_stop: {
    type: "noul",
    instructions: "Is there requested-but-unaddressed work remaining?",
  },
  verification_done: {
    type: "noul",
    instructions: "Did the agent verify its work (run tests, check files)?",
  },
};

const MAX_STATE_CHARS = 6000;

/** Event/result shapes for `session_stop` (omitted from pi-coding-agent 0.85 typings). */
export interface SessionStopEvent {
  type: "session_stop";
  messages: any[];
  turn_id: number;
  last_assistant_message?: any;
  session_id: string;
  session_file?: string;
  stop_hook_active: boolean;
  signal?: AbortSignal;
}

export interface SessionStopEventResult {
  continue?: boolean;
  additionalContext?: string;
  decision?: "block";
  reason?: string;
}

declare module "@earendil-works/pi-coding-agent" {
  interface ExtensionAPI {
    on(
      event: "session_stop",
      handler: (
        event: SessionStopEvent,
        ctx: ExtensionContext,
      ) => Promise<SessionStopEventResult | undefined> | SessionStopEventResult | undefined,
    ): void;
  }
}

/** Normalize message content (string or part array) to plain text. */
function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part: any) => (part && typeof part === "object" && part.type === "text" && typeof part.text === "string" ? part.text : ""))
      .join(" ")
      .trim();
  }
  return "";
}

function lastText(messages: any[], role: string): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message?.role !== role) continue;
    const text = textOf(message.content);
    if (text) return text;
  }
  return undefined;
}

/**
 * Latest committed todo phases from the stop event's messages: the last
 * non-error, non-view `todo` toolResult carrying `details.phases`.
 * Never throws; extraction failure degrades to no todos (Jev-only check).
 */
export function extractTodoPhases(messages: any[]): { phases: Array<{ name: string; tasks: Array<{ content: string; status: string }> }> } {
  try {
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message?.role !== "toolResult" || message.toolName !== "todo" || message.isError) continue;
      if (message.details?.op === "view") continue;
      const phases = message.details?.phases;
      if (Array.isArray(phases)) return { phases };
    }
  } catch {
    // fall through
  }
  return { phases: [] };
}

/**
 * Completion gate at session stop: if todos are pending or Jev flags a
 * premature stop, requests one continuation turn with guidance. Never throws;
 * every failure mode degrades to returning undefined (let the session settle).
 */
export class CompletionVerifier {
  constructor(private jevClient: Pick<JevClient, "isConfigured" | "evaluate">) {}

  public install(pi: ExtensionAPI): void {
    pi.on("session_stop", async (event, ctx) => this.check(event, ctx));
  }

  private async check(event: SessionStopEvent, ctx: ExtensionContext): Promise<SessionStopEventResult | undefined> {
    try {
      if (completionOverride.enabled === false) return undefined;
      if (completionOverride.enabled === null && process.env.PI_JEV_COMPLETION?.trim() === "0") return undefined;
      // Core re-fires session_stop during continuations with this flag set;
      // continuing again would loop forever.
      if (event.stop_hook_active) return undefined;

      const messages = event.messages ?? [];
      const prompt = lastText(messages, "user");
      if (prompt === undefined) return undefined;
      const response = lastText(messages, "assistant") ?? "";
      const todos = extractTodoPhases(messages);

      const configured = this.jevClient.isConfigured();
      if (!configured && todos.phases.length === 0) return undefined;

      let jev: CompletionJev | undefined;
      if (configured) {
        try {
          const { answers } = await this.jevClient.evaluate(
            {
              state: { task: prompt.slice(0, MAX_STATE_CHARS), response: response.slice(0, MAX_STATE_CHARS) },
              questions: COMPLETION_QUESTIONS,
            },
            event.signal
          );
          const num = (key: string) => {
            const v = answers[key]?.value;
            return typeof v === "number" && Number.isFinite(v) ? v : undefined;
          };
          jev = { allTasksDone: num("all_tasks_done"), prematureStop: num("premature_stop"), verificationDone: num("verification_done") };
        } catch {
          jev = undefined; // fail open
        }
      }

      const decision = decideCompletion(todos, jev);
      if (!decision.continueSession) return undefined;
      ctx.ui.setStatus("jev", "jev: completion check failed → continuing");
      return { continue: true, additionalContext: `Completion check: ${decision.reason}. Address this before finishing.` };
    } catch {
      return undefined;
    }
  }
}
