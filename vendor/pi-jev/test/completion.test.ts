import test from "node:test";
import assert from "node:assert/strict";
import { decideCompletion } from "../src/completion.js";

const clean = { phases: [{ name: "p1", tasks: [{ content: "done thing", status: "done" }] }] };
const pending = {
  phases: [
    {
      name: "p1",
      tasks: [
        { content: "first", status: "done" },
        { content: "second", status: "pending" },
        { content: "third", status: "in_progress" },
        { content: "fourth", status: "blocked" },
      ],
    },
  ],
};

test("incomplete todos force continuation regardless of Jev", () => {
  assert.deepEqual(decideCompletion(pending), { continueSession: true, reason: "todos pending: second, third, fourth" });
  assert.deepEqual(decideCompletion(pending, { allTasksDone: 0.95, prematureStop: 0.0 }), {
    continueSession: true,
    reason: "todos pending: second, third, fourth",
  });
});

test("clean todos + Jev premature stop above 0.7 continues", () => {
  assert.deepEqual(decideCompletion(clean, { prematureStop: 0.85 }), {
    continueSession: true,
    reason: "Jev flagged premature stop (0.85)",
  });
});

test("clean todos + allTasksDone below 0.7 continues", () => {
  assert.deepEqual(decideCompletion(clean, { allTasksDone: 0.5 }), {
    continueSession: true,
    reason: "Jev doubts task completion (0.5)",
  });
});

test("boundaries: exactly 0.7 does not continue (strict > / <)", () => {
  assert.deepEqual(decideCompletion(clean, { prematureStop: 0.7, allTasksDone: 1 }), { continueSession: false });
  assert.deepEqual(decideCompletion(clean, { allTasksDone: 0.7 }), { continueSession: false });
});

test("prematureStop 0.69 does not continue from that rule", () => {
  assert.deepEqual(decideCompletion(clean, { prematureStop: 0.69 }), { continueSession: false });
});

test("clean + confident Jev verdict does not continue", () => {
  assert.deepEqual(decideCompletion(clean, { allTasksDone: 0.95, verificationDone: 0.9 }), { continueSession: false });
});

test("no Jev + clean todos fails open", () => {
  assert.deepEqual(decideCompletion(clean), { continueSession: false });
});
