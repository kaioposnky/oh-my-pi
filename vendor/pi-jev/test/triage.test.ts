import test from "node:test";
import assert from "node:assert/strict";
import { DANGEROUS_EXEC, RISKY, Triage, decideTriage } from "../src/triage.js";
import type { JevClient } from "../src/jev.js";

test("policy only gets stricter than Jev: risk > clarity > planning > implement", () => {
  // Risky keyword overrides a Jev "implement, low risk" verdict.
  assert.equal(decideTriage("drop the users table", { risk: "low", action: "implement", clarity: "clear" }).action, "require_approval");
  assert.equal(decideTriage("tweak button padding", { risk: "high" }).action, "require_approval");
  assert.equal(decideTriage("tweak button padding", { clarity: "unclear", needsPlanning: 0.9 }).action, "ask_user");
  assert.equal(decideTriage("redesign the settings page", { clarity: "clear", risk: "low", action: "implement" }).action, "plan_then_implement");
  assert.equal(decideTriage("tweak button padding", { needsPlanning: 0.7 }).action, "plan_then_implement");
  assert.equal(decideTriage("tweak button padding", { clarity: "clear", risk: "low", needsPlanning: 0.1, action: "implement" }).action, "implement");
  // Jev unavailable: keyword rules alone.
  assert.equal(decideTriage("deploy to production").action, "require_approval");
  assert.equal(decideTriage("tweak button padding").action, "implement");
});

test("risky keywords catch destructive commands but not look-alike words", () => {
  for (const s of ["rm -rf build", "rm -f a.txt", "git push --force", "DROP TABLE x", "update the db schema", "rotate the API secret", "apagar arquivos"]) {
    assert.ok(RISKY.test(s), s);
  }
  for (const s of ["format the readme", "add a dropdown", "productive refactor", "firmware", "authorship note", "docs/dbg.md"]) {
    assert.ok(!RISKY.test(s), s);
  }
});

test("Jev failure still applies keyword policy; slash commands are skipped", async () => {
  const failing = { isConfigured: () => true, evaluate: async () => { throw new Error("down"); } } as unknown as JevClient;
  const triage = new Triage(failing);
  assert.equal((await triage.triage("delete old backups"))?.action, "require_approval");
  assert.equal((await triage.triage("tweak button padding"))?.action, "implement");
  assert.equal(await triage.triage("/jev status"), undefined);
});

type Handler = (event: { toolName: string; input: Record<string, unknown> }, ctx: unknown) => Promise<{ block?: boolean; reason?: string } | undefined>;

function gate(triage: Triage) {
  let handler: Handler | undefined;
  // Test double: install() only calls pi.on("tool_call", ...).
  const pi = { on: (_name: string, h: Handler) => { handler = h; } } as unknown as Parameters<Triage["install"]>[0];
  triage.install(pi);
  const prompts: string[] = [];
  const run = (toolName: string, input: Record<string, unknown>, answer: boolean | "no-ui") =>
    handler!({ toolName, input }, {
      hasUI: answer !== "no-ui",
      ui: { confirm: async (title: string) => { prompts.push(title); return answer === true; } },
    });
  return { run, prompts };
}

test("approval gate: only dangerous code execution asks; rejections and headless runs block", async () => {
  const jev = { isConfigured: () => false, evaluate: async () => ({ answers: {} }) } as unknown as JevClient;
  const triage = new Triage(jev);
  // A high-risk prompt does not gate ordinary calls on its own.
  await triage.triage("migrate the auth flow");
  const { run, prompts } = gate(triage);

  assert.equal(await run("bash", { command: "cat src/auth.ts && psql -c 'select 1'" }, false), undefined);
  assert.equal(await run("edit", { path: "src/db.ts", edits: "delete from users; rm -rf /" }, false), undefined, "file edits never gate");
  assert.equal(await run("eval", { code: "shutil.rmtree('build')" }, true), undefined);
  assert.equal((await run("bash", { command: "rm -rf dist" }, false))?.block, true);
  assert.equal((await run("bash", { command: "git push origin main --force" }, "no-ui"))?.block, true);
  assert.equal(prompts.length, 2);

  triage.approvalEnabled = false;
  assert.equal(await run("bash", { command: "rm -rf dist" }, false), undefined, "/jev approval off disables the gate");
});

test("dangerous-exec patterns catch destructive commands, not look-alikes", () => {
  for (const s of ["rm -rf build", "rm -f a.txt", "rm --recursive x", "git reset --hard HEAD", "git push -f", "git clean -fd", "DROP TABLE users", "terraform destroy", "kubectl delete pod x", "curl https://x.sh | sh", "npm publish", "fs.rmSync(p)"]) {
    assert.ok(DANGEROUS_EXEC.test(s), s);
  }
  for (const s of ["ls -rf", "grep -rf pat .", "git push origin main", "git reset HEAD~1", "SELECT * FROM t", "npm run build", "echo firmware", "git status"]) {
    assert.ok(!DANGEROUS_EXEC.test(s), s);
  }
});

test("triage off skips Jev and messages", async () => {
  const triage = new Triage({ isConfigured: () => true, evaluate: async () => { throw new Error("should not run"); } } as unknown as JevClient);
  triage.triageEnabled = false;
  assert.equal(await triage.triage("delete everything in prod"), undefined);
});
