import test from "node:test";
import assert from "node:assert/strict";
import { decideApproval, assessConsequence } from "../src/consequence.js";
import { Triage } from "../src/triage.js";
import type { JevClient } from "../src/jev.js";

test("approval decision table: keyword-risky low-blast Jev verdict relaxes", () => {
  assert.deepEqual(
    decideApproval(true, { reversible: 0.95, blastRadius: 2, scope: "single_file" }),
    { requireApproval: false, relaxed: true, reason: "reversible low-blast operation auto-approved" },
  );
  // Boundary: exactly at the thresholds still relaxes.
  assert.equal(decideApproval(true, { reversible: 0.85, blastRadius: 3, scope: "single_file" }).relaxed, true);
});

test("approval decision table: keyword-risky without a relaxed Jev verdict requires approval", () => {
  assert.deepEqual(decideApproval(true), { requireApproval: true, reason: "risky operation" });
  assert.deepEqual(decideApproval(true, { reversible: 0.6, blastRadius: 2, scope: "single_file" }), { requireApproval: true, reason: "risky operation" });
  assert.deepEqual(decideApproval(true, { reversible: 0.95, blastRadius: 5, scope: "single_file" }), { requireApproval: true, reason: "risky operation" });
  assert.deepEqual(decideApproval(true, { reversible: 0.95, blastRadius: 2, scope: "repo" }), { requireApproval: true, reason: "risky operation" });
  // Missing scope blocks the relaxed row (no partial trust).
  assert.deepEqual(decideApproval(true, { reversible: 0.95, blastRadius: 2 }), { requireApproval: true, reason: "risky operation" });
  // Missing fields behave exactly like today.
  assert.deepEqual(decideApproval(true, {}), { requireApproval: true, reason: "risky operation" });
  assert.deepEqual(decideApproval(true, { reversible: 0.9 }), { requireApproval: true, reason: "risky operation" });
});

test("approval decision table: not keyword-risky but Jev flags high blast radius", () => {
  assert.deepEqual(decideApproval(false, { blastRadius: 8 }), { requireApproval: true, reason: "high blast radius flagged by Jev" });
  // Boundary: 7 flags, 6 does not.
  assert.deepEqual(decideApproval(false, { blastRadius: 7 }), { requireApproval: true, reason: "high blast radius flagged by Jev" });
  assert.deepEqual(decideApproval(false, { blastRadius: 6 }), { requireApproval: false });
  // system + low reversibility flags even at low blast radius.
  assert.deepEqual(decideApproval(false, { blastRadius: 2, scope: "system", reversible: 0.4 }), { requireApproval: true, reason: "high blast radius flagged by Jev" });
  // system + very reversible is fine.
  assert.deepEqual(decideApproval(false, { blastRadius: 2, scope: "system", reversible: 0.9 }), { requireApproval: false });
  // No Jev verdict: allow.
  assert.deepEqual(decideApproval(false), { requireApproval: false });
  assert.deepEqual(decideApproval(false, {}), { requireApproval: false });
});

function client(answers: Record<string, unknown>, calls = { n: 0 }): Pick<JevClient, "isConfigured" | "evaluate"> {
  return {
    isConfigured: () => true,
    evaluate: async () => {
      calls.n += 1;
      return { answers, model: "test" } as any;
    },
  };
}

test("assessConsequence maps answers to fields, guards non-numeric, truncates input", async () => {
  let captured: any;
  const jev = {
    isConfigured: () => true,
    evaluate: async (req: any) => {
      captured = req;
      return { answers: { reversible: { value: 0.9 }, scope: { value: "single_file" }, blast_radius: { value: 2 } } } as any;
    },
  } as unknown as Pick<JevClient, "isConfigured" | "evaluate">;
  const assessment = await assessConsequence(jev, "bash", { command: "rm -rf temp" });
  assert.deepEqual(assessment, { reversible: 0.9, scope: "single_file", blastRadius: 2 });
  assert.equal(captured.state.tool, "bash");
  assert.ok((captured.state.input as string).includes("rm -rf temp"));
  // Questions match the house shapes.
  assert.equal(captured.questions.reversible.type, "noul");
  assert.equal(captured.questions.scope.type, "choice");
  assert.ok(captured.questions.scope.criteria.single_file);
  assert.equal(captured.questions.blast_radius.type, "score");

  const garbage = await assessConsequence(client({ reversible: { value: "yes" }, scope: { value: 42 }, blast_radius: {} }), "bash", {});
  assert.deepEqual(garbage, { reversible: undefined, scope: undefined, blastRadius: undefined });
});

