# .omp/AGENTS.md

Project-local agent config for this repo. Root `AGENTS.md` holds the full development rules; this file adds the fork/release operational learnings.

## Fork release ops → skill

Read `skill://omp-fork-release-ops` before any rebase, push, tag, release, or CI-workflow work on this fork.

## Non-negotiables (learned the hard way)

- Branch is `truncated-tool-names`, not `main`. Rebased daily by `sync-upstream.yml`; **fork SHAs change every rebase** — compare with `git range-diff`, never by SHA.
- Push after a rebase with `--force-with-lease` only.
- **Never `git add -A` / `git commit -a`.** The tree is routinely dirty with unrelated work; stage explicit paths, verify with `git diff --cached --stat`. An unexamined dirty file will ride into your commit.
- Releases are tagged from **upstream's latest release version**, gated by a `fork-build-sha:<sha>` marker in the release body. Force a rebuild with `gh workflow run release.yml --repo kaioposnky/oh-my-pi --ref truncated-tool-names` (`-f force=true` to rebuild the same commit).
- `bun check` for types (never `tsc`), `bun test <path>` for a package, `bun run test:rs` for Rust.
- Never commit unless asked; never comment on or create GitHub issues/PRs.
