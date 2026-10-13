vendored from TheoOliveira/pi-jev@94169cf (v0.7.0), MIT

Local changes:
- `src/skills.ts`: strip the host's `skill:` command prefix so `/skill:<name>` renders once.
- `src/types.ts` `queryTerms`: tool/skill shortlists drop stop words and turn raw URLs into web terms
  (previously "https"/"com"/"the" matched everything and pushed browser skills out of the Jev candidates).
- `src/model-router.ts`: URL input no longer excludes models (no omp model declares `url` input; URLs are
  fetched with tools), and bare "page"/"website" no longer classifies design prompts as URL tasks.
- Web tasks (`WEB_TASK` in `src/types.ts`) get one Jev routing pass even with auto mode off; opt out with
  `PI_JEV_WEB=0`. Benchmarked (3 tasks x 3 trials per arm): screenshot task 55s -> 19s, by going straight to
  the agent-browser skill instead of a broken relay; simple fetch tasks ~1s Jev overhead, no gain.
- `src/jev.ts`: client timeout 5s, no retries (SDK default 10s x 3 attempts stalled a prompt ~31s when the
  endpoint hung; every Jev caller already fails open).
- `src/triage.ts` (new): per-prompt Jev triage + risky tool-call approval gate, adapted from a Planejoo
  Jev-MVP (`scripts/jev-triage.ts`): same four questions and keyword-first policy, minus project/model routing.
- `jev_browse` tool (new: `src/browse.ts`, `src/browse-cdp.ts`): TypeScript port of browser-use/jev-ultrafast@main
  (MIT). Policy, prompts, DOM snapshot, freshness guards, settle waits and loop bounds match upstream. Differences:
  raw CDP over WebSocket replaces Browser Harness (private headless Chrome by default, `cdp_url` attaches to a
  running Chrome); the TYPE_TEXT helper is omp's `smol` role (`JEV_BROWSE_TEXT_MODEL` overrides), not OpenRouter;
  the inspector UI and recording scripts are not ported. `JevClient.systemOne` gives it raw answers with a 25s timeout and
  2 retries (upstream values), off the 5s hot-path client settings. Behaviour fixes (upstream drives a headed Chrome and
  never hit them): anti-throttling flags plus a foreground target in owned headless Chrome; `RESOLVE_TARGET` scrolls a
  container-clipped target into view once before the hit test; budgets end the run `blocked` with history.
- `src/spawn-router.ts` (new): `before_subagent_spawn` handler routes auto-spawned subagents to a model pattern via one
  batched Jev evaluate (clarity choice + profile choice fast/balanced/reasoning/long_context) and
  `pickModelPatternForProfile` (`src/model-router.ts`). Skips `PI_JEV_SPAWN=0`, unconfigured Jev, and spawns whose
  `patterns` the caller already set (explicit choice wins). Fail-open: any Jev error leaves the caller's default spawn.
- `src/consequence.ts` (new, wired into `src/triage.ts`): DANGEROUS_EXEC keyword match plus a Jev consequence assess
  (noul `reversible`, choice `scope` single_file/repo/system/external, `blast_radius` 0-10). Reversible >= 0.85 &&
  blast_radius <= 3 && scope=single_file auto-approves; no keyword but blast_radius >= 7 or system+reversible < 0.5
  requests approval. Fail-CLOSED on Jev errors (keyword rules still apply). `PI_JEV_CONSEQUENCE=0` /
  `/jev consequence [on|off]` (runtime override, null = env fallback).
- `src/completion.ts` (new): `session_stop` gate. Deterministic todo check (pending/in_progress/blocked always
  continue, Jev cannot override) plus Jev noul `all_tasks_done`/`premature_stop`/`verification_done` (state: last user
  prompt + last assistant text, 6000 chars each); prematureStop > 0.7 or allTasksDone < 0.7 continues with
  `additionalContext`. Skips when `stop_hook_active` (loop guard; core caps continuations at 8).
  `PI_JEV_COMPLETION=0` disables (completionOverride, null = env fallback). `verification_done` collected, ungated.
- `src/hook-install.ts` (new; `bin/jev-install-hook.js` + runner, aliases `pi-jev-hook`/`jev-hook`): writes
  `<repo>/.git/hooks/post-commit` (`exec node '<abs-bin>/jev-gate.js' <args>`, chmod 755). Flags `-c/--criteria`
  (implies `--diff`), `--force`, `--repo`, `--args`. Existing hook is skipped unless `--force`.
  Usage: `npx jev-hook -c "tests pass" --repo /path/to/repo`.
- `src/mcp-gate.ts` (new): `before_agent_start` MCP injection gate. One batched Jev evaluate with a noul question per
  MCP server (`mcp:<server>`, ≤3 tool names + 200-char description in the question, 30-server cap, task 6000 chars).
  Asymmetric thresholds: inject a server's inactive tools at p >= 0.65 (JEV_THRESHOLD), retract active ones at
  p <= 0.35 (pulling tools the user relies on is worse than missing an inactive one; dead zone 0.35-0.65 keeps the
  current state so a mediocre verdict never churns the toolset). Applied as one setActiveTools full-replace, status
  `jev: mcp +N/-M`. Standalone evaluate on purpose — folding it into the auto-mode batch would couple the gate to
  model-router's pendingQuestions. Skips `PI_JEV_MCP=0`, override off, unconfigured, empty/slash prompts, no MCP
  tools. Fail-open: Jev down → toolset untouched. `/jev mcp [on|off]` (runtime override, null = env fallback).
- `src/learn-gate.ts` (new): intercepts `tool_call` toolName === "learn". One batched evaluate (noul durable/reusable/
  novel; state lesson 6000 + context 2000 chars). decideLearn: no judgment or missing field → learn (fail-open,
  unknown is not failing); durable >= 0.65 && reusable >= 0.65 → learn; a present-but-below-threshold field →
  block `Jev learn gate: not durable or not reusable (durable X, reusable Y). Lesson skipped — memory bank kept
  clean.` + status `jev: learn gate rejected`. `novel` is informational only — never gates (reserved for future
  dedup/novelty hints). Skips `PI_JEV_LEARN=0`, override off, unconfigured, empty `input.memory`. Handler try/catch
  fail-open. `/jev learn [on|off]` (runtime override, null = env fallback).
