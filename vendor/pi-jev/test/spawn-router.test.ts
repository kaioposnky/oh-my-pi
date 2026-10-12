import test from "node:test";
import assert from "node:assert/strict";
import { decideSpawnProfile, SpawnRouter } from "../src/spawn-router.js";
import type { BeforeSubagentSpawnEvent } from "../src/spawn-router.js";

test("explicit patterns skip auto profile selection", () => {
  assert.equal(decideSpawnProfile({ patterns: ["full"] }, { clarity: "clear", profile: "fast" }), undefined);
});

test("unclear task is never auto-switched", () => {
  assert.equal(decideSpawnProfile({ patterns: [] }, { clarity: "unclear", profile: "fast" }), undefined);
});

test("returns each valid profile", () => {
  for (const profile of ["fast", "balanced", "reasoning", "long_context"]) {
    assert.equal(decideSpawnProfile({ patterns: [] }, { clarity: "clear", profile }), profile);
    assert.equal(decideSpawnProfile({ patterns: [] }, { clarity: "partially_clear", profile }), profile);
  }
});

test("unknown profile string is rejected", () => {
  assert.equal(decideSpawnProfile({ patterns: [] }, { clarity: "clear", profile: "turbo" }), undefined);
});

const model = (id: string, extra: Record<string, unknown> = {}) => ({
  id, provider: "test", name: id, api: "test", baseUrl: "", reasoning: false,
  input: ["text"],
  cost: { input: 1, output: 1, cacheRead: 0.1, cacheWrite: 1.25 },
  contextWindow: 128000, maxTokens: 4096, ...extra,
}) as any;

const spawnEvent = (overrides: Partial<BeforeSubagentSpawnEvent> = {}): BeforeSubagentSpawnEvent => ({
  type: "before_subagent_spawn",
  agent: "task",
  invocationKind: "task",
  patterns: [],
  ...overrides,
});

const mockCtx = (models: any[]) => ({
  modelRegistry: { getAvailable: () => models },
  scopedModels: [] as any[],
  signal: undefined,
}) as any;

function mockClient(answers: Record<string, any> = {}) {
  let calls = 0;
  return {
    isConfigured: () => true,
    evaluate: async () => {
      calls += 1;
      return {
        answers: {
          clarity: { type: "choice", value: "clear" },
          profile: { type: "choice", value: "reasoning" },
          ...answers,
        },
        model: "jev-latest",
        elapsedMs: 5,
      };
    },
    get calls() {
      return calls;
    },
  };
}

function install(client: any) {
  const listeners: Record<string, Function> = {};
  const pi: any = { on: (event: string, fn: Function) => { listeners[event] = fn; } };
  new SpawnRouter(client).install(pi);
  return listeners["before_subagent_spawn"];
}

test("handler routes to the profile-fitting model with a note", async () => {
  const client = mockClient();
  const handler = install(client);
  const result = await handler(spawnEvent(), mockCtx([model("plain"), model("reasoner", { reasoning: true })]));
  assert.equal(client.calls, 1);
  assert.deepEqual(result, { model: "reasoner", note: "jev: reasoning via spawn router" });
});

test("handler uses scopedModels when present", async () => {
  const client = mockClient();
  const handler = install(client);
  const ctx = { modelRegistry: { getAvailable: () => [model("registry-only")] }, scopedModels: [{ model: model("scoped-reasoner", { reasoning: true }) }], signal: undefined } as any;
  const result = await handler(spawnEvent(), ctx);
  assert.equal(result?.model, "scoped-reasoner");
});

test("explicit patterns never reach Jev", async () => {
  const client = mockClient();
  const handler = install(client);
  const result = await handler(spawnEvent({ patterns: ["full"] }), mockCtx([model("plain")]));
  assert.equal(client.calls, 0);
  assert.equal(result, undefined);
});

test("PI_JEV_SPAWN=0 disables the handler without calling Jev", async () => {
  const client = mockClient();
  const handler = install(client);
  process.env.PI_JEV_SPAWN = "0";
  try {
    const result = await handler(spawnEvent(), mockCtx([model("plain")]));
    assert.equal(client.calls, 0);
    assert.equal(result, undefined);
  } finally {
    delete process.env.PI_JEV_SPAWN;
  }
});

test("Jev failure fails open", async () => {
  const client = mockClient();
  client.evaluate = async () => {
    throw new Error("jev down");
  };
  const handler = install(client);
  const result = await handler(spawnEvent(), mockCtx([model("plain")]));
  assert.equal(result, undefined);
});

test("unconfigured client never calls Jev", async () => {
  const client = mockClient();
  client.isConfigured = () => false;
  const handler = install(client);
  const result = await handler(spawnEvent(), mockCtx([model("plain")]));
  assert.equal(client.calls, 0);
  assert.equal(result, undefined);
});

test("unclear Jev answer keeps the default spawn", async () => {
  const client = mockClient({ clarity: { type: "choice", value: "unclear" } });
  const handler = install(client);
  const result = await handler(spawnEvent(), mockCtx([model("plain")]));
  assert.equal(client.calls, 1);
  assert.equal(result, undefined);
});
