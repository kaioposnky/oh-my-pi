# Jev Semantic Verification — Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add four Jev (System One) integrations to the vendored `vendor/pi-jev` extension: semantic subagent routing, consequence-gated tool approvals, completion verification at agent end (todo + semantic), and a local post-commit git hook gate.

**Architecture:** All features are additive modules inside `vendor/pi-jev/src/` wired in `vendor/pi-jev/extensions/index.ts` via existing omp extension events (`before_subagent_spawn`, `tool_call`, `agent_end`/`session_stop`). Every Jev call fails open (never blocks the agent when Jev is unconfigured/timing out). Deterministic keyword/policy rules remain and may only be *stricter* than Jev, mirroring the existing `triage.ts` doctrine.

**Tech Stack:** TypeScript (ESM, `node:test`), `@typesafe-ai/sdk` (already vendored), omp `ExtensionAPI` events. No new dependencies. No core (`packages/coding-agent`) changes.

**Branch:** `jev/semantic-verification` (created from `truncated-tool-names` @ `ad09ff8b3e`).

**Repo root for all paths:** `/media/kaio/9EA6BABAA6BA91EF/Users/kposa/repos/harnesses-improver/oh-my-pi` (below: `$REPO`).

**Test command:** `cd $REPO/vendor/pi-jev && bun run test` (runs `node --test --import tsx test/*.test.ts`).

**Established conventions to follow (from existing code):**
- Fail-open: every Jev call wrapped in try/catch; Jev failure degrades to keyword-only behavior.
- Thresholds: reuse `JEV_THRESHOLD` (0.65) from `src/skills.ts` as the single act/reject cutoff unless a task defines its own named constant.
- One batched `JevClient.evaluate({ state, questions })` request per hook — questions run in parallel server-side.
- Env toggles follow `PI_JEV_*` naming, default-on is allowed only for gates (like triage/approval); routing/verification helpers default on but silently no-op when unconfigured.
- Status line via `ctx.ui.setStatus("jev", ...)`.

---

## Feature 1 — `before_subagent_spawn`: Jev chooses the subagent model

The core fires `before_subagent_spawn` with `{ agent, invocationKind, modelRole, patterns, spawnKey }`. The result may set `model` (replacement patterns), `block`, `reason`, or `note`. Today pi-jev ignores this event; `agents.dispatch` uses a hardcoded regex in `extensions/index.ts:146`.

**Design:** New file `src/spawn-router.ts` exporting class `SpawnRouter`. On `before_subagent_spawn`:
1. Skip when Jev unconfigured, event has an explicit `modelRole` set by the caller with explicit selector (respect caller intent), or `patterns` already explicit (non-empty → user asked for a specific model).
2. Ask Jev one Choice question: "Which model profile does this subagent task need?" with criteria `fast` / `balanced` / `reasoning` / `long_context` (same profile vocabulary as `src/model-router.ts` — import `ModelProfile` type from there).
3. Map the winning profile to a model pattern using the **existing** model-router scoring: reuse `classifyModelNeed`-style capability fit — simplest correct approach: export a new helper `pickModelPatternForProfile(profile, ctx.modelRegistry)` in `src/model-router.ts` that scores `ctx.models.available()` (verify exact API on implementation; fallback: read candidate ids from `ctx.modelRegistry`) and returns the best-fitting model's id pattern. If no candidate resolves, return `undefined` (no override).
4. Return `{ model: <pattern>, note: "jev: profile via spawn router" }`.

Env toggle: `PI_JEV_SPAWN=0` disables. Default on. Never blocks (`block` unused — refusal is not Jev-shaped here).

### Task 1.1: Write failing tests for SpawnRouter decision logic

**Objective:** Pure decision function is testable without omp context.

**Files:**
- Create: `vendor/pi-jev/test/spawn-router.test.ts`
- Create: `vendor/pi-jev/src/spawn-router.ts`

**Step 1: Write failing test**

```typescript
// test/spawn-router.test.ts
import test from "node:test";
import assert from "node:assert/strict";
import { decideSpawnProfile } from "../src/spawn-router.js";

test("returns undefined when caller passed explicit patterns", () => {
  assert.equal(decideSpawnProfile({ patterns: ["anthropic/claude-*"] }, { clarity: "clear", profile: "fast" }), undefined);
});

test("maps Jev choice to profile when routing is allowed", () => {
  const r = decideSpawnProfile({ patterns: [] }, { clarity: "clear", profile: "reasoning" });
  assert.equal(r, "reasoning");
});

test("returns undefined when Jev is uncertain about clarity", () => {
  assert.equal(decideSpawnProfile({ patterns: [] }, { clarity: "unclear", profile: "fast" }), undefined);
});
```

