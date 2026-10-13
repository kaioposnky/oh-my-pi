import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { JevClient } from "./jev.js";
import { JEV_THRESHOLD } from "./skills.js";
import type { QuestionConfig } from "./types.js";

/** Runtime override for the learn gate; null = fall back to PI_JEV_LEARN env. */
export const learnOverride: { enabled: boolean | null } = { enabled: null };

const LEARN_QUESTIONS: Record<string, QuestionConfig> = {
  durable: {
    type: "noul",
    instructions: "Is this a durable fact, convention, or lesson about the project or environment — not transient task state?",
  },
  reusable: {
    type: "noul",
    instructions: "Will this lesson be useful in future sessions on other tasks?",
  },
  novel: {
    type: "noul",
    instructions: "Is this lesson already obvious or implied by the codebase and context?",
  },
};

const MAX_LESSON_CHARS = 6000;
const MAX_CONTEXT_CHARS = 2000;

/**
 * Intercepts `learn` tool calls and asks Jev (one batched evaluate) whether the
 * lesson is durable and reusable before it reaches the memory bank. Never
 * throws: any failure lets the tool proceed (fail-open).
 */
export class LearnGate {
  constructor(private jevClient: Pick<JevClient, "isConfigured" | "evaluate">) {}

  public install(pi: ExtensionAPI): void {
    pi.on("tool_call", async (event, ctx) => {
      if (event.toolName !== "learn") return undefined;
      try {
        const input = (event.input ?? {}) as Record<string, unknown>;
        const lesson = String(input.memory ?? "").slice(0, MAX_LESSON_CHARS);
        if (!lesson) return undefined; // empty/misused call: nothing to judge
        if (learnOverride.enabled === false) return undefined;
        if (learnOverride.enabled === null && process.env.PI_JEV_LEARN?.trim() === "0") return undefined;
        if (!this.jevClient.isConfigured()) return undefined;

        const context = String(input.context ?? "").slice(0, MAX_CONTEXT_CHARS);
        const { answers } = await this.jevClient.evaluate(
          { state: { lesson, context }, questions: LEARN_QUESTIONS },
          ctx.signal
        );
        const num = (key: string) => {
          const v = answers[key]?.value;
          return typeof v === "number" && Number.isFinite(v) ? v : undefined;
        };
        const decision = decideLearn({ durable: num("durable"), reusable: num("reusable"), novel: num("novel") });
        if (decision.learn) return undefined;
        ctx.ui.setStatus("jev", "jev: learn gate rejected");
        return {
          block: true,
          reason: `Jev learn gate: ${decision.reason}. Lesson skipped — memory bank kept clean.`,
        };
      } catch {
        return undefined; // fail-open
      }
    });
  }
}


/** Jev's judgment on a would-be memory-bank lesson. */
export interface LearnJev {
  durable?: number;
  reusable?: number;
  /** Informational only — never gates (reserved for future dedup/novelty hints). */
  novel?: number;
}

export interface LearnDecision {
  learn: boolean;
  reason?: string;
}

/** Pure decision: learn only when every judged dimension clears JEV_THRESHOLD.
 * Missing jev → learn (fail-open); a missing field is unknown, not failing —
 * reject only when a present field is below threshold. */
export function decideLearn(jev?: LearnJev): LearnDecision {
  if (!jev) return { learn: true };
  const dims: Array<[string, number | undefined]> = [
    ["durable", jev.durable],
    ["reusable", jev.reusable],
  ];
  const failed = dims.filter(([, v]) => v !== undefined && v < JEV_THRESHOLD);
  if (failed.length > 0) {
    return {
      learn: false,
      reason: `not durable or not reusable (durable ${jev.durable?.toFixed(2) ?? "?"}, reusable ${jev.reusable?.toFixed(2) ?? "?"})`,
    };
  }
  return { learn: true };
}
