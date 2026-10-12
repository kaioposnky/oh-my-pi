import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { JevClient } from "./jev.js";
import { pickModelPatternForProfile } from "./model-router.js";

export type SpawnProfile = "fast" | "balanced" | "reasoning" | "long_context";

const VALID_PROFILES: ReadonlySet<string> = new Set<SpawnProfile>(["fast", "balanced", "reasoning", "long_context"]);

/** Pure decision: which spawn profile an auto-spawned subagent should use.
 * Undefined means "no opinion" — the caller keeps its default. Explicit
 * caller choices and unclear tasks are never overridden. */
export function decideSpawnProfile(event: { patterns: string[] }, jev: { clarity: string; profile: string }): SpawnProfile | undefined {
  if (event.patterns.length > 0) return undefined;
  if (jev.clarity === "unclear") return undefined;
  return VALID_PROFILES.has(jev.profile) ? (jev.profile as SpawnProfile) : undefined;
}

/** Event/result shapes for `before_subagent_spawn` (omitted from pi-coding-agent 0.85 typings). */
export interface BeforeSubagentSpawnEvent {
  type: "before_subagent_spawn";
  agent: string;
  invocationKind: "task" | "eval";
  modelRole?: string;
  patterns: string[];
  spawnKey?: string;
}

export interface BeforeSubagentSpawnEventResult {
  model?: string | string[];
  block?: boolean;
  reason?: string;
  note?: string;
}

export type BeforeSubagentSpawnHandler = (
  event: BeforeSubagentSpawnEvent,
  ctx: ExtensionContext,
) => Promise<BeforeSubagentSpawnEventResult | undefined> | BeforeSubagentSpawnEventResult | undefined;

declare module "@earendil-works/pi-coding-agent" {
  interface ExtensionAPI {
    on(event: "before_subagent_spawn", handler: BeforeSubagentSpawnHandler): void;
  }
}

const SPAWN_QUESTIONS = {
  clarity: {
    type: "choice" as const,
    instructions: "Is the subagent's task definition clear enough to choose a model for it?",
    criteria: {
      clear: "Task has a well-defined goal",
      unclear: "Essential information is missing",
    },
  },
  profile: {
    type: "choice" as const,
    instructions: "Which model profile best fits this subagent task?",
    criteria: {
      fast: "Mechanical edits, trivial transforms, simple lookups",
      balanced: "General coding tasks with moderate complexity",
      reasoning: "Complex debugging, architecture, algorithms, multi-step logic",
      long_context: "Large-file or repo-wide analysis needing many tokens",
    },
  },
};

export class SpawnRouter {
  constructor(private jevClient: Pick<JevClient, "isConfigured" | "evaluate">) {}

  /** Never throws. Any Jev failure leaves the caller's default spawn untouched. */
  public install(pi: ExtensionAPI): void {
    pi.on("before_subagent_spawn", async (event, ctx) => {
      if (process.env.PI_JEV_SPAWN?.trim() === "0") return undefined;
      if (!this.jevClient.isConfigured()) return undefined;
      // Caller chose patterns explicitly; never second-guess (checked before the Jev request).
      if (event.patterns.length > 0) return undefined;
      try {
        const { answers } = await this.jevClient.evaluate(
          {
            state: { agent: event.agent, task_context: event.spawnKey ?? event.agent },
            questions: SPAWN_QUESTIONS,
          },
          ctx.signal,
        );
        const profile = decideSpawnProfile(event, {
          clarity: String(answers.clarity?.value ?? ""),
          profile: String(answers.profile?.value ?? ""),
        });
        if (!profile) return undefined;
        const models = ctx.scopedModels?.length ? ctx.scopedModels.map((x) => x.model) : ctx.modelRegistry.getAvailable();
        const pattern = pickModelPatternForProfile(profile, models);
        if (!pattern) return undefined;
        return { model: pattern, note: `jev: ${profile} via spawn router` };
      } catch {
        return undefined;
      }
    });
  }
}
