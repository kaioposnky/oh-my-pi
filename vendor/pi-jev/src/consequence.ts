import type { JevClient, } from "./jev.js";
import type { QuestionConfig } from "./types.js";

export interface ConsequenceAssessment {
  reversible?: number;
  scope?: string;
  blastRadius?: number;
}

export interface ApprovalDecision {
  requireApproval: boolean;
  reason?: string;
  relaxed?: boolean;
}

/** Runtime override for the consequence gate; null = fall back to PI_JEV_CONSEQUENCE env. */
export const consequenceOverride: { enabled: boolean | null } = { enabled: null };

/**
 * Consequence-gated approval policy over Jev's assessment; rules may only be
 * stricter than the keyword gate, never looser — except the explicit row-1
 * relaxation (highly reversible, tiny blast radius, single file).
 */
export function decideApproval(keywordRisky: boolean, jev?: ConsequenceAssessment): ApprovalDecision {
  if (keywordRisky) {
    if (
      jev?.reversible !== undefined &&
      jev.reversible >= 0.85 &&
      jev.blastRadius !== undefined &&
      jev.blastRadius <= 3 &&
      jev.scope === "single_file"
    ) {
      return { requireApproval: false, relaxed: true, reason: "reversible low-blast operation auto-approved" };
    }
    return { requireApproval: true, reason: "risky operation" };
  }
  if (
    jev?.blastRadius !== undefined &&
    (jev.blastRadius >= 7 || (jev.scope === "system" && jev.reversible !== undefined && jev.reversible < 0.5))
  ) {
    return { requireApproval: true, reason: "high blast radius flagged by Jev" };
  }
  return { requireApproval: false };
}

export const CONSEQUENCE_QUESTIONS: Record<string, QuestionConfig> = {
  reversible: {
    type: "noul",
    instructions: "Is this operation reversible without data loss?",
  },
  scope: {
    type: "choice",
    instructions: "What does this operation affect?",
    criteria: {
      single_file: "Affects one file or one directory the user controls",
      repo: "Affects the whole repository",
      system: "Affects the OS, filesystem outside the repo, network, or external services",
      external: "Sends data to external services",
    },
  },
  blast_radius: {
    type: "score",
    instructions: "How much damage if this operation is wrong? (0 = none, 10 = catastrophic)",
    criteria: ["0 (none)", "5 (moderate)", "10 (catastrophic)"],
  },
};

const MAX_INPUT_CHARS = 4000;

/**
 * Ask Jev to assess a tool call's consequences in one batched evaluate call.
 * Never throws: any failure returns undefined and callers treat it as no-Jev
 * (the keyword rules still apply — fail closed on approvals).
 */
export async function assessConsequence(
  jevClient: Pick<JevClient, "isConfigured" | "evaluate">,
  toolName: string,
  input: unknown,
  signal?: AbortSignal
): Promise<ConsequenceAssessment | undefined> {
  if (consequenceOverride.enabled === false) return undefined;
  if (consequenceOverride.enabled === null && process.env.PI_JEV_CONSEQUENCE?.trim() === "0") return undefined;
  if (!jevClient.isConfigured()) return undefined;
  try {
    const serialized = JSON.stringify(input).replace(/\s+/g, " ").slice(0, MAX_INPUT_CHARS);
    const { answers } = await jevClient.evaluate(
      { state: { tool: toolName, input: serialized }, questions: CONSEQUENCE_QUESTIONS },
      signal
    );
    const num = (key: string) => {
      const v = answers[key]?.value;
      return typeof v === "number" && Number.isFinite(v) ? v : undefined;
    };
    const scope = answers.scope?.value;
    return {
      reversible: num("reversible"),
      scope: typeof scope === "string" ? scope : undefined,
      blastRadius: num("blast_radius"),
    };
  } catch {
    return undefined;
  }
}
