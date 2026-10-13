# Jev Context Gating — F6 MCP Injection + F5 Learn Gate

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Two new Jev gates in `vendor/pi-jev`: (F6) decide per-prompt whether MCP server tools belong in the active toolset — keeping unused MCP tools out of the prompt saves context and cache misses on every request; (F5) intercept `learn` tool calls and drop lessons that are not durable/reusable — memory bank quality filter.

**Architecture:** Both follow the established extension pattern: pure decision functions (TDD), one batched `JevClient.evaluate` per hook, fail-open (F5 keeps current learn behavior when Jev is down; F6 keeps MCP tools active when Jev is down — never breaks a working session). F6 folds its server questions into the existing auto-route batch when auto mode is on; standalone evaluate otherwise. No core changes.

**Tech Stack:** TypeScript ESM, node:test + tsx, `@typesafe-ai/sdk`. No new deps.

**Branch:** `jev/semantic-context` (create from `jev/semantic-verification` @ `f4764aed93`).

**Repo root:** `/media/kaio/9EA6BABAA6BA91EF/Users/kposa/repos/harnesses-improver/oh-my-pi` (below: `$REPO`).

**Test command:** `cd $REPO/vendor/pi-jev && ~/.bun/bin/bun run test` / `~/.bun/bin/bun run typecheck`.

**Verified core facts (implementation relies on these):**
- MCP tools are named `mcp__<server>_<tool>`; `packages/coding-agent/src/tools/builtin-names.ts:67` exports the prefix check (`name.startsWith("mcp__")`) — in pi-jev, replicate as a tiny local helper (do NOT import core source).
- `pi.setActiveTools(names)` full-replaces; removal pattern (`.filter`) proven by `autoresearch/index.ts:150`.
- `pi.getAllTools(): ToolInfo[]` includes MCP tools; `ToolInfo.sourceInfo.source === "mcp"` and `sourceInfo.path` is `mcp:<server>`.
- `learn` is a regular tool call; `event.toolName === "learn"`, input schema `{ memory, context?, scope?, skill? }` (memory = the lesson text).
- `src/auto.ts` has `pendingQuestions` + folds extras into the batched request (`ModelJudgmentContribution` pattern).

---

## Feature 6 — MCP injection gate (implement FIRST)

New file `src/mcp-gate.ts`:

```typescript
export function mcpServerOf(toolName: string): string | undefined; // "mcp__srv_tool" → "srv" (strip after 2nd underscore segment)
export interface McpGatePlan {
  servers: Array<{ server: string; tools: string[] }>; // active-set tool names grouped by server
  inject: string[];   // tool names to ADD (servers Jev approved, currently inactive)
  retract: string[];  // tool names to REMOVE (servers Jev rejected, currently active)
}
export function planMcpGate(active: string[], allMcpTools: Array<{ name: string }>, approved: Set<string>): McpGatePlan;
```

`planMcpGate` pure: group by server; server in `approved` → its inactive tools go to `inject`, `retracted` servers' tools leave. Empty `allMcpTools` → `{ servers: [], inject: [], retract: [] }` (fast path, no Jev call).

Class `McpGate`:
- `public enabled`: env `PI_JEV_MCP` — default **on**, `=0` off. Plus runtime override object `mcpOverride: { enabled: boolean | null }` (mirror consequenceOverride/completionOverride).
- `install(pi)`:
  - On `before_agent_start` (after existing triage/routing — wire in `extensions/index.ts` inside/after `route()`):
    1. Collect MCP tools: `pi.getAllTools().filter(t => t.name.startsWith("mcp__"))`; if none → return.
    2. One Jev call (standalone `evaluate`, or folded into auto batch when `auto.enabled` — implement standalone first; folding is a bonus task 6.4): state = user prompt (6000 chars), one noul question per server: `mcp:<server>` → "Does this task need the tools from the '<server>' MCP server (description: <first 200 chars of one tool description>)?"
    3. `approved = servers with noul >= JEV_THRESHOLD (0.65)`.
    4. `planMcpGate(active, mcpTools, approved)` → if inject/retract non-empty: `pi.setActiveTools(current.filter(n => !retractSet.has(n)).concat(inject))`; status `ctx.ui.setStatus("jev", "jev: mcp +X/-Y")`.
    5. try/catch all → on failure **leave toolset untouched** (fail-open keeps MCP active).
  - Skip when prompt starts with "/" (slash command), same as triage.
  - Question count guard: > 30 servers → evaluate only the first 30 by tool count (state-size guard; log via status once).

### Task 6.1 — pure core (TDD)
`test/mcp-gate.test.ts`: `mcpServerOf` (`mcp__srv_tool` → `srv`; `mcp__a_b_c` → `a`; non-mcp → undefined). `planMcpGate`: approved server's inactive tools injected; rejected active server's tools retracted; empty mcp tools fast path; same-state no-op (both empty). FAIL → implement → PASS → commit `feat(pi-jev): mcp gate decision core`.

