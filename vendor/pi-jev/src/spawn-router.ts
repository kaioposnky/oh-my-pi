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
