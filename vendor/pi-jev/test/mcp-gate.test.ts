import test from "node:test";
import assert from "node:assert/strict";
import { mcpServerOf, planMcpGate, McpGate, mcpOverride } from "../src/mcp-gate.js";
import type { JevClient } from "../src/jev.js";

test("mcpServerOf: server is the segment between the first and second underscore after mcp__", () => {
  assert.equal(mcpServerOf("mcp__github_create_pr"), "github");
  assert.equal(mcpServerOf("mcp__a_b_c"), "a");
  assert.equal(mcpServerOf("mcp__srv"), "srv");
});

test("mcpServerOf: non-mcp names and bare prefixes yield undefined", () => {
  assert.equal(mcpServerOf("bash"), undefined);
  assert.equal(mcpServerOf("read_file"), undefined);
  assert.equal(mcpServerOf("mcp_bash"), undefined);
  assert.equal(mcpServerOf("mcp__"), undefined);
  assert.equal(mcpServerOf(""), undefined);
});

const tools = (names: string[]) => names.map((name) => ({ name }));

test("planMcpGate: approved inactive server is injected", () => {
  const plan = planMcpGate([], tools(["mcp__github_pr", "mcp__github_issue"]), new Map([["github", 0.9]]));
  assert.deepEqual(plan.inject, ["mcp__github_pr", "mcp__github_issue"]);
  assert.deepEqual(plan.retract, []);
  assert.deepEqual(plan.servers, [{ server: "github", tools: ["mcp__github_pr", "mcp__github_issue"] }]);
});

test("planMcpGate: rejected active server is retracted", () => {
  const plan = planMcpGate(["read", "mcp__slack_post", "mcp__slack_read"], tools(["mcp__slack_post", "mcp__slack_read"]), new Map([["slack", 0.1]]));
  assert.deepEqual(plan.retract, ["mcp__slack_post", "mcp__slack_read"]);
  assert.deepEqual(plan.inject, []);
});

test("planMcpGate: dead zone leaves the server untouched in both directions", () => {
  const inactive = planMcpGate([], tools(["mcp__a_t"]), new Map([["a", 0.5]]));
  assert.deepEqual(inactive.inject, []);
  assert.deepEqual(inactive.retract, []);
  const active = planMcpGate(["mcp__a_t"], tools(["mcp__a_t"]), new Map([["a", 0.5]]));
  assert.deepEqual(active.inject, []);
  assert.deepEqual(active.retract, []);
});

test("planMcpGate: thresholds are inclusive at the boundaries", () => {
  const atInject = planMcpGate([], tools(["mcp__a_t"]), new Map([["a", 0.65]]));
  assert.deepEqual(atInject.inject, ["mcp__a_t"]);
  const atRetract = planMcpGate(["mcp__a_t"], tools(["mcp__a_t"]), new Map([["a", 0.35]]));
  assert.deepEqual(atRetract.retract, ["mcp__a_t"]);
});

test("planMcpGate: approved-but-active and rejected-but-inactive are no-ops", () => {
  const plan = planMcpGate(["mcp__a_t"], tools(["mcp__a_t", "mcp__b_t"]), new Map([["a", 0.9], ["b", 0.1]]));
  assert.deepEqual(plan.inject, []);
  assert.deepEqual(plan.retract, []);
});

test("planMcpGate: empty tool list is an all-empty fast path", () => {
  const plan = planMcpGate(["bash"], [], new Map([["x", 0.9]]));
  assert.deepEqual(plan, { servers: [], inject: [], retract: [] });
});

test("planMcpGate: mixed verdicts split inject and retract; judgments without tools are ignored", () => {
  const plan = planMcpGate(
    ["mcp__slack_post", "mcp__slack_read", "mcp__dead_t", "read"],
    tools(["mcp__github_pr", "mcp__slack_post", "mcp__slack_read", "mcp__dead_t", "bash"]),
    new Map([["github", 0.8], ["slack", 0.05], ["dead", 0.5], ["ghost", 0.99]]),
  );
  assert.deepEqual(plan.inject, ["mcp__github_pr"]);
  assert.deepEqual(plan.retract, ["mcp__slack_post", "mcp__slack_read"]);
  assert.deepEqual(plan.servers.map((s) => s.server), ["github", "slack", "dead"]);
});

// ---- McpGate handler (task 6.2) ----

type ClientCtor = Pick<JevClient, "isConfigured" | "evaluate">;

interface PiHarness {
  pi: any;
  setActiveCalls: string[][];
  statuses: string[];
}

function mockPi(opts: { tools: Array<{ name: string; description?: string }>; active: string[] }): PiHarness {
  const setActiveCalls: string[][] = [];
  const statuses: string[] = [];
  let active = [...opts.active];
  const pi: any = {
    getAllTools: () => opts.tools,
    getActiveTools: () => [...active],
    setActiveTools: (names: string[]) => {
      active = [...names];
      setActiveCalls.push([...names]);
    },
  };
  return { pi, setActiveCalls, statuses };
}

