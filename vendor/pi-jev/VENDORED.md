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
