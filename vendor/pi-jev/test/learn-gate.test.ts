import test from "node:test";
import assert from "node:assert/strict";
import { decideLearn } from "../src/learn-gate.js";

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
