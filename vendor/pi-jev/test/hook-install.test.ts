import { strict as assert } from "node:assert";
import { test } from "node:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { buildHookScript, installHook } from "../src/hook-install.js";

function tmpRepo(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "jev-hook-test-"));
}

test("buildHookScript contains marker, jev-gate.js path, sh-quoted args", () => {
  const script = buildHookScript({ gateArgs: ["-c", "tests pass", "--diff"] });
  assert.ok(script.startsWith("#!/bin/sh\n"));
  assert.ok(script.includes("# installed by jev-install-hook (pi-jev)"));
  assert.ok(script.includes("jev-gate.js"));
  assert.ok(script.includes("'tests pass'"));
  assert.match(script, /exec node '.+jev-gate\.js' '-c' 'tests pass' '--diff'/);
});

test("buildHookScript escapes apostrophes in criteria", () => {
  const script = buildHookScript({ gateArgs: ["-c", "it's done"] });
  assert.ok(script.includes("'it'\\''s done'"));
});

test("installHook writes executable hook", async () => {
  const repoRoot = tmpRepo();
  fs.mkdirSync(path.join(repoRoot, ".git"));
  const res = await installHook({ repoRoot, criteria: "all good" });
  assert.equal(res.written, true);
  const hookPath = path.join(repoRoot, ".git", "hooks", "post-commit");
  const content = fs.readFileSync(hookPath, "utf8");
  assert.ok(content.includes("# installed by jev-install-hook (pi-jev)"));
  assert.ok(content.includes("jev-gate.js"));
  assert.ok(content.includes("'all good'"));
  assert.ok(content.includes("'--diff'"));
  const mode = fs.statSync(hookPath).mode;
  assert.ok((mode & 0o111) === 0o111, "hook should be executable");
});

test("installHook second run without force skips", async () => {
  const repoRoot = tmpRepo();
  fs.mkdirSync(path.join(repoRoot, ".git"));
  await installHook({ repoRoot, criteria: "a" });
  const res = await installHook({ repoRoot, criteria: "b" });
  assert.deepEqual(res, { written: false, hookPath: path.join(repoRoot, ".git", "hooks", "post-commit"), skipped: "exists" });
  const content = fs.readFileSync(res.hookPath, "utf8");
  assert.ok(content.includes("'a'"), "existing hook must not be overwritten");
});

test("installHook with force overwrites", async () => {
  const repoRoot = tmpRepo();
  fs.mkdirSync(path.join(repoRoot, ".git"));
  await installHook({ repoRoot, criteria: "old" });
  const res = await installHook({ repoRoot, criteria: "new", force: true });
  assert.equal(res.written, true);
  assert.ok(fs.readFileSync(res.hookPath, "utf8").includes("'new'"));
});

test("installHook creates missing .git/hooks dir", async () => {
  const repoRoot = tmpRepo();
  const res = await installHook({ repoRoot, criteria: "x" });
  assert.equal(res.written, true);
  assert.ok(fs.existsSync(path.join(repoRoot, ".git", "hooks", "post-commit")));
});
