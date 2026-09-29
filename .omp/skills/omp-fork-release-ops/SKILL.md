---
name: omp-fork-release-ops
description: Maintain and release the kaioposnky/oh-my-pi fork (branch `truncated-tool-names`). Covers rebase-based sync against upstream, force-with-lease push, verifying fork commits survived a rebase via range-diff, the release workflow's fork-build-sha gate, and how to force a rebuild. Use when rebasing, pushing, tagging, releasing, or debugging the fork's binary updater and CI workflows.
---

# omp fork release ops

Fork: `kaioposnky/oh-my-pi`, branch `truncated-tool-names` (NOT `main`). Fork commits sit on top of `upstream/main` (can1357/oh-my-pi) and are rebased daily.

## Branch model

- `upstream/main` advances; `.github/workflows/sync-upstream.yml` (cron `37 5 * * *`, `workflow_dispatch`) runs `git rebase upstream/main` and force-pushes. Failed rebase → manual resolve, then re-run.
- Consequence: **fork commit SHAs change every rebase**. Never compare fork commits by SHA across a rebase — use `range-diff`.
- Push fork work with `--force-with-lease`, never a plain push after a rebase:

```bash
git fetch upstream main origin truncated-tool-names
git rev-list --left-right --count origin/truncated-tool-names...HEAD   # ahead/behind
git range-diff upstream/main..origin/truncated-tool-names upstream/main..HEAD
git push origin truncated-tool-names --force-with-lease
```

`range-diff` `=` lines = patch survived the rebase; `!` = upstream touched the same hunk, inspect. Local HEAD being a superset of origin is the expected, correct state — push it.

## Release pipeline

`.github/workflows/release.yml` triggers on: `workflow_run` of "Sync with upstream" (only on success), cron `3 7 * * *`, and `workflow_dispatch`.

- Version comes from **upstream's latest release tag** (`gh api repos/can1357/oh-my-pi/releases/latest`), not from our commits. So fork releases are tagged `v<upstream-latest>`.
- Gate: release body carries `fork-build-sha:<sha>`. If the tag already has that SHA, the run skips. To force a rebuild:

```bash
gh workflow run release.yml --repo kaioposnky/oh-my-pi --ref truncated-tool-names
# or, to rebuild the same commit:  -f force=true
gh run list --repo kaioposnky/oh-my-pi --workflow=release.yml --limit 3
```

- CI installs with `--minimum-release-age=3600` (1h floor) because the repo's 3-day policy blocks fresh upstream dep bumps. Don't "fix" this back to 3 days.
- `update-cli.ts` resolves versions from this fork's releases only. `REPO` is exported (tests derive fixture URLs from it). Do not reintroduce npm-based version checks.

## Commit hygiene in this repo

The tree is often dirty with unrelated work (fork files, prior session edits). **Never `git add -A` / `git commit -a`.** Stage explicit paths and re-check `git status --short` before committing — an unexamined dirty file silently rides into your commit. Unrelated change in the working tree → its own commit, not yours.

```bash
git status --short          # inspect EVERY line
git add <explicit paths>
git diff --cached --stat    # confirm scope
```

## Verification

- `bun check` (never `tsc`/`npx tsc`).
- `bun test <path>` for a package; `bun run test:rs` for Rust (never bare `cargo test`).
- Never commit unless asked. Never comment on or create GitHub issues/PRs.

## Gotchas

- Antigravity image generation: a stored credential `projectId` can lack the `cloudaicompanion` license → `403 SUBSCRIPTION_REQUIRED`. Resolve the real project via `POST {ANTIGRAVITY_PRIMARY_ENDPOINT}/v1internal:loadCodeAssist` and use its `cloudaicompanionProject`, falling back to the stored id. See `packages/ai/src/images/google-antigravity.ts`.
- Model/provider policy is KDL, not TypeScript: `packages/catalog/src/compat/rules/` → `bun run gen:compat` + commit `rules.json`.
- `packages/catalog/src/models.json` and `compat/rules.json` are generated — never hand-edit.