**Step 2: Run** `cd vendor/pi-jev && node --test --import tsx test/spawn-router.test.ts` — Expected: FAIL (module missing).

**Step 3: Implement decision core**

```typescript
// src/spawn-router.ts
export type SpawnProfile = "fast" | "balanced" | "reasoning" | "long_context";

export function decideSpawnProfile(
  event: { patterns: string[] },
  jev: { clarity: string; profile: string },
): SpawnProfile | undefined {
  if (event.patterns.length > 0) return undefined; // caller chose explicitly
  if (jev.clarity === "unclear") return undefined;  // don't route on guesswork
  const valid: SpawnProfile[] = ["fast", "balanced", "reasoning", "long_context"];
  return valid.includes(jev.profile as SpawnProfile) ? (jev.profile as SpawnProfile) : undefined;
}
```

**Step 4: Run test — PASS. Step 5: Commit** `feat(pi-jev): spawn router decision core`.

### Task 1.2: Profile → model pattern resolution

**Objective:** Map a profile to a concrete model pattern from the live model registry.

**Files:**
- Modify: `vendor/pi-jev/src/model-router.ts` (append `pickModelPatternForProfile`)
- Test: append cases to `vendor/pi-jev/test/model-router.test.ts`

**Step 1: Failing test** — fake registry with two models `{ id: "a", cost: {...}, capabilities }`; assert `fast` picks cheapest fitting, `reasoning` picks the reasoning-capable one, empty registry returns `undefined`.

**Step 2: Run — FAIL. Step 3: Implement** minimal scorer reusing existing `capabilityFit` + `hasKnownCost` from the same file. **Step 4: Run — PASS. Step 5: Commit.**

### Task 1.3: Wire `pi.on("before_subagent_spawn")` in extensions/index.ts

**Objective:** Connect event to SpawnRouter with Jev evaluate call.

**Files:**
- Modify: `vendor/pi-jev/extensions/index.ts` (in default export, after `triage.install(pi)`)
- Modify: `vendor/pi-jev/src/spawn-router.ts` (add `install(pi, jevClient)` method)

**Implementation sketch:**

```typescript
// in install(pi, jevClient):
pi.on("before_subagent_spawn", async (event, ctx) => {
  if (process.env.PI_JEV_SPAWN?.trim() === "0") return;
  if (!jevClient.isConfigured()) return;
  try {
    const { answers } = await jevClient.evaluate({
      state: { agent: event.agent, task_context: event.spawnKey ?? event.agent },
      questions: {
        clarity: { type: "choice", instructions: "Is the subagent's task definition clear enough to route?",
          criteria: { clear: "...", unclear: "..." } },
        profile: { type: "choice", instructions: "Which model profile fits this subagent task?",
          criteria: { fast: "Mechanical edits, trivial transforms", balanced: "General coding tasks",
            reasoning: "Complex debugging, architecture, algorithms", long_context: "Large-file or repo-wide analysis" } },
      },
    }, ctx.signal as AbortSignal | undefined);
    const profile = decideSpawnProfile(event, { clarity: String(answers.clarity?.value), profile: String(answers.profile?.value) });
    if (!profile) return;
    const pattern = pickModelPatternForProfile(profile, ctx);
    if (!pattern) return;
    return { model: pattern, note: `jev: ${profile} via spawn router` };
  } catch { return; } // fail open
});
```

Signal type: verify `ctx.signal` exists on this event's ctx (it does for spawn hooks — runner passes the spawn's abort signal). If not present in the type, omit it.

**Test:** extend `spawn-router.test.ts` with a mock `pi` (pattern from `test/agent.test.ts` — mock `{ on: (name, fn) => { listeners[name] = fn } }`) firing the handler with a stubbed `jevClient.evaluate`; assert returned `model`/`note`, and `undefined` when `PI_JEV_SPAWN=0`.

**Commit:** `feat(pi-jev): route subagent model choice via before_subagent_spawn`.

---

## Feature 2 — Consequence-gated tool approvals

Today `triage.ts` approval gate is keyword-binary (`DANGEROUS_EXEC` → always ask). Upgrade: keep keywords as the *floor*, add a Jev consequence check so low-consequence matches auto-approve and high-consequence non-matching calls still get flagged.

**Design:** New file `src/consequence.ts` exporting `assessConsequence(toolName, input)`:

1. Input `input` serialized to JSON, truncated to ~4k chars.
2. One batched Jev request, three questions:
   - `reversible` (noul): "Is this operation reversible without data loss?"
   - `scope` (choice): `single_file` / `repo` / `system` / `external`
   - `blast_radius` (score 0–10): "How much damage if this is wrong?"
