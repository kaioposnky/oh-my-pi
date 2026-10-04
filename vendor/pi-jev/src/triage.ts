import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { JevClient } from "./jev.js";
import { JEV_THRESHOLD } from "./skills.js";
import { isJevTool, type QuestionConfig } from "./types.js";

/** Areas where a wrong change is costly or irreversible. Matching forces human approval; Jev cannot clear it. */
export const RISKY =
  /\b(?:auth(?:entication|orization)?|autentica(?:ção|cao)|autoriza(?:ção|cao)|permissions?|permiss(?:ão|ao|ões|oes)|database|banco de dados|db|production|prod|produ(?:ção|cao)|deploy\w*|infra(?:structure|estrutura)?|credentials?|credencia(?:l|is)|secrets?|segredos?|password|senha|delete|deletar|apag\w*|exclu\w*|drop|truncate|destroy|destrutiv\w*|migrations?|migra(?:ção|cao|ções|coes)|reset --hard|push --force|force-push|rm -rf?)\b|(?<![\w-])rm\s+-[a-z]*[rf]/i;

const PLANNING =
  /\b(?:redesign|redesenh\w*|architecture|arquitetura|refactor\w*|refator\w*|entire|whole|multiple areas|várias áreas|varias areas|design system)\b/i;

export type TriageAction = "implement" | "plan_then_implement" | "ask_user" | "require_approval";

export interface TriageDecision {
  action: TriageAction;
  /** Why the action was chosen; names the rule that overrode Jev, if any. */
  reasons: string[];
  /** Raw Jev answers, or undefined when Jev was skipped or failed. */
  jev?: { clarity?: string; risk?: string; action?: string; needsPlanning?: number };
}

export const TRIAGE_QUESTIONS: Record<string, QuestionConfig> = {
  clarity: {
    type: "choice",
    instructions: "Is `task` clear enough to start work?",
    criteria: {
      clear: "Goal and expected result are clear",
      partially_clear: "Work can start, with minor open questions",
      unclear: "Essential information is missing",
    },
  },
  needs_planning: {
    type: "noul",
    instructions:
      "Does `task` need a plan before implementation (architecture, several areas, broad redesign, migration, or complex decisions) rather than a small, local, direct change?",
  },
  risk: {
    type: "choice",
    instructions: "What is the technical risk of the change `task` requests?",
    criteria: {
      low: "Local and easily reversible",
      medium: "May affect several components or needs careful review",
      high: "May affect authentication, authorization, data, production, infrastructure, security, or lose information",
    },
  },
  action: {
    type: "choice",
    instructions: "What is the safe next step for `task`?",
    criteria: {
      implement: "Do it directly",
      plan_then_implement: "Write and validate a plan before implementing",
      ask_user: "Ask the user for essential missing information",
      require_approval: "Present the action and wait for approval",
    },
  },
};

/**
 * Deterministic policy over Jev's answers; rules may only be stricter than Jev.
 * Order matters: risk beats clarity beats planning.
 */
export function decideTriage(prompt: string, jev?: TriageDecision["jev"]): TriageDecision {
  const reasons: string[] = [];
  if (RISKY.test(prompt) || jev?.risk === "high" || jev?.action === "require_approval") {
    reasons.push(RISKY.test(prompt) ? "risky keyword in request" : "Jev rated the change high risk");
    return { action: "require_approval", reasons, jev };
  }
  if (jev?.clarity === "unclear" || jev?.action === "ask_user") {
    reasons.push("request is missing essential information");
    return { action: "ask_user", reasons, jev };
  }
  const jevPlans = (jev?.needsPlanning ?? 0) >= JEV_THRESHOLD || jev?.action === "plan_then_implement";
  if (PLANNING.test(prompt) || jevPlans) {
    reasons.push(jevPlans ? "Jev judged it needs planning" : "planning keyword in request");
    return { action: "plan_then_implement", reasons, jev };
  }
  return { action: "implement", reasons, jev };
}

const INSTRUCTIONS: Record<Exclude<TriageAction, "implement">, string> = {
  require_approval:
    "High-risk request. Before changing anything, state exactly what you intend to do and wait for the user's explicit approval. Risky tool calls will also require approval.",
  ask_user: "The request is unclear. Ask the user for the missing information before acting.",
  plan_then_implement: "Write a short plan first (steps, files, risks), then implement it.",
};

/** Tools that never change state; they skip the approval gate. */
const READ_ONLY: Record<string, true> = {
  read: true, grep: true, glob: true, find: true, ls: true, web_search: true, lsp: true, todo: true, ask: true, wait: true,
};

/** Per-prompt triage plus the risky-tool-call approval gate. On by default; PI_JEV_TRIAGE=0 turns both off. */
export class Triage {
  public enabled = process.env.PI_JEV_TRIAGE?.trim() !== "0";
  /** Set when the current prompt was triaged as require_approval; cleared once the user approves a call. */
  private gateTurn = false;

  constructor(private jevClient: Pick<JevClient, "isConfigured" | "evaluate">) {}

  /** Never throws. When Jev fails, the keyword rules still apply. */
  public async triage(prompt: string, signal?: AbortSignal): Promise<TriageDecision | undefined> {
    this.gateTurn = false;
    if (!this.enabled || !prompt.trim() || prompt.trim().startsWith("/")) return undefined;
    let jev: TriageDecision["jev"];
    if (this.jevClient.isConfigured()) {
      try {
        const { answers } = await this.jevClient.evaluate({ state: { task: prompt }, questions: TRIAGE_QUESTIONS }, signal);
        const text = (key: string) => (typeof answers[key]?.value === "string" ? String(answers[key].value) : undefined);
        const planning = answers.needs_planning?.value;
        jev = { clarity: text("clarity"), risk: text("risk"), action: text("action"), needsPlanning: typeof planning === "number" ? planning : undefined };
      } catch {
        // Fall through to keyword-only policy.
      }
    }
    const decision = decideTriage(prompt, jev);
    this.gateTurn = decision.action === "require_approval";
    return decision;
  }

  public message(decision: TriageDecision): string | undefined {
    if (decision.action === "implement") return undefined;
    return `Jev triage: ${decision.action} (${decision.reasons.join("; ")}). ${INSTRUCTIONS[decision.action]}`;
  }

  public install(pi: ExtensionAPI): void {
    pi.on("tool_call", async (event, ctx) => {
      if (!this.enabled || READ_ONLY[event.toolName] || isJevTool(event.toolName)) return;
      const input = JSON.stringify(event.input);
      const keyword = RISKY.exec(input)?.[0];
      if (!keyword && !this.gateTurn) return;

      const why = keyword ? `touches "${keyword}"` : "is part of a task triaged as high risk";
      if (!ctx.hasUI) {
        return { block: true, reason: `Blocked: this ${event.toolName} call ${why} and needs user approval, but no UI is available to ask. Tell the user what you intended to run.` };
      }
      const approved = await ctx.ui.confirm(`Approve risky ${event.toolName} call?`, `This call ${why}.\n\n${input.slice(0, 1500)}`);
      if (!approved) return { block: true, reason: `User rejected this ${event.toolName} call (${why}). Do not retry it; ask the user how to proceed.` };
      // One approval covers the rest of a high-risk turn; keyword hits still ask per call.
      if (!keyword) this.gateTurn = false;
      return undefined;
    });
  }
}
