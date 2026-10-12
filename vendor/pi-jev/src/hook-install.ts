import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const MARKER = "# installed by jev-install-hook (pi-jev)";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Absolute path to this package's bin/jev-gate.js — embedded into the hook at
// install time so the hook needs no npx/network at commit time.
const JEV_GATE_BIN = path.resolve(__dirname, "..", "bin", "jev-gate.js");

/** Sh single-quote a value: 'it's' -> 'it'\''s' */
function shQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

export function buildHookScript(options: { gateArgs: string[] }): string {
  const args = options.gateArgs.map(shQuote).join(" ");
  return [
    "#!/bin/sh",
    MARKER,
    `exec node ${shQuote(JEV_GATE_BIN)}${args ? " " + args : ""}`,
    "",
  ].join("\n");
}

export interface InstallHookResult {
  written: boolean;
  hookPath: string;
  skipped?: "exists";
}

export async function installHook(options: {
  repoRoot: string;
  criteria?: string;
  extraArgs?: string[];
  force?: boolean;
}): Promise<InstallHookResult> {
  const hooksDir = path.join(options.repoRoot, ".git", "hooks");
  const hookPath = path.join(hooksDir, "post-commit");

  // Skip any existing hook unless --force (never clobber a foreign hook;
  // force covers upgrades of our own).
  if (!options.force && fs.existsSync(hookPath)) {
    return { written: false, hookPath, skipped: "exists" };
  }

  const gateArgs: string[] = [];
  if (options.criteria) {
    gateArgs.push("-c", options.criteria, "--diff");
  }
  if (options.extraArgs?.length) {
    gateArgs.push(...options.extraArgs);
  }

  fs.mkdirSync(hooksDir, { recursive: true });
  fs.writeFileSync(hookPath, buildHookScript({ gateArgs }), { mode: 0o755 });
  return { written: true, hookPath };
}