3. Decision function `decideApproval(keywordRisky, jev)` — pure, testable:
   - keyword match + `reversible ≥ 0.85` + `blast_radius ≤ 3` + `scope = single_file` → allow (skip prompt)
   - keyword match otherwise → require approval (unchanged)
   - no keyword match + `blast_radius ≥ 7` or `scope = system` with `reversible < 0.5` → require approval (new catch)
   - else → allow (current behavior)
4. Env: `PI_JEV_CONSEQUENCE=0` disables (falls back to today's keyword-only).

### Task 2.1: Failing tests for decideApproval (pure function)

**Files:** Create `vendor/pi-jev/test/consequence.test.ts`, `vendor/pi-jev/src/consequence.ts`.

Write the 4-row decision table above as tests (mock jev answers). Run FAIL → implement `decideApproval` only → PASS → commit `feat(pi-jev): consequence decision core`.

### Task 2.2: Jev assessConsequence + wire into Triage.install tool_call path

**Files:**
- Modify: `vendor/pi-jev/src/consequence.ts` (add `assessConsequence(jevClient, toolName, input, signal)`)
- Modify: `vendor/pi-jev/src/triage.ts` — in the existing `pi.on("tool_call")` handler (line ~131), after `DANGEROUS_EXEC` matches and before returning approval request, call `assessConsequence`; on Jev failure keep approval (fail *closed* here — this is the security path).
- Test: `vendor/pi-jev/test/consequence.test.ts` — mock client, assert auto-allow path and fail-closed path.

**Commit:** `feat(pi-jev): consequence-gated approvals in triage`.

### Task 2.3: Status + command toggle

**Files:** Modify `vendor/pi-jev/src/commands.ts` — add `/jev consequence [on|off]` alongside existing triage/approval toggles; include in help string.

**Commit:** `feat(pi-jev): /jev consequence toggle`.

---

## Feature 3 — Completion verification at agent end (todos + semantic)

User's ask: "verificacao para checar se todas as tarefas foram finalizadas". Two layers:

**3a. Deterministic todo check (no Jev):** at `agent_end` (skip when `willContinue`), read todos from session entries via existing exported helper `getLatestTodoPhasesFromEntries(ctx.sessionManager.getEntries())` (both exported from `packages/coding-agent/src/tools/todo.ts` and `session-manager.ts` — verified). If any `pending`/`in_progress`/`blocked` tasks exist and the agent claims completion, inject a continuation message listing unfinished tasks.

**3b. Semantic completion check (Jev):** the todo list doesn't capture "did you actually do what was asked". At `agent_end` (top-level session only — subagent sessions don't fire our handler per omp's own session_stop guard), build state from the last user prompt + last assistant message, one batched request:
- `all_tasks_done` (noul): "Does the final response indicate all requested work was completed?"
- `verification_done` (noul): "Did the agent verify its work (tests run, files checked)?"
- `premature_stop` (noul): "Is there requested-but-unaddressed work?"

Decision: if any noul ≥ `0.7` failure-side (i.e. `all_tasks_done < 0.7` or `premature_stop > 0.7`) AND deterministic todos pass → inject continuation: `additionalContext` describing what Jev flagged. Cap: rely on omp's `SESSION_STOP_CONTINUATION_CAP` (8) — do not add our own loop guard beyond a per-prompt check that we only continue once per prompt generation (track last prompt hash in module state).

**Event choice:** use `session_stop` (has `SessionStopEventResult.continue/additionalContext` — verified at `shared-events.ts:495`) rather than `agent_end` (no result shape). `session_stop` already powers Claude-style stop hooks in omp; subagent sessions are excluded by core itself (`agent-session.ts:4765`).

### Task 3.1: Failing tests for completion decision (pure)

**Files:** Create `vendor/pi-jev/test/completion.test.ts`, `vendor/pi-jev/src/completion.ts`.

```typescript
test("incomplete todos force continuation regardless of Jev", () => {
  const d = decideCompletion(
    { phases: [{ name: "p", tasks: [{ content: "x", status: "in_progress" }] }] },
    { allTasksDone: 0.95, verificationDone: 0.9, prematureStop: 0.1 },
  );
  assert.equal(d.continue, true);
  assert.match(d.reason ?? "", /todo/i);
});
test("jev premature stop with clean todos continues", () => {
  const d = decideCompletion({ phases: [] }, { allTasksDone: 0.9, verificationDone: 0.8, prematureStop: 0.85 });
  assert.equal(d.continue, true);
});
test("clean todos + confident Jev passes", () => {
  const d = decideCompletion({ phases: [] }, { allTasksDone: 0.95, verificationDone: 0.9, prematureStop: 0.05 });
  assert.equal(d.continue, false);
});
```

Run FAIL → implement `decideCompletion` → PASS → commit `feat(pi-jev): completion decision core`.

### Task 3.2: Install `session_stop` handler

**Files:**
- Modify: `vendor/pi-jev/src/completion.ts` (add `CompletionVerifier.install(pi, jevClient)`)
- Modify: `vendor/pi-jev/extensions/index.ts` (instantiate + install)
- Test: mock-pi pattern; fire handler with fake messages array (use `{ role: "user", content: "do X" }` + assistant) — assert `continue: true` + `additionalContext` content; assert no-op when `PI_JEV_COMPLETION=0`.

**Implementation notes:**
- Extract last user prompt + last assistant text from `event.messages` (roles `user`/`assistant`, content may be string or content-parts array — normalize like `textOf` in `compact.ts`).
- Todos: `getLatestTodoPhasesFromEntries(ctx.sessionManager.getEntries())` — wrap in try/catch, treat failure as "no todos".
- Continuation message content: terse, actionable: `Completion check: todos pending: <contents>` or `Completion check: Jev flagged premature stop (0.85) — re-check: <question hint>`.
- Skip when `event.stop_hook_active === true` (prevents loops — core re-fires with this flag during continuations).
- Status: `ctx.ui.setStatus("jev", "jev: completion check failed → continuing")`.

**Commit:** `feat(pi-jev): completion verification gate at session stop`.

---

## Feature 4 — Post-commit git hook gate (jev-gate local)

`vendor/pi-jev/bin/jev-gate.js` + `src/gate.ts` exist (diff/file/stdin vs criteria, exit 0/1/2, `--fail-open`). Gap: nothing installs it as a local git hook.

**Design:** New small script `vendor/pi-jev/bin/jev-install-hook.js` (+ npm script `"jev-hook"`): writes `.git/hooks/post-commit` in the *current* repo that calls `jev-gate` with criteria from `.jev-gate.md` (repo-root file, first non-comment line = criteria) or `-c` args at install time. Idempotent: marker comment `# installed by jev-install-hook`; refuse overwrite without `--force`.

### Task 4.1: Script + test

**Files:**
- Create: `vendor/pi-jev/bin/jev-install-hook.js`, `vendor/pi-jev/src/hook-install.ts`
- Modify: `vendor/pi-jev/package.json` (scripts: `"jev-hook": "node bin/jev-install-hook.js"`; bin: `"pi-jev-hook": ...`)
- Create: `vendor/pi-jev/test/hook-install.test.ts` — write hook into a temp git repo (mkdtemp), assert file content contains marker + jev-gate call, assert refusal on second run without `--force`, overwrite with it.

**Commit:** `feat(pi-jev): local post-commit hook installer for jev-gate`.

### Task 4.2: Self-verify on this repo

Run: `cd $REPO && node vendor/pi-jev/bin/jev-install-hook.js --force -c "Commit message describes the change and no secrets in diff" -d` inside a **temp clone** (never hook the fork's own repo without Kaio asking). Verify exit 0 on a clean commit, exit 1 when criteria unmet (simulate by criteria "diff is empty"). Then `rm` the temp clone.

---

## Final tasks

### Task 5.1: Full test suite + typecheck

Run: `cd vendor/pi-jev && bun run typecheck && bun run test` — all green.

### Task 5.2: Docs

- Modify: `vendor/pi-jev/VENDORED.md` — append local-changes entries for the 4 features (follows existing bullet style: file names, env toggles, behavior notes).
- Modify: `vendor/pi-jev/README.md` — one section per feature with env toggles table.

**Commit:** `docs(pi-jev): semantic verification features`.

### Task 5.3: Smoke against live Jev (requires TYPESAFE_API_KEY)

`/jev status` inside omp, then one prompt each exercising: spawn routing (`task` tool), completion gate (ask agent to do a 2-item todo and watch continuation), consequence gate (a `rm -rf` on a temp dir — expect approval despite reversibility doubt). If no API key available locally, mark as pending for Kaio.

---

## Risk notes

- `session_stop` continuation loops: core caps at 8 + we skip when `stop_hook_active`; Jev failure = no continuation (fail open).
- Consequence auto-approval is the only *relaxing* change: keyword floor stays; auto-allow only for reversible + single_file + blast ≤ 3. Fail-closed on Jev errors.
- Spawn routing never blocks; explicit user model patterns always win.
- No core changes; everything lives in the vendored extension (rebuilt via fork release ops as usual).
