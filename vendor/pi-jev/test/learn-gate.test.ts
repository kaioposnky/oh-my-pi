import test from "node:test";
import assert from "node:assert/strict";
import { decideLearn, LearnGate, learnOverride } from "../src/learn-gate.js";

test("decideLearn fails open when jev is undefined", () => {
  assert.deepEqual(decideLearn(undefined), { learn: true });
});

test("decideLearn learns at the exact threshold boundary", () => {
  assert.deepEqual(decideLearn({ durable: 0.65, reusable: 0.65 }), { learn: true });
});

test("decideLearn rejects below threshold and reports both values", () => {
  const d = decideLearn({ durable: 0.64, reusable: 0.9 });
  assert.equal(d.learn, false);
  assert.match(d.reason!, /not durable or not reusable \(durable 0\.64, reusable 0\.90\)/);
});

test("decideLearn rejects when reusable is low", () => {
  const d = decideLearn({ durable: 0.9, reusable: 0.3 });
  assert.equal(d.learn, false);
  assert.match(d.reason!, /durable 0\.90, reusable 0\.30/);
});

test("decideLearn never gates on novel", () => {
  assert.deepEqual(decideLearn({ durable: 0.9, reusable: 0.9, novel: 1 }), { learn: true });
});

test("decideLearn treats a missing field as unknown (fail-open on partial data)", () => {
  assert.deepEqual(decideLearn({ durable: 0.9 }), { learn: true });
  assert.deepEqual(decideLearn({ reusable: 0.9 }), { learn: true });
});

test("decideLearn still rejects when a present field fails", () => {
  const d = decideLearn({ durable: 0.64 });
  assert.equal(d.learn, false);
  assert.match(d.reason!, /durable 0\.64, reusable \?/);
});

type Handler = (event: any, ctx: any) => Promise<any>;

function learnHarness(answers: Record<string, any>, evaluate?: (req: any) => any) {
  let handler: Handler | undefined;
  const pi: any = { on: (name: string, h: Handler) => { if (name === "tool_call") handler = h; } };
  const requests: any[] = [];
  const statuses: string[] = [];
  const jevClient = {
    isConfigured: () => true,
    evaluate: evaluate ?? (async (req: any) => {
      requests.push(req);
      return { answers, model: "jev-latest", elapsedMs: 5 };
    }),
  } as any;
  new LearnGate(jevClient).install(pi as any);
  const ctx = { ui: { setStatus: (_s: string, t: string) => statuses.push(t) }, signal: undefined };
  const call = (toolName: string, input: any) => handler!( { toolName, input }, ctx);
  return { call, requests, statuses };
}

test("learn gate passes a durable, reusable lesson", async () => {
  const { call, requests } = learnHarness({ durable: { value: 0.9 }, reusable: { value: 0.9 }, novel: { value: 0.2 } });
  const res = await call("learn", { memory: "deploy via pnpm release", context: "repo root" });
  assert.equal(res, undefined);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].state.lesson, "deploy via pnpm release");
});

test("learn gate blocks an ephemeral lesson with the gate reason", async () => {
  const { call, statuses } = learnHarness({ durable: { value: 0.9 }, reusable: { value: 0.3 } });
  const res = await call("learn", { memory: "current task list", context: "" });
  assert.deepEqual(res, {
    block: true,
    reason: "Jev learn gate: not durable or not reusable (durable 0.90, reusable 0.30). Lesson skipped — memory bank kept clean.",
  });
  assert.ok(statuses.includes("jev: learn gate rejected"));
});

test("learn gate passes on partial data (reusable undefined)", async () => {
  const { call } = learnHarness({ durable: { value: 0.9 } });
  assert.equal(await call("learn", { memory: "lesson" }), undefined);
});

test("learn gate fails open when evaluate throws", async () => {
  const { call } = learnHarness({}, async () => { throw new Error("boom"); });
  assert.equal(await call("learn", { memory: "lesson" }), undefined);
});

test("learn gate never evaluates non-learn tools", async () => {
  const { call, requests } = learnHarness({ durable: { value: 0.1 } });
  assert.equal(await call("bash", { command: "ls" }), undefined);
  assert.equal(requests.length, 0);
});

test("learn gate skips when disabled via PI_JEV_LEARN=0", async () => {
  process.env.PI_JEV_LEARN = "0";
  try {
    const { call, requests } = learnHarness({ durable: { value: 0.1 } });
    assert.equal(await call("learn", { memory: "lesson" }), undefined);
    assert.equal(requests.length, 0);
  } finally {
    delete process.env.PI_JEV_LEARN;
  }
});

test("learn gate skips when learnOverride is false", async () => {
  learnOverride.enabled = false;
  try {
    const { call, requests } = learnHarness({ durable: { value: 0.1 } });
    assert.equal(await call("learn", { memory: "lesson" }), undefined);
    assert.equal(requests.length, 0);
  } finally {
    learnOverride.enabled = null;
  }
});

test("learn gate passes through empty memory without evaluating", async () => {
  const { call, requests } = learnHarness({ durable: { value: 0.1 } });
  assert.equal(await call("learn", {}), undefined);
  assert.equal(await call("learn", { memory: "" }), undefined);
  assert.equal(requests.length, 0);
});
