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

// --- CompletionVerifier (session_stop handler) ---

import { CompletionVerifier, extractTodoPhases, completionOverride } from "../src/completion.js";
import type { SessionStopEvent } from "../src/completion.js";

const stopEvent = (overrides: Partial<SessionStopEvent> = {}): SessionStopEvent => ({
  type: "session_stop",
  messages: [
    { role: "user", content: "do the work", timestamp: 1 },
    { role: "assistant", content: [{ type: "text", text: "all done" }], timestamp: 2 },
  ],
  turn_id: 1,
  session_id: "s",
  stop_hook_active: false,
  signal: undefined,
  ...overrides,
});

const confidentAnswers = {
  all_tasks_done: { type: "noul", value: 0.95 },
  premature_stop: { type: "noul", value: 0.05 },
  verification_done: { type: "noul", value: 0.9 },
};

function mockJev(answers: Record<string, any> = confidentAnswers, opts: { configured?: boolean; throws?: boolean } = {}) {
  let calls = 0;
  return {
    isConfigured: () => opts.configured ?? true,
    evaluate: async () => {
      calls += 1;
      if (opts.throws) throw new Error("jev down");
      return { answers, model: "jev-latest", elapsedMs: 5 };
    },
    get calls() {
      return calls;
    },
  };
}

function install(client: any) {
  const listeners: Record<string, Function> = {};
  const pi: any = { on: (event: string, fn: Function) => { listeners[event] = fn; } };
  new CompletionVerifier(client).install(pi);
  return listeners["session_stop"];
}

function mockCtx() {
  const statuses: string[] = [];
  return {
    ctx: {
      ui: { setStatus: (_: string, s: string) => { statuses.push(s); } },
      sessionManager: { getEntries: () => [] as any[] },
      signal: undefined,
    } as any,
    statuses,
  };
}

test("premature stop flagged by Jev continues with additionalContext", async () => {
  const client = mockJev({ ...confidentAnswers, premature_stop: { type: "noul", value: 0.85 } });
  const handler = install(client);
  const { ctx, statuses } = mockCtx();
  const result = await handler(stopEvent(), ctx);
  assert.equal(client.calls, 1);
  assert.equal(result?.continue, true);
  assert.match(result?.additionalContext ?? "", /premature/i);
  assert.match(result?.additionalContext ?? "", /before finishing/);
  assert.match(statuses[0] ?? "", /completion check failed/);
});

test("stop_hook_active skips everything", async () => {
  const client = mockJev();
  const handler = install(client);
  const { ctx } = mockCtx();
  const result = await handler(stopEvent({ stop_hook_active: true }), ctx);
  assert.equal(client.calls, 0);
  assert.equal(result, undefined);
});

test("PI_JEV_COMPLETION=0 disables the gate", async () => {
  const client = mockJev();
  const handler = install(client);
  const { ctx } = mockCtx();
  process.env.PI_JEV_COMPLETION = "0";
  try {
    const result = await handler(stopEvent(), ctx);
    assert.equal(client.calls, 0);
    assert.equal(result, undefined);
  } finally {
    delete process.env.PI_JEV_COMPLETION;
  }
});

test("Jev evaluate throwing fails open without throwing", async () => {
  const client = mockJev({}, { throws: true });
  const handler = install(client);
  const { ctx } = mockCtx();
  const result = await handler(stopEvent(), ctx);
  assert.equal(result, undefined);
});

test("unconfigured + no todos never calls Jev", async () => {
  const client = mockJev({}, { configured: false });
  const handler = install(client);
  const { ctx } = mockCtx();
  const result = await handler(stopEvent(), ctx);
  assert.equal(client.calls, 0);
  assert.equal(result, undefined);
});

const todoToolResult = {
  role: "toolResult",
  toolCallId: "t1",
  toolName: "todo",
  content: [{ type: "text", text: "ok" }],
  details: {
    op: "update",
    phases: [
      { name: "p1", tasks: [{ content: "first", status: "done" }, { content: "second", status: "pending" }] },
    ],
  },
  isError: false,
  timestamp: 3,
};

test("extractTodoPhases picks the latest todo toolResult phases", () => {
  assert.deepEqual(extractTodoPhases([todoToolResult]).phases, todoToolResult.details.phases);
  assert.deepEqual(extractTodoPhases([]).phases, []);
  assert.deepEqual(extractTodoPhases([{ role: "toolResult", toolName: "todo", isError: true }]).phases, []);
});

test("incomplete todos continue even with a confident Jev verdict", async () => {
  const client = mockJev();
  const handler = install(client);
  const { ctx } = mockCtx();
  const result = await handler(
    stopEvent({ messages: [...stopEvent().messages, todoToolResult] }),
    ctx
  );
  assert.equal(client.calls, 1);
  assert.equal(result?.continue, true);
  assert.match(result?.additionalContext ?? "", /todos pending: second/i);
});

test("completionOverride.enabled=false skips the gate", async () => {
  const client = mockJev();
  const handler = install(client);
  const { ctx } = mockCtx();
  completionOverride.enabled = false;
  try {
    const result = await handler(stopEvent(), ctx);
    assert.equal(client.calls, 0);
    assert.equal(result, undefined);
  } finally {
    completionOverride.enabled = null;
  }
});

test("no user prompt in messages returns undefined", async () => {
  const client = mockJev();
  const handler = install(client);
  const { ctx } = mockCtx();
  const result = await handler(stopEvent({ messages: [{ role: "assistant", content: "hi" }] }), ctx);
  assert.equal(client.calls, 0);
  assert.equal(result, undefined);
});
