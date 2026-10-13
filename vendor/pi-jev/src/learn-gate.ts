import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { JevClient } from "./jev.js";
import { JEV_THRESHOLD } from "./skills.js";
import type { QuestionConfig } from "./types.js";

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
