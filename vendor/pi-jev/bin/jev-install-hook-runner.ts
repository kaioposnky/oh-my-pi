import { installHook } from "../src/hook-install.js";

function printHelp(): void {
  console.log(`Usage: jev-install-hook [options]

Install a post-commit git hook that runs jev-gate locally on every commit.

Options:
  -c, --criteria <text>   Gate criteria to embed in the hook (adds --diff)
      --force             Overwrite an existing post-commit hook
      --repo <path>       Repository root (default: current directory)
      --args <string>     Extra gate args, space-separated (e.g. "--fail-open --json")
  -h, --help              Show this help

Exit codes: 0 installed or skipped, 2 error.`);
}

interface CliArgs {
  criteria?: string;
  force: boolean;
  repo: string;
  extraArgs: string[];
  help: boolean;
}

function parseCliArgs(argv: string[]): CliArgs {
  const parsed: CliArgs = { force: false, repo: process.cwd(), extraArgs: [], help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "-c" || arg === "--criteria") {
      parsed.criteria = argv[++i];
    } else if (arg === "--force") {
      parsed.force = true;
    } else if (arg === "--repo") {
      parsed.repo = argv[++i] || process.cwd();
    } else if (arg === "--args") {
      parsed.extraArgs = (argv[++i] || "").split(" ").filter(Boolean);
    } else if (arg === "-h" || arg === "--help") {
      parsed.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return parsed;
}

async function main() {
  let args: CliArgs;
  try {
    args = parseCliArgs(process.argv.slice(2));
  } catch (err: any) {
    console.error(`[jev-install-hook] ERROR: ${err?.message || err}`);
    printHelp();
    process.exit(2);
  }

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  try {
    const result = await installHook({
      repoRoot: args.repo,
      criteria: args.criteria,
      extraArgs: args.extraArgs,
      force: args.force,
    });
    if (result.written) {
      console.log(`[jev-install-hook] Installed post-commit hook: ${result.hookPath}`);
    } else {
      console.log(`[jev-install-hook] Skipped (hook already exists): ${result.hookPath}`);
    }
    process.exit(0);
  } catch (err: any) {
    console.error(`[jev-install-hook] ERROR: ${err?.message || err}`);
    process.exit(2);
  }
}

main();
