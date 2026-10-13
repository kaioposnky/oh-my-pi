import test from "node:test";
import assert from "node:assert/strict";
import { mcpServerOf, planMcpGate } from "../src/mcp-gate.js";

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