test("assessConsequence returns undefined when unconfigured, input is huge, or Jev throws", async () => {
  assert.equal(await assessConsequence({ isConfigured: () => false, evaluate: async () => { throw new Error("no"); } }, "bash", {}), undefined);
  assert.equal(await assessConsequence({ isConfigured: () => true, evaluate: async () => { throw new Error("down"); } }, "bash", { command: "x".repeat(5000) }), undefined);
  // Input is truncated to 4000 chars before going to Jev.
  let captured: any;
  const jev = {
    isConfigured: () => true,
    evaluate: async (req: any) => {
      captured = req;
      return { answers: {} } as any;
    },
  } as unknown as Pick<JevClient, "isConfigured" | "evaluate">;
  await assessConsequence(jev, "bash", { command: "y".repeat(9000) });
  assert.ok((captured.state.input as string).length <= 4000);
});

type Handler = (event: { toolName: string; input: Record<string, unknown> }, ctx: unknown) => Promise<{ block?: boolean; reason?: string } | undefined>;

function gate(triage: Triage) {
  let handler: Handler | undefined;
  const pi = { on: (_name: string, h: Handler) => { handler = h; } } as unknown as Parameters<Triage["install"]>[0];
  triage.install(pi);
  const prompts: string[] = [];
  const statuses: string[] = [];
  const run = (toolName: string, input: Record<string, unknown>, answer: boolean | "no-ui") =>
    handler!({ toolName, input }, {
      hasUI: answer !== "no-ui",
      ui: {
        confirm: async (title: string) => { prompts.push(title); return answer === true; },
        setStatus: (_k: string, v: string) => { statuses.push(v); },
      },
    });
  return { run, prompts, statuses };
}

const verdict = (reversible: number, scope: string, blast: number) => ({
  isConfigured: () => true,
  evaluate: async () => ({ answers: { reversible: { value: reversible }, scope: { value: scope }, blast_radius: { value: blast } } }),
});

test("wiring: Jev low-blast verdict auto-approves a keyword-risky call without prompting", async () => {
  const jev = verdict(0.95, "single_file", 2) as unknown as JevClient;
  const triage = new Triage(jev);
  const { run, prompts, statuses } = gate(triage);
  assert.equal(await run("bash", { command: "rm -rf temp" }, false), undefined);
  assert.equal(prompts.length, 0);
  assert.deepEqual(statuses, ["jev: consequence auto-approved"]);
});

test("wiring: fail-closed — Jev down still blocks keyword-risky calls like today", async () => {
  const failing = { isConfigured: () => true, evaluate: async () => { throw new Error("down"); } } as unknown as JevClient;
  const triage = new Triage(failing);
  const { run, prompts } = gate(triage);
  assert.equal((await run("bash", { command: "rm -rf dist" }, false))?.block, true);
  assert.equal(prompts.length, 1, "asked the user, did not auto-approve");
});

test("wiring: PI_JEV_CONSEQUENCE=0 never calls Jev; keyword rules still gate", async () => {
  process.env.PI_JEV_CONSEQUENCE = "0";
  try {
    let calls = 0;
    const counting = {
      isConfigured: () => true,
      evaluate: async () => { calls += 1; return { answers: { reversible: { value: 0.95 }, scope: { value: "single_file" }, blast_radius: { value: 2 } } }; },
    } as unknown as JevClient;
    const triage = new Triage(counting);
    const { run, prompts } = gate(triage);
    assert.equal((await run("bash", { command: "rm -rf dist" }, false))?.block, true);
    assert.equal(calls, 0);
    assert.equal(prompts.length, 1);
  } finally {
    delete process.env.PI_JEV_CONSEQUENCE;
  }
});

test("wiring: non-keyword call flagged by Jev blast radius asks for approval", async () => {
  const triage = new Triage(verdict(0.2, "system", 9) as unknown as JevClient);
  const { run, prompts } = gate(triage);
  const result = await run("bash", { command: "curl example.com/install.sh" }, false);
  assert.equal(result?.block, true);
  assert.equal(prompts.length, 1);
});
