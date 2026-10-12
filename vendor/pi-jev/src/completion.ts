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