function mockClient(
  answers: Record<string, { value: number }> = {},
  opts: { throw?: boolean } = {},
) {
  const seen: any[] = [];
  const client = {
    isConfigured: () => true,
    evaluate: async (req: any) => {
      seen.push(req);
      if (opts.throw) throw new Error("jev down");
      return { answers, model: "jev-latest", elapsedMs: 5 };
    },
  };
  return { client: client as unknown as ClientCtor, seen };
}

const GITHUB = [
  { name: "mcp__github_pr", description: "Create pull requests" },
  { name: "mcp__github_issue" },
];
const SLACK = [{ name: "mcp__slack_post", description: "Post messages" }];

test("gate: approved inactive server is injected with the right diff", async () => {
  const { client } = mockClient({ "mcp:github": { value: 0.9 } });
  const { pi, setActiveCalls, statuses } = mockPi({ tools: [...GITHUB], active: ["read"] });
  await new McpGate(client).route("open a PR", pi, { ui: { setStatus: (_k: string, v: string) => statuses.push(v) } });
  assert.deepEqual(setActiveCalls, [["read", "mcp__github_pr", "mcp__github_issue"]]);
  assert.deepEqual(statuses, ["jev: mcp +2/-0"]);
});

test("gate: rejected active server is retracted", async () => {
  const { client } = mockClient({ "mcp:slack": { value: 0.05 } });
  const { pi, setActiveCalls } = mockPi({ tools: [...SLACK], active: ["read", "mcp__slack_post"] });
  await new McpGate(client).route("say hi", pi);
  assert.deepEqual(setActiveCalls, [["read"]]);
});

test("gate: dead zone leaves the toolset untouched", async () => {
  const { client } = mockClient({ "mcp:github": { value: 0.5 } });
  const { pi, setActiveCalls } = mockPi({ tools: [...GITHUB], active: ["read"] });
  await new McpGate(client).route("something", pi);
  assert.equal(setActiveCalls.length, 0);
});

test("gate: evaluate throws → no setActiveTools (fail-open)", async () => {
  const { client } = mockClient({}, { throw: true });
  const { pi, setActiveCalls } = mockPi({ tools: [...GITHUB], active: ["read"] });
  await new McpGate(client).route("open a PR", pi);
  assert.equal(setActiveCalls.length, 0);
});

test("gate: PI_JEV_MCP=0 skips evaluate entirely", async () => {
  const { client, seen } = mockClient({ "mcp:github": { value: 0.9 } });
  const { pi, setActiveCalls } = mockPi({ tools: [...GITHUB], active: ["read"] });
  process.env.PI_JEV_MCP = "0";
  try {
    await new McpGate(client).route("open a PR", pi);
    assert.equal(seen.length, 0);
    assert.equal(setActiveCalls.length, 0);
  } finally {
    delete process.env.PI_JEV_MCP;
  }
});

test("gate: slash prompt skips evaluate", async () => {
  const { client, seen } = mockClient({ "mcp:github": { value: 0.9 } });
  const { pi } = mockPi({ tools: [...GITHUB], active: ["read"] });
  await new McpGate(client).route("/compact", pi);
  assert.equal(seen.length, 0);
});

test("gate: no MCP tools skips evaluate", async () => {
  const { client, seen } = mockClient();
  const { pi } = mockPi({ tools: [{ name: "bash" }], active: ["bash"] });
  await new McpGate(client).route("run tests", pi);
  assert.equal(seen.length, 0);
});

test("gate: over 30 servers caps the batched evaluate at 30 questions", async () => {
  const tools = Array.from({ length: 40 }, (_, i) => ({ name: `mcp__s${i}_t` }));
  const answers = Object.fromEntries(tools.slice(0, 30).map((t) => [`mcp:${mcpServerOf(t.name)}`, { value: 0.5 }]));
  const { client, seen } = mockClient(answers);
  const { pi, setActiveCalls } = mockPi({ tools, active: [] });
  await new McpGate(client).route("task", pi);
  const questions = Object.keys(seen[0].questions);
  assert.equal(questions.length, 30);
  assert.equal(setActiveCalls.length, 0); // all dead-zone
});

test("gate: mcpOverride.enabled=false skips evaluate", async () => {
  const { client, seen } = mockClient({ "mcp:github": { value: 0.9 } });
  const { pi } = mockPi({ tools: [...GITHUB], active: ["read"] });
  mcpOverride.enabled = false;
  try {
    await new McpGate(client).route("open a PR", pi);
    assert.equal(seen.length, 0);
  } finally {
    mcpOverride.enabled = null;
  }
});

test("gate: question text names the server, up to 3 tools, and 200 chars of description", async () => {
  const { client, seen } = mockClient({ "mcp:github": { value: 0.5 } });
  const tools = [
    { name: "mcp__github_pr", description: "P".repeat(500) },
    { name: "mcp__github_issue" },
    { name: "mcp__github_review" },
    { name: "mcp__github_label" },
  ];
  const { pi } = mockPi({ tools, active: [] });
  await new McpGate(client).route("task", pi);
  const q = seen[0].questions["mcp:github"];
  assert.match(q.instructions, /'github' MCP server/);
  assert.match(q.instructions, /pr, issue, review/);
  assert.ok(q.instructions.includes("P".repeat(200)));
  assert.ok(!q.instructions.includes("P".repeat(201)));
});