### Task 6.2 — McpGate handler + wiring (TDD)
Tests: mock pi (listeners + getAllTools/getActiveTools/setActiveTools recording); Jev mock approving one server, rejecting another → setActiveTools called with correct diff; Jeval throw → setActiveTools NOT called; `PI_JEV_MCP=0` (try/finally) → no evaluate call; no mcp tools → no evaluate; >30 servers → only 30 questions; slash prompt → no evaluate. Wire `const mcpGate = new McpGate(jevClient); mcpGate.install(pi);` in `extensions/index.ts` after spawnRouter/completion installs; call its `route(prompt, ctx)` inside the `before_agent_start` flow (after `route()` resolves — independent await, own try/catch). FAIL → implement → PASS → commit `feat(pi-jev): mcp injection gate`.

### Task 6.3 — `/jev mcp [on|off]` toggle
commands.ts subcommand + help/status strings, mirror consequence toggle; tests for override vs env. Commit `feat(pi-jev): /jev mcp toggle`.

### Task 6.4 — fold into auto batch (bonus, only if clean)
When `auto.enabled`, contribute `mcp:<server>` noul questions via `auto.pendingQuestions` instead of standalone evaluate; consume answers in the same `before_agent_start` pass. If the plumbing is awkward (pendingQuestions is model-router-specific), skip — standalone is correct and cheap. Commit `feat(pi-jev): fold mcp questions into auto batch` or document skip.

## Feature 5 — learn gate

New file `src/learn-gate.ts`:

```typescript
export interface LearnJev { durable?: number; reusable?: number; novel?: number }
export interface LearnDecision { learn: boolean; reason?: string }
export function decideLearn(jev?: LearnJev): LearnDecision;
```

Rules: `jev` undefined → `{ learn: true }` (fail-open: current behavior). `durable >= 0.65 && reusable >= 0.65` → learn (novel < 0.4 informational only — do NOT gate on it; lessons can be worth re-learning). Else → `{ learn: false, reason: "not durable or not reusable (<thresholds>)" }`.

Class `LearnGate`:
- env `PI_JEV_LEARN` default on; `learnOverride` runtime object.
- `install(pi)`: `pi.on("tool_call", ...)`: `event.toolName === "learn"` only. State: `{ lesson: input.memory (6000 chars), context: input.context ?? "" }`. Questions: durable ("Is this a durable fact/convention about the project or environment, not transient task state?"), reusable ("Will this lesson be useful in future sessions on other tasks?"), novel ("Is this already obvious/implied by the codebase or context?"). Decision → block: `{ block: true, reason: "Jev learn gate: <reason>. Lesson skipped — memory bank kept clean." }`; status `ctx.ui.setStatus("jev", "jev: learn gate rejected")`. Pass → undefined (learn proceeds).
- try/catch → undefined (fail-open learn).

### Task 5.1 — decideLearn pure (TDD)
Boundaries: both 0.65 exactly → learn; durable 0.6 → reject; undefined jev → learn; reject reason contains both values. FAIL → implement → PASS → commit `feat(pi-jev): learn gate decision core`.

### Task 5.2 — handler + wiring (TDD)
Mock tests: good lesson (0.9/0.9) → not blocked; ephemeral (0.3 reusable) → blocked with reason; evaluate throws → not blocked; non-learn tool → no evaluate call; PI_JEV_LEARN=0 → no evaluate. Wire in index.ts after mcpGate. Commit `feat(pi-jev): learn gate intercepts memory writes`.

### Task 5.3 — `/jev learn [on|off]` toggle
Mirror 6.3. Commit `feat(pi-jev): /jev learn toggle`.

## Final

### Task 7.1 — suite + typecheck + integration pass
Full suite (~200+), typecheck clean. Review diff: every new module fail-open (or documented fail-closed), no core file touched, no new deps.

### Task 7.2 — docs
VENDORED.md +2 bullets; README +2 feature blocks + 2 subcommands. Commit `docs(pi-jev): context gating features`.

## Risk notes
- F6 removal risk: if Jev wrongly retracts a needed server, agent loses tools mid-task. Mitigations: fail-open on error, threshold 0.65 errs toward keeping (rejection needs *confidence* below threshold... no — noul < 0.65 retracts). Safer default: only RETRACT when noul <= 0.35 (strong no); inject at >= 0.65. Implement `planMcpGate` with asymmetric thresholds: inject >= 0.65, retract <= 0.35, between = leave as-is. Tests cover the dead zone.
- F5 false rejects lose a lesson: reason string tells the agent why; agent can rephrase or user can toggle. Fail-open on Jev down.
- Both default ON but no-op when Jev unconfigured — zero behavior change for keyless users.
