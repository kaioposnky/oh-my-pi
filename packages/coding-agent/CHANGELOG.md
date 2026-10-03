# Changelog

## [Unreleased]

### Added

- Computer `el.setValue(75)` now writes the number as `"75"` instead of refusing a non-string; `NaN`, `Infinity`, booleans and objects are still refused, as are a whole number past 2^53 and a number that prints with an exponent, which are passed as text in digits instead ([#19405](https://github.com/can1357/oh-my-pi/pull/19405) by [@will-bogusz](https://github.com/will-bogusz))

### Changed

- On macOS the `computer` tool's takeover notice now says what it did with your keyboard ("handed the keyboard back to Notes's window", "left as the user chose") instead of "focus returned", which it could not verify ([#19208](https://github.com/can1357/oh-my-pi/pull/19208) by [@will-bogusz](https://github.com/will-bogusz))
- Browser `tab.observe()` and `tab.ariaSnapshot()` on Chromium tabs now wait, up to 3 seconds, for the requests and page updates (including child frames) the actions since your last look started, so a cell that clicks and then observes shows the result instead of the page before it; concurrent looks share the wait even across another action, clearing the request log does not discard pending work, and requests already open before the action do not delay the look ([#19045](https://github.com/can1357/oh-my-pi/pull/19045) by [@will-bogusz](https://github.com/will-bogusz))
- When another agent's computer call holds the desktop, your agent's `InputBusy` says which one: its agent id and omp process id ([#18987](https://github.com/can1357/oh-my-pi/pull/18987) by [@will-bogusz](https://github.com/will-bogusz))

### Fixed

- Fixed eval cells being able to call `yield` (directly or through `xd://yield`) without finishing the delegated task; eval now rejects `yield` and points to the direct tool ([#19470](https://github.com/can1357/oh-my-pi/pull/19470) by [@alphastorm](https://github.com/alphastorm))
- Fixed service `ready.log` and wait patterns not matching `^` and `$` at line boundaries after earlier output ([#19471](https://github.com/can1357/oh-my-pi/pull/19471) by [@alphastorm](https://github.com/alphastorm))
- Fixed the shell's `stat`, `diff` and `find` builtins ignoring `TZ` when printing file times; `find -ls` now prints times in the shell's time zone instead of UTC, and `find -newermt` reads dates like `Nov 15, 2023` in the shell's time zone ([#19482](https://github.com/can1357/oh-my-pi/pull/19482) by [@alphastorm](https://github.com/alphastorm))
- With TTSR rules active, large `write` and `edit` calls no longer slow down as their arguments stream ([#19494](https://github.com/can1357/oh-my-pi/pull/19494) by [@H4vC](https://github.com/H4vC))
- Fixed `/commit` and eval `commit` creating a single-parent commit during a merge; committing now refuses while a merge, cherry-pick, revert, rebase or `git am` is in progress or the index has unresolved conflicts ([#19474](https://github.com/can1357/oh-my-pi/pull/19474) by [@alphastorm](https://github.com/alphastorm))
- Fixed the `apply_patch` tool description calling it a shell command and forbidding absolute paths ([#19325](https://github.com/can1357/oh-my-pi/issues/19325), [#19468](https://github.com/can1357/oh-my-pi/pull/19468) by [@alphastorm](https://github.com/alphastorm))
- Fixed the shell's `rg` builtin ignoring `--glob` patterns that contain a slash ([#19476](https://github.com/can1357/oh-my-pi/pull/19476) by [@alphastorm](https://github.com/alphastorm))
- Fixed eval `commit` `only(...)` failing when one of its paths or globs matched no changed file; unmatched ones are now reported ([#19472](https://github.com/can1357/oh-my-pi/pull/19472) by [@alphastorm](https://github.com/alphastorm))
- Fixed the browser tool reporting a JavaScript `confirm` or `prompt` as still open, and failing page calls on it, after the user clicked it away or another CDP client answered it ([#19481](https://github.com/can1357/oh-my-pi/pull/19481) by [@will-bogusz](https://github.com/will-bogusz))
- Fixed `computer` `setValue` on a `<select>` in Chrome or an Electron app on macOS failing with an empty list of options; it now chooses the option the value names ([#19224](https://github.com/can1357/oh-my-pi/pull/19224) by [@will-bogusz](https://github.com/will-bogusz))
- A relay tab is no longer closed when another extension's frame, such as a password manager's autofill menu that undoes the relay clearing it, keeps Chrome refusing omp: the call fails saying what holds the tab, the tab stays open as the user left it, and the next call reattaches to it ([#19178](https://github.com/can1357/oh-my-pi/pull/19178) by [@will-bogusz](https://github.com/will-bogusz))
- Fixed the computer tool telling the model that only an X11 takeover can end with nothing sent because the user kept typing; a macOS takeover now waits for the user's pause too and reports `UserIntervened` the same way ([#19296](https://github.com/can1357/oh-my-pi/pull/19296) by [@will-bogusz](https://github.com/will-bogusz))
- When the browser relay hides another extension's frame in a tab omp drives (a password manager's inline menu or save card), the call that ran into it, or a later one on that tab, now names the frame's page, the extension's id and the page's own title, and says the frame is hidden for the user too ([#19001](https://github.com/can1357/oh-my-pi/pull/19001) by [@will-bogusz](https://github.com/will-bogusz))

- Subagents without an output schema (including eval `agent()` calls without `schema`) no longer get a `yield` tool; their final message is the result.
- A `yield` without `data` no longer uses the subagent's last message as the result; it only finalizes incremental sections that were already submitted.
- A `computer` key press that opens a macOS popup button's or menu button's menu in the background now fails listing the items and naming the press or click that chooses one, instead of leaving the menu open with your keyboard ([#19179](https://github.com/can1357/oh-my-pi/pull/19179) by [@will-bogusz](https://github.com/will-bogusz))
## [18.22.0] - 2026-11-16

### Breaking Changes

- Moved binary analysis from the standalone `ida` and `ghidra` tools into the backend-neutral `dsm` namespace (`xd://eval/dsm`).
- Replaced the `ida.enabled`, `ida.maxOpen`, and `ida.idleCloseSec` settings with `disassembler.backend`, `disassembler.maxOpen`, and `disassembler.idleCloseSec`; shared disassembler database APIs are now available under `@oh-my-pi/pi-coding-agent/disasm`.

### Added

- Added Tern plan review editing and comments: double-click plans to edit them, select text to add Google Docs-style comments, and send comments to Refine.
- Added Ghidra support with automatic setup of Ghidra, JDK, and PyGhidra when analysis is explicitly requested; Auto mode uses an installed IDA Pro when available and otherwise falls back to Ghidra.
- Added support for sharing live analysis databases with child agents through `db.handle()` and `dsm.open(handle)`.
- Added a `Force Remove` option to `worktree.onExit` that removes session-created worktrees without prompting, including worktrees with uncommitted changes; new commits remain on the worktree branch.

### Changed

- Updated Tern plan review with a single Approve control, comment-aware Refine option, model selection, and a Save action that writes the plan while keeping review open and plan mode active.
- Plain executable reads now display Mach-O, ELF, and PE metadata without opening an analysis database or downloading a backend; request an overview, function details, or `dsm.open()` to begin analysis.
- Improved the model switcher (`Alt+P` / `/switch`) with provider filtering and per-switch thinking-level selection. In Tern, it now opens above the composer with integrated search, provider and Task/Main filters, and a thinking-level slider.

### Fixed

- Deleting or moving large directory trees inside a project no longer stalls language-server file watching ([#19490](https://github.com/can1357/oh-my-pi/pull/19490) by [@H4vC](https://github.com/H4vC)).
- Reduced CPU and memory usage for long-running subagents as their sessions grow ([#19486](https://github.com/can1357/oh-my-pi/pull/19486) by [@H4vC](https://github.com/H4vC)).
- Fixed `commit.draft()` incorrectly classifying files deleted or renamed through bash or eval as “Not yours”; they now appear under Review.

### Removed

- Removed the legacy standalone disassembler tools and their associated prompt instructions.
- Removed the Copy and Edit-in-editor buttons from the Tern plan review sheet; use selection copying and double-click editing instead.

## [18.21.0] - 2026-11-16

### Breaking Changes

- Updated the `AgentSession` run lifecycle API: `agent_end` is emitted once when a run can no longer resume, and `agent_pause` reports runs that stop while awaiting work. Replaced `hasPendingAsyncWork()`, `settleAsyncWork()`, and `suppressAutoResumeUntilPrompt()` with `isRunActive`, `wakeSources`, and `waitForRunEnd()`. Calling `abort()` now also ends runs paused on background work; RPC, JSON print, collaboration, and extension streams retain their existing per-loop `agent_end` behavior.

### Added

- Added configurable automatic subagent prewalk through `task.agentPrewalkAuto`, allowing per-agent `on`/`off` settings or model patterns while preserving unconditional subagent prewalk.
- Unknown custom and discovered models now automatically detect reasoning support and remember supported reasoning effort levels for future sessions.
- Added inline image and web-page replies: supported terminals can display local, data, and HTTP(S) images and embedded pages, while other terminals receive linked fallbacks. Added `tui.renderEmbeds` to disable this rendering.
- Added interactive embedded pages in Tern replies, including click-to-visit and Escape-to-return navigation; common host, path, and `file:` URL forms are accepted.
- Bash redirects can now write to all writable internal URLs, including job cancellation endpoints and handler-backed `agent://`, `cfg://`, `ssh://`, and `xd://` URLs.
- Added image pasting to `ask` form notes and `ui.formDialog` options via `acceptImages`; pasted images are returned with `[Image #N]` markers and described for text-only models. Unsupported prompts now clearly reject image pastes.

### Changed

- Changed the default local text-to-speech model to Phonon 31M for faster synthesis, smaller downloads, and additional voices. Existing Kokoro voice settings migrate automatically; speaking rates now range from 0.8× to 1.3×.
- Tern `/btw` responses now appear as folded, interactive notes at the point where they were requested, with follow-up, copy, branch, inject, and stop actions; `/btw` without a prompt still opens the history view.
- Overlapping Bash calls now share shell state, including variables, functions, aliases, options, and traps, and background jobs started by those calls continue running independently.
- Extensions enabled or reconfigured through `extensions` or `disabledExtensions` now load into the active session without requiring a restart.
- Rich-text pastes made during approval steering or in dialogs now preserve Markdown formatting and images when inserted into the chat editor.
- Moving a task or resuming a session in another project now switches its agents, extensions, custom tools, and MCP servers to match the destination project without a restart.

### Fixed

- Fixed status indicators incorrectly showing the agent as idle while subagents or background work could still resume the run.
- Fixed subagents and security scans completing while child agents were still running or queued peer messages remained.
- Fixed conflict-region resolution when a selected side is empty or shares edge lines with surrounding code.
- MCP stdio server failures before a response now report the process exit code or terminating signal instead of only reporting closed stdout.
- Fixed prewalk handoffs so model and reasoning-effort changes are preserved, and automatic handoffs return to the planning model when automatic prewalk is changed or disabled.

## [18.20.3] - 2026-11-16

### Breaking Changes

- Renamed the browser `tab.clickAt()` option from `clickCount` to `count`, matching `tab.click()`.
- Browser viewport screenshot coordinates now use the displayed image coordinates when the screenshot is scaled for the model; pass `css: true` (or `{ x, y, css: true }` for drag points) to provide viewport CSS pixels explicitly.
- Added opt-in `mnemopi.recallRelevance` (`off`, `auto`, or `on`; default `off`) to filter automatic memory recall for task relevance using the `judge` role.
- Added path-scoped entries for `bash.patterns` and `bashInterceptor.patterns`, resolved per working directory. Project and `--config` overlays now prepend these rules to global rules instead of replacing them.
- Added `bash.allowedEnvVars` and per-rule `env` lists to permit explicitly named environment-variable prefixes on matching `allow` rules.
- Subagents now preserve `@upstream` provider pinning on inherited models.
- Added `--no-judge`, `--no-spotlight`, and `--offline` options to restrict auxiliary services to the active model's provider or disable cross-provider services.
- Added per-rule TTSR `repeatMode` frontmatter (`once`, `after-gap`, or `always`) to override the global repeat policy.
- Compound bash approval prompts now show each command segment separately, distinguishing allowed segments from those requiring approval.
- Removed the `seance` agent, `/seance` command, and the task tool's `sourceSession` parameter.

### Added

- Added `mnemopi.embeddingQueryPrefix` and `mnemopi.embeddingInputType` configuration for asymmetric and instruction-tuned embedding models, including providers that require an `input_type`.

### Changed

- Browser screenshots are delivered to the model in CSS pixels up to the supported unscaled size, making viewport screenshot coordinates directly usable with browser actions; scaling guidance remains for scaled full-page and element captures.
- Browser `waitForUrl`, `waitForResponse`, and `requests({ filter })` now support `*` glob patterns in URL strings, while other strings retain substring matching.
- The WebKit browser engine now automatically installs and updates to the newest stable ABKit release, with versioned installations that allow updates without waiting for existing browser hosts to exit.
- Improved browser responsiveness and recovery: unresponsive WebKit pages fail fast with actionable errors, navigation can recover busy pages, and browser operations provide clearer diagnostics for timeouts, closed tabs, unsupported event listeners, invalid routes, cookie data, and viewport changes.
- Pressing Delete at the end of the Ctrl+R search field removes the selected prompt from history.
- `/copy` now works while viewing a subagent and copies from that subagent's transcript.
- `find` now returns unranked literal keyword matches when all judge requests fail.
- `take()` and `drop()` now reject nonexistent hunk units with a clear error.
- `edit` rejection messages now suggest the file's current tag, and edits made before conflict resolution carry over to the resolved file.
- `/marketplace` and marketplace install/uninstall commands now report picker and catalog-load errors without exiting the session.
- ACP sessions honor `mcp.startupTimeoutMs` for MCP servers declared by the client, and ACP form elicitations no longer repeat field labels unnecessarily.
- Task progress from every `task.steps` subagent step is now preserved, rather than only the final step's report.
- Pasting HTML into the composer now preserves spaces from whitespace-only inline elements and indentation inside `<pre>` blocks.
- Queued follow-ups edited with Alt+Up are restored as queued messages instead of being sent into the active turn.

### Fixed

- Fixed `ida` `exec` output on IDA 9.5+ by suppressing helper deprecation warnings and preserving the updated function metadata API.
- Expired Perplexity logins and cookies no longer return an error page as a search answer; the provider is reported as expired and the search chain continues.
- Fixed browser WebMCP discovery and invocation on Chrome and Chromium 157 and later.
- Private hosts written with a trailing dot are now correctly handled by Ask and `always-ask-cached` before file tools access them.
- Fixed the TUI freezing when switching sessions from an open tool-approval prompt.
- Fixed `/commit` and eval `commit` dropping UTF-8 BOMs or mishandling quoted and Unicode filenames during change tracking and selective commits.
- Fixed misleading Wayland clipboard warnings when pasting an image or when the clipboard is empty.
- Fixed JavaScript evaluation after an in-place Linux upgrade by keeping session workers tied to the session's build.
- Deleting a session that cannot be removed no longer deletes its prompt history and statistics.
- Fixed `read` and `write` handling of line selectors on `xd://` device URLs.
- Fixed `eval wait()` rejecting or mishandling numeric delays; browser waits now direct users to the appropriate wait helpers.
- Fixed browser `open` with an existing Arch Chromium profile, Tern navigation, closed external Tern blocks, and docked Tern viewport emulation.
- Fixed Tern and WebKit browser calls that incorrectly exposed unsupported page event-listener APIs; errors now identify the supported alternatives.
- Fixed browser timeout and busy-page errors to include the current URL, affected tab, and actionable recovery guidance.
- Fixed Mnemopi embedding failures being silently downgraded to keyword search; provider errors now produce a warning, including in print mode on stderr.

## [18.20.2] - 2026-11-14

### Added

- Added the `antigravity-cli` provider for Google Antigravity over ACP, with managed binary installation, `/login antigravity-cli` Google sign-in, host tool execution, and retained conversations across tool steps and history changes.

## [18.20.1] - 2026-11-14
### Changed

- Picking a model for a role in `/models` now puts the cursor on the model list, so ↑/↓ choose a model and Enter assigns it right away instead of moving through the sidebar and dropping the role selection; ← still reaches the providers ([#14210](https://github.com/can1357/oh-my-pi/pull/14210) by [@H4vC](https://github.com/H4vC))
- Sped up secret redaction on long conversations: it no longer slows down as history grows ([#14213](https://github.com/can1357/oh-my-pi/pull/14213) by [@H4vC](https://github.com/H4vC))
- Startup is faster with plugins that bundle large dependency trees: the extension loader no longer re-reads and re-checks the same files while loading them (e.g. ~280 ms → ~185 ms with the IDA MCP plugin) ([#14219](https://github.com/can1357/oh-my-pi/pull/14219) by [@H4vC](https://github.com/H4vC))

### Fixed

- Fixed an `EPIPE: broken pipe` unhandled rejection crashing the session when a debug adapter, eval kernel, IDA worker, or RPC server exits mid-write (seen on Windows) ([#14196](https://github.com/can1357/oh-my-pi/pull/14196) by [@andrebrait](https://github.com/andrebrait))
### Added

- `tool_call` extension handlers can return `approve: true` to pre-approve a call, skipping the approval prompt (also without a UI) while `deny` policy, `block`, and provider safety checks still apply.
- `--max-turns <n>` stops the session after N agent turns.

### Fixed

- Pi extensions now see CLI values for their registered flags (`--my-flag`) when `getFlag()` is read inside the extension factory, instead of only the default.
- Added the Pi `ctx.modelRegistry.complete(model, context, options)` facade (accepts a string `systemPrompt`), so Pi extensions that run one-shot completions work on omp.
- Skill and prompt entries from `getCommands()` now carry Pi's `sourceInfo.path` alongside `path`.
- The extensions dashboard no longer marks a skill (or other item) "shadowed" by a copy from a source that is switched off or not opted in (e.g. `~/.claude`, `~/.codex`); the copy that actually loads now shows as active.

## [18.5.1] - 2026-10-03

### Added

- Added `/commit` to create commits containing only changes made by the agent or a selected subagent, while preserving other agents’ and the user’s work. The workflow is also available through the eval `commit` namespace, supports targeting repositories outside the session directory, handles binary and non-UTF-8 files, symlinks, file mode changes, and initial commits, and can optionally skip commit hooks with `no_verify`; use `commit.enabled` to disable it.
- Added `auth.unpausedProviders` (the **Unpaused Providers** setting) to re-enable paused providers such as Google Antigravity at your own risk while preserving their stored login state.
- Added configurable long-turn todo reminders through `todo.midRunNudges`, including options to disable reminders, limit them to two, or continue with increasing intervals.
- Pasting styled content into the composer now preserves Markdown formatting and places embedded images at their original positions, while code copied from editors remains plain text.
- Added the `session_clear` hook and extension event, emitted when `/clear` resets the current session context without changing its session ID.
- Added path-scoped Bash allow rules, project and configuration overlay precedence, and environment-variable controls through `bash.allowedEnvVars` and per-rule `env` settings.
- Subagents now preserve `@upstream` provider pinning when inheriting models.
- Added deletion of individual prompts from Ctrl+R history with the Delete key.
- Added `--no-judge`, `--no-spotlight`, and `--offline` options to restrict or disable auxiliary services outside the active model’s provider.
- Added per-rule TTSR `repeatMode` settings (`once`, `after-gap`, or `always`) to control reminder repetition.
- Bash approval prompts now show compound command segments individually and identify which segments are allowed or require approval.
- Todo `done`, `drop`, and `rm` operations now accept multiple tasks in a single request, including newline-, semicolon-, comma-, or space-separated input without splitting exact task-name matches.
- Todo status lines now display task counts when multiple targets are involved.

### Changed

- `/fork` and fork-from-transcript now abort an active response and fork immediately.
- Reduced default `grep` output by showing only matching lines and limiting matches per file; configure `grep.contextBefore` and `grep.contextAfter` to include surrounding context.
- Changed the default `spotlight.thinking` level from `low` to `med` for deeper result analysis and improved ranking, at a higher request cost.
- When Spotlight is enabled, commonly reread source and issue or pull-request content is shown more completely before outlining, including support for additional source file types.

### Fixed

- `/loop` now pauses after a provider error such as a rate limit instead of resubmitting the same prompt and attaching its `@file` mentions again ([#19272](https://github.com/can1357/oh-my-pi/issues/19272)).
- Resuming a session whose directory was deleted now continues in the current directory with a warning instead of failing.
- Model mentions and `/switch` completions now recover discovered models after provider discovery fails at startup, retrying discovery when needed.
- Background job results that arrive after an ACP prompt ends are now carried into the next prompt instead of starting an invisible turn.
- OpenAI server compaction failures now proceed to the next available compaction method instead of retrying server compaction on another model.
- Language servers now recognize edits made shortly after a file is created, including on macOS.
- Bash commands displayed in the Pseudo shell view now remain accurate while streaming through heredocs, substitutions, loops, continuations, arithmetic expressions, and background execution.
- Resuming a session or reviving a subagent after a retry fallback with a thinking suffix (e.g. `:xhigh`) now restores the primary model's own thinking level instead of keeping the fallback's ([#19273](https://github.com/can1357/oh-my-pi/issues/19273)).

## [18.20.0] - 2026-11-12

- With the Spotlight experiment on, a `read` with `:raw` returns the selected bytes instead of an outlined, compacted, collapsed or cut rendering ([#18713](https://github.com/can1357/oh-my-pi/pull/18713) by [@eggpeat](https://github.com/eggpeat))
- With the Spotlight experiment on, a `;`/`,` path `read` is shaped as one call: each part as that read alone would be (an outlined source file beside a `:raw` part kept verbatim), no part collapsed as already shown against another, and one trace whose notice opens the original ([#18713](https://github.com/can1357/oh-my-pi/pull/18713) by [@eggpeat](https://github.com/eggpeat))
- ACP `/session delete` no longer leaves an empty, untitled session in `session/list`; the replacement session is written only once it has content ([#19068](https://github.com/can1357/oh-my-pi/issues/19068))

### Breaking Changes

- `secrets.yml` regex rules are now Rust `regex` patterns run natively, in linear time: lookarounds and backreferences are no longer supported, and a `(?P<secret>…)` group marks the part to redact (text around it is context that stays); `\d`, `\w` and `\s` are Unicode-aware. A regex rule that does not compile stops startup with an error naming the file and entry instead of being skipped. Migrate `(?<=password=)\S+` to `password=(?P<secret>\S+)`; see [docs/secrets.md](https://github.com/can1357/oh-my-pi/blob/main/docs/secrets.md) ([#18965](https://github.com/can1357/oh-my-pi/pull/18965) by [@H4vC](https://github.com/H4vC))
- Secret placeholders are now four camelCased words after the friendly name, e.g. `GitHubToken_correctHorseStapleBattery`, with no `$$` delimiters, and the transcript shows the real value wherever the model wrote one. Placeholders in the old `$$NAME_HASH:CASE$$` form, in sessions saved before this change, stay literal text, including in tool calls the model copies them into; start a new session to get working placeholders ([#19014](https://github.com/can1357/oh-my-pi/pull/19014) by [@H4vC](https://github.com/H4vC))
- What the model writes from placeholders (replies, thinking, tool calls, summaries) is stored as written and replayed byte-identical, keeping thinking signatures and prompt caches valid; model output that still holds a value (written while redaction was off, or before the secret was configured) is redacted on replay. Values a regex rule finds later no longer rewrite earlier history. A `friendlyName` is shown to the model as written and is dropped only when it spells out its own secret ([#19014](https://github.com/can1357/oh-my-pi/pull/19014) by [@H4vC](https://github.com/H4vC))
- Nix builds with `withAppleFm = false` no longer compile the Apple Foundation Models bridge with the host's Xcode ([#18911](https://github.com/can1357/oh-my-pi/pull/18911))
- Apple Silicon Nix builds include Apple Foundation Models support instead of silently building without it ([#16584](https://github.com/can1357/oh-my-pi/pull/16584) by [@honsunrise](https://github.com/honsunrise))
- `ask` over RPC hosts without a form dialog now shows each prompt with the form's surrounding paragraphs, lists, preformatted blocks and tables instead of only the question ([#18927](https://github.com/can1357/oh-my-pi/issues/18927))

### Added

- Added the Gemini Decision 1 judge (`google/gemini-decision-1`) for the `judge` role, and `models.yml` accepts the `google-decisions` API ([#19060](https://github.com/can1357/oh-my-pi/pull/19060) by [@kevcube](https://github.com/kevcube))
- `ssh://` host listing, `ssh://` autocomplete and `/ssh list` now include the `Host` aliases from `~/.ssh/config` and `/etc/ssh/ssh_config` (following `Include`); `ssh.json` entries win on a name clash
- Added `find.verifyModel`, a model selector whose judge answers only `find`'s passage verification while filename and sketch ranking stay on the `judge` role ([#19006](https://github.com/can1357/oh-my-pi/pull/19006) by [@alphastorm](https://github.com/alphastorm))
- Added `omp bench --account` to benchmark a specific stored OAuth account, and report rejected priority requests instead of silently benchmarking standard speed.
- Text a browser or computer call types into a page or app, such as a password, no longer appears in plain text in an eval cell's status lines or the session file ([#18981](https://github.com/can1357/oh-my-pi/pull/18981) by [@will-bogusz](https://github.com/will-bogusz))
- Browser page-script observations in Tern and WebKit now mask password values, including values used as accessible names or descriptions ([#18983](https://github.com/can1357/oh-my-pi/pull/18983) by [@will-bogusz](https://github.com/will-bogusz))
- Chromium main-world `waitForFunction` calls no longer expose Puppeteer's internal ARIA query bindings to page scripts ([#18883](https://github.com/can1357/oh-my-pi/pull/18883) by [@will-bogusz](https://github.com/will-bogusz))
- On macOS a `computer` run that ends while secure input is on now starts with a note naming the app holding it and saying the user's Escape and typing go unseen until it ends, instead of nothing while `capabilities()` still reported `globalEscape: true` ([#18982](https://github.com/can1357/oh-my-pi/pull/18982) by [@will-bogusz](https://github.com/will-bogusz))
- Windows computer runs now explain when a locked or disconnected session, or a secure desktop, prevents capture and input from confirming your app's state ([#18947](https://github.com/can1357/oh-my-pi/pull/18947) by [@will-bogusz](https://github.com/will-bogusz))
- Computer helpers now reject unknown option and filter keys instead of silently ignoring them, including keys unused by the selected `wait` or element `press` overload, and name valid keys and likely spelling corrections ([#18753](https://github.com/can1357/oh-my-pi/pull/18753) by [@will-bogusz](https://github.com/will-bogusz))
- Selector waits on Chromium-backed browser tabs and their frames now accept `state: "attached" | "detached" | "visible" | "hidden"` alongside Puppeteer's `visible`/`hidden` forms, including live snapshot refs and waits that span a navigation, and reject unknown options, invalid values or conflicting visibility flags instead of silently ignoring them. Frame wait timeouts remain catchable later in the same run; Tern and cmux tabs are unchanged ([#18924](https://github.com/can1357/oh-my-pi/pull/18924) by [@will-bogusz](https://github.com/will-bogusz))
- Chromium main-world `waitForFunction` calls rearm across navigation after an earlier wait instead of rejecting with "Waiting failed" ([#18884](https://github.com/can1357/oh-my-pi/pull/18884) by [@will-bogusz](https://github.com/will-bogusz))
- In Chromium browser tabs, `tab.hover` and element-handle `hover()` on a hidden match now wait for it to appear and, if it never does, fail with the reason (and a selector's match count), as clicks do, instead of failing at once with Puppeteer's "Node is either not clickable or not an Element" ([#18750](https://github.com/can1357/oh-my-pi/pull/18750) by [@will-bogusz](https://github.com/will-bogusz))
- Treating the result of browser `tab.console()` or `tab.errors()` as an array now fails with a message saying to read its `.entries`, instead of `slice is not a function`, and the browser docs state the `{ entries, nextSeq, dropped }` shape ([#18738](https://github.com/can1357/oh-my-pi/pull/18738) by [@will-bogusz](https://github.com/will-bogusz))
- A printed browser `tab.observe()` result, including a full observation returned through `tab.run()` (not arbitrary objects with an `elements` array), or one left as a JavaScript Eval cell's last value, shows every element, one line each, instead of the first 100 followed by `... N more items`; an observation changed after it returned, including in-place prototype edits, prints as plain inspect output, every element included ([#18772](https://github.com/can1357/oh-my-pi/pull/18772) by [@will-bogusz](https://github.com/will-bogusz))

### Changed

- Secret redaction no longer rescans the whole conversation on every request: text already redacted in an earlier request is reused until a new secret changes the outcome, and `secrets.yml` regex rules skip text missing their leading literal, cutting redaction on a large session from 17–55 ms to about 1 ms per request and the first request after loading by 2–4×
- Trimmed the default system prompt: the tool-choice rules now only point to `read`, `edit` and `find`; the reasoning-format, AST and subagent-limit guidance is gone (`ast_edit`/`ast_grep` state their preference in their own summaries); the workflow, delivery and critical rules are shorter and no longer repeat each other; Spotlight's note on how tool results are shaped is a short list under Tool I/O instead of a paragraph at the end; and xd:// devices are listed by bare name
- `edit.modelVariants` now picks the longest matching model pattern instead of the first, so a specific key like `openai/gpt-5` wins over `gpt` whatever the config order ([#17835](https://github.com/can1357/oh-my-pi/pull/17835) by [@DeprecatedLuke](https://github.com/DeprecatedLuke))
- Browser tabs open in omp's own headless WebKit engine instead of managed Chromium when the engine, ABKit, is installed (`~/.o2/lib/abkit/ABHost`, `ABHost.exe` on Windows, the location Tern uses too; or the `browser.webkitPath` setting / `PI_BROWSER_WEBKIT_PATH`): pages see a visible, focused window with no automation flag, and a default tab runs no omp script in the page (console, errors and the request log come from the engine; `route`, geolocation/locale/offline emulation, `vitals` and `reactEnable` add page code only when called; response bodies are unavailable there). Chromium still opens `headed` tabs where the engine ships no viewer and takes over, saying why, when the engine cannot start; `app: "chromium"` picks Chromium for one open and `app: "webkit"` requires WebKit (with `headed: true` its tab opens in a window), and the `browser.webkit` setting or `PI_BROWSER_WEBKIT=0` turns it off. On macOS the engine has WebGL, WebGPU, silent video and audio playback, Web Audio, WebRTC, WebAuthn, gamepads and Web Share, and its TLS handshake, HTTP/2 settings and request headers are the ones Safari sends
- omp downloads its WebKit engine, ABKit, from build.stencil.so into `~/.o2/lib/abkit` (checked against the build's SHA-256) for `app: "webkit"` when it is missing, and before Chrome for Testing when an open finds no browser installed; a failed download leaves that open on Chromium and says why
- The `task` tool description now lists only the delivery rules (results auto-deliver, `wait`, unverified `completed`); the `read proc://`, `write proc://<id>/kill`, job-expiry and `write agent://` reference arrives with the session's first spawn result
- The `ask.timeout` setting, README and RPC schema docs now describe the `ask` tool as an HTML form that submits its current values on timeout, not a question picker that auto-selects an option
- The `bash` tool description lists the embedded shell's in-process builtins again, straight from the shell, so it follows every `PI_DISABLE_*` switch and the platform
- `read`'s selectors for SQLite, archives, JSON queries, executables, video and SVG, and the sub-path grammar of `proc://`, `ssh://` and `issue://`/`pr://`, no longer ship with every request: the model reads them on demand at `xd://read/sources` and `xd://read/urls`, and they stay inline when `read` is off
- `/browser visible` and `/browser headless` now show and hide the windows of omp's WebKit tabs at once instead of waiting for the next open: where the engine ships its viewer (macOS), each tab gets a window of its own that the user can also click, scroll and type in, and `headed: true` or `browser.headless` off keeps a tab on WebKit with a window instead of sending it to Chromium. Chromium tabs still change mode with the next open
- In a Tern whose engine reads the DOM natively, browser `observe`, selectors, clicks, typing, element reads and waits no longer run script in the page: the engine finds elements (across frames and closed shadow roots) and every action is trusted input at the point it resolved; `type` then types at the caret its click places, and `text/` selectors ignore case
- A browser screenshot's text is one line (the size the model sees, the full-size file when one was kept, and the coordinate factor for `tab.clickAt`) instead of four lines with byte sizes and formats, and `browser.open` reports the tab, the page it landed on when that is not the requested URL (using navigation's normalized URL comparison), and the title on one line ([#18776](https://github.com/can1357/oh-my-pi/pull/18776) by [@will-bogusz](https://github.com/will-bogusz))
- RPC `select` requests carry `initialIndex`, `selectionMarker`, `checkedIndices` and `markableCount`, so hosts can show which `ask` checkbox options are already checked instead of letting users toggle them blind ([#18929](https://github.com/can1357/oh-my-pi/pull/18929) by [@andrebrait](https://github.com/andrebrait))
- Every language server now hands file watching to omp (it was only TypeScript 7); set `watchFiles: false` on a server to keep its own watcher
- A failed JavaScript Eval cell prints the error's message and the cell's own frames, with one line counting the hidden frames from omp's runtime, its dependencies and the engine, instead of the full host stack; project-local dependency frames stay visible, cached stacks whose headers no longer match the error stay intact, floating rejections retain their current message and missing-await hint even with a cached stack, and `print(e.stack)` in a `catch` still shows every frame ([#18775](https://github.com/can1357/oh-my-pi/pull/18775) by [@will-bogusz](https://github.com/will-bogusz))
- Snapcompact compaction resolves the frame shape once in its preflight and passes it to `compact()`, which re-derived it with the `auto` shape setting; the preflight scans the transcript once instead of twice, runs as the `compaction.snapcompact` loop phase, and yields to the event loop before rendering ([#15689](https://github.com/can1357/oh-my-pi/issues/15689), [#18867](https://github.com/can1357/oh-my-pi/pull/18867) by [@wolfiesch](https://github.com/wolfiesch))
- Full session file rewrites (pruning, image drops, rescue stamping) run as the `session.rewrite` loop phase, so their stalls are attributed in `ui.loop-blocked` logs ([#15027](https://github.com/can1357/oh-my-pi/issues/15027), [#18867](https://github.com/can1357/oh-my-pi/pull/18867) by [@wolfiesch](https://github.com/wolfiesch))

### Fixed

- With the Spotlight experiment on, a `read` with `:raw` returns the selected bytes instead of an outlined, compacted, collapsed or cut rendering ([#18713](https://github.com/can1357/oh-my-pi/pull/18713) by [@eggpeat](https://github.com/eggpeat))
- With the Spotlight experiment on, a `;`/`,` path `read` is shaped as one call: each part as that read alone would be (an outlined source file beside a `:raw` part kept verbatim), no part collapsed as already shown against another, and one trace whose notice opens the original ([#18713](https://github.com/can1357/oh-my-pi/pull/18713) by [@eggpeat](https://github.com/eggpeat))
- Fixed false unknown-model fallback warnings on cold or stale caches for authenticated `openai-codex`, `google-antigravity`, and `google-gemini-cli` providers, stopped disabled cold-cache providers from deferring fallback warnings, and stopped lazy catalog loads from overwriting completed or failed discovery states ([#19017](https://github.com/can1357/oh-my-pi/pull/19017) by [@PGupta-Git](https://github.com/PGupta-Git))
- ACP clients such as Orca now show an `ask` HTML form's "Other" text box inside its radio/checkbox question instead of as a second, duplicate question ([#19028](https://github.com/can1357/oh-my-pi/issues/19028))
- Fixed background jobs (`&`), subshells and command substitutions in the `bash` tool seeing changes the parent shell made after they started; they now keep the variables, positional parameters (`$1`, `$@`), functions, aliases and shell options they started with, as in bash ([#19072](https://github.com/can1357/oh-my-pi/pull/19072) by [@H4vC](https://github.com/H4vC); reported in [#18990](https://github.com/can1357/oh-my-pi/pull/18990) by [@alphastorm](https://github.com/alphastorm))
- MCP tools returning lists or strings no longer repeat their payload in the model's context when the server also sends SDK-wrapped structured content ([#18894](https://github.com/can1357/oh-my-pi/issues/18894), [#18920](https://github.com/can1357/oh-my-pi/pull/18920) by [@yuzu-octopus](https://github.com/yuzu-octopus))
- In Chromium browser tabs, `page.evaluate`, `evaluateHandle`, `$eval`, `$$eval` and `waitForFunction` inside `tab.run` now see the page's own globals and custom elements, as `tab.evaluate` does, instead of `null` or `undefined`; waits support concise methods, poll at page-side intervals, reject invalid polling options, preserve abort reasons and stop polling on cancellation, disposing late results ([#18751](https://github.com/can1357/oh-my-pi/pull/18751) by [@will-bogusz](https://github.com/will-bogusz))
- Fixed `omp bench --account`, `omp dry-balance --bench`, and security scans pinned to one OAuth account sending the raw access token to providers whose API key is a structured credential (GitHub Copilot, Gemini CLI, Antigravity, Snowflake); they now send the same key normal requests do ([#19030](https://github.com/can1357/oh-my-pi/pull/19030) by [@Xytronix](https://github.com/Xytronix))
- A hashline `PUT` whose body repeats the line just outside its range and otherwise leaves the range unchanged now adds that copy, instead of silently doing nothing while reporting an auto-repaired boundary echo ([#18234](https://github.com/can1357/oh-my-pi/pull/18234) by [@eggpeat](https://github.com/eggpeat))
- `omp --help` lists the tool names `--tools` accepts, grouped into enabled-by-default and optional; browser and computer use are documented as `eval` features ([#19064](https://github.com/can1357/oh-my-pi/pull/19064) by [@nibblebot](https://github.com/nibblebot))
- Added Liquid AI judges (`liquid/d1.1`, `liquid/d1-ultra`) for the `judge` role; images are resized to fit Liquid's per-request patch budget ([#18076](https://github.com/can1357/oh-my-pi/issues/18076), [#18100](https://github.com/can1357/oh-my-pi/pull/18100) by [@SuperUserA](https://github.com/SuperUserA))
- Added Nace Drex judges (`nace/drex-max-v1.1`, `nace/drex-max-finance`, `nace/drex-v2.0`) for the `judge` role, including Drex Max image judgments ([#18950](https://github.com/can1357/oh-my-pi/pull/18950) by [@alphastorm](https://github.com/alphastorm))
- Added the `find.hitThreshold` setting (above 0, up to 1; unset keeps 0.2): the probability a verified passage needs before `find` and `omp find` report its file or list its range, so a judge other than TypeSafe Jev can run at the cutoff that fits its calibration ([#18963](https://github.com/can1357/oh-my-pi/pull/18963) by [@alphastorm](https://github.com/alphastorm))
- GitHub Actions watches now show per-step progress, states, and durations, with Ctrl+O expansion and native Tern Surface Protocol views ([#18945](https://github.com/can1357/oh-my-pi/pull/18945) by [@anatoli-tsinovoy](https://github.com/anatoli-tsinovoy)).
- Computer instructions now describe macOS `StaleRef` refusals for relabelled controls, including the new ref and the weaker role-and-label recovery candidate from a partial window read ([#18892](https://github.com/can1357/oh-my-pi/pull/18892) by [@will-bogusz](https://github.com/will-bogusz))
- Computer-use guidance tells the agent to reread the window after `UserIntervened` on X11 as well as macOS, without undoing or replaying over the user's input ([#18784](https://github.com/can1357/oh-my-pi/pull/18784) by [@will-bogusz](https://github.com/will-bogusz))
- Computer raise refusals say that on X11 a covered window's screenshot needs a compositing manager, instead of promising one plain X11 cannot supply ([#18783](https://github.com/can1357/oh-my-pi/pull/18783) by [@will-bogusz](https://github.com/will-bogusz))
- The `computer` tool's takeover `type` on Windows no longer loses the end of the text in apps that read keys slowly, such as Chrome, while reporting success, and says in its output when the text was sent but the app was not seen reading it ([#19037](https://github.com/can1357/oh-my-pi/pull/19037) by [@will-bogusz](https://github.com/will-bogusz))
- Fixed `wait` returning "Nothing to wait for" after a directly messaged agent sent an `agent://all` broadcast before replying, instead of blocking for its direct reply ([#18976](https://github.com/can1357/oh-my-pi/pull/18976) by [@alphastorm](https://github.com/alphastorm))
- Fixed the TUI marking pending or in-progress todos completed when a subagent with a matching or similar description finishes; matching todos still highlight while the subagent runs and are marked completed only through `todo` or `/todo` ([#18975](https://github.com/can1357/oh-my-pi/pull/18975) by [@alphastorm](https://github.com/alphastorm))
- Fixed worker-thread subagents logging `Failed to bind extension … <inline-0>` on every spawn and subagents reporting themselves to Warp as separate sessions; an SDK inline extension that worker threads cannot load now logs one warning naming it ([#18980](https://github.com/can1357/oh-my-pi/pull/18980) by [@alphastorm](https://github.com/alphastorm))
- Fixed the shell's `ls` builtin so non-numeric `-T`/`--tabsize` values (such as `ls -laT dir`, which previously listed the working directory) and overflowing `-w`/`--width` values with trailing non-digits now fail with exit 2 ([#18985](https://github.com/can1357/oh-my-pi/pull/18985) by [@alphastorm](https://github.com/alphastorm))
- Fixed `read` JSON queries (`archive.tar:member.json?q=.x`) on text archive members failing with `not found inside archive` while preserving literal `?` member names and member or query-output line selectors ([#18970](https://github.com/can1357/oh-my-pi/pull/18970) by [@alphastorm](https://github.com/alphastorm))
- Fixed `write` LSP diagnostics warning that a `#!` script is not executable (such as Ruff `EXE001`) on calls that mark the file executable (`chmod +x`) ([#18978](https://github.com/can1357/oh-my-pi/pull/18978) by [@alphastorm](https://github.com/alphastorm))
- Fixed `read xd://<tool>` and `write xd://<tool>` for unambiguous wire aliases of enabled tools (such as `xd://apply_patch` when `edit` uses `apply_patch` mode) so they return tool docs, run with the tool's approval tier, and no longer fail with `No such tool` ([#18977](https://github.com/can1357/oh-my-pi/pull/18977) by [@alphastorm](https://github.com/alphastorm))
- Fixed `yield` rejecting a JSON-string `data` payload with `expected object, received string` when the decoded value fails the output schema; it now reports the decoded field violations ([#18971](https://github.com/can1357/oh-my-pi/pull/18971) by [@alphastorm](https://github.com/alphastorm))
- Fixed `github` `run_watch` marking failed-job logs unavailable when they contain ANSI or other terminal escape sequences, returning plain-text logs on both current and older GitHub CLI (`gh`) releases ([#18968](https://github.com/can1357/oh-my-pi/pull/18968) by [@alphastorm](https://github.com/alphastorm))
- Fixed `edit` results after `lsp.formatOnWrite` (or an editor's format-on-save) reformatted the file showing the lines as sent under the formatted file's `[path#TAG]`; the result now shows the written lines and no longer blames the editor ([#18998](https://github.com/can1357/oh-my-pi/issues/18998))
- Fixed prewalk handing off to the cheaper model on exec-tier `xd://` device calls (test runners, remote commands, extension devices) and on `proc://` service stdin or mode writes, before any file was changed ([#19002](https://github.com/can1357/oh-my-pi/issues/19002))
- TypeScript 7 (`typescript-native`) no longer runs its own file watcher: omp watches the files it registers and reports changes, including ones made outside omp, so on Linux it sees edits from other tools instead of keeping stale diagnostics, and on network drives such as ovnfs checkouts its watcher no longer loops, keeping the drive's file server busy and stalling every checkout on it. Other servers opt in with the `watchFiles` server setting ([#18964](https://github.com/can1357/oh-my-pi/pull/18964) by [@H4vC](https://github.com/H4vC))
- Folders moved into a watched project now report their files to language servers, and folders moved out or renamed report their deletion, so servers no longer keep stale or missing files after `mv` or a package install
- Language servers that watch files through omp no longer get changes under `node_modules` packages or `.git` object stores unless they asked for those directories, matching VS Code's default watcher excludes
- On Linux, a project too large for inotify's watch limit is watched one directory at a time instead of losing all file watching, and on network drives a lagging server clock no longer hides changes found after a watcher overflow
- Fixed the `grep` tool so directly named files containing NUL bytes are searched as text, directory and glob searches name skipped binary files that match instead of reporting `No matches found`, and returned match and context lines strip NUL, ANSI escape, and control characters ([#18988](https://github.com/can1357/oh-my-pi/pull/18988) by [@alphastorm](https://github.com/alphastorm))
- Added the `encourageEdits` setting (default on), which makes the system prompt require the `edit` tool and forbid sed/perl/python file edits; turn it off to drop that guidance.
- A browser call from Eval that sets no timeout of its own, such as `tab.evaluate(…)` or `tab.run(fn)`, now runs as long as the Eval cell's `timeout` instead of failing at 30 seconds, and a call that runs out of time says what happened to the tab and how to give it longer ([#18737](https://github.com/can1357/oh-my-pi/pull/18737) by [@will-bogusz](https://github.com/will-bogusz))
- Cancelling a browser call now releases an unresponsive worker after its cancellation grace instead of waiting for the full call budget, and recovery after a timeout has its own bounded startup budget ([#18737](https://github.com/can1357/oh-my-pi/pull/18737) by [@will-bogusz](https://github.com/will-bogusz))
- Cmux browser helpers now use the active browser call's remaining time instead of cutting long evaluations off at the socket's 30-second default or giving late helpers a fresh full timeout; cancelling discards queued helpers and interrupts active socket requests so later calls can proceed ([#18737](https://github.com/can1357/oh-my-pi/pull/18737) by [@will-bogusz](https://github.com/will-bogusz))
- MCP tools called through `write` to `xd://` devices now honor their device names in `model.toolCallLoopGuard.exemptTools`, in both the main agent and advisor ([#18860](https://github.com/can1357/oh-my-pi/issues/18860))
- `computer.close()` no longer disables desktop control for the rest of the session: the next `computer` call opens a fresh desktop session instead of failing with `Computer session is closed`
- An extension provider with an `oauth.modifyModels` hook no longer loads the whole model catalog at registration while that provider has no login ([#18821](https://github.com/can1357/oh-my-pi/pull/18821) by [@iliaal](https://github.com/iliaal))
- Saving each session entry no longer blocks the UI for several milliseconds on Windows, where on-access scanning delayed the two re-opens of the session file that every write performed ([#18819](https://github.com/can1357/oh-my-pi/pull/18819))
- A `retry.fallbackChains` model key written with a dotted revision (`anthropic/claude-sonnet-5.5`) now applies to the model it names ([#18951](https://github.com/can1357/oh-my-pi/pull/18951) by [@wolfiesch](https://github.com/wolfiesch))
- Sharpshooter consolidation no longer gets stuck retrying every minute once the memory files grow large: the output budget now fits three full files, a cut-off reply is reported as truncated instead of `must call replace_memory_files exactly once`, and failed runs back off (one interval, doubling up to 6 hours) ([#18938](https://github.com/can1357/oh-my-pi/issues/18938))
- The advisor now backs off between failed turns (doubling per failure, with jitter) and waits for a provider `Retry-After` hint, instead of retrying every second in step with other sessions ([#18957](https://github.com/can1357/oh-my-pi/pull/18957) by [@joshuaswarren](https://github.com/joshuaswarren))
- In ACP mode, an `ask` form the client fails to show (e.g. a JSON-RPC `-32602` for an unsupported field) now returns the client's error to the agent instead of reporting `Ask tool was cancelled by the user` and aborting the turn ([#18887](https://github.com/can1357/oh-my-pi/issues/18887))
- `omp update` runs mise, Homebrew, bun, and npm on the terminal's own output, so their progress bars redraw in place instead of printing every frame as a new line ([#18874](https://github.com/can1357/oh-my-pi/pull/18874) by [@a-glapinski](https://github.com/a-glapinski))
- Fixed Anthropic prompt caching freezing for the rest of a turn when a `context` extension rewrites messages the same way on every request (for example a stable tag prefix on each message): every rewritten message was marked per-call, so the rolling breakpoint could not land on anything the tool loop appended and each step re-billed the whole tail as uncached input. A rewritten message is now per-call only once its bytes differ from the previous request; streamed assistant messages are no longer marked per-call just because `structuredClone` dropped their streaming symbols ([#12392](https://github.com/can1357/oh-my-pi/issues/12392), [#18869](https://github.com/can1357/oh-my-pi/pull/18869) by [@tsankotsanev](https://github.com/tsankotsanev))

### Removed

- Removed `task.file` and the task tool's `taskFile` field; subagent instructions are always inline
- Todo tasks can no longer be blocked: the `blocked` status and `blocker` note are gone from the `todo` tool, `/todo edit` (`[!]` is now an unknown marker), the HUD, ACP plans, goal continuation (which no longer pauses on a blocked-only list) and the RPC `TodoStatus`/`TodoItem` wire types and SDKs (Go, Python, Rust). A saved todo list that still holds a blocked task reads back with it pending on resume

## [18.19.0] - 2026-11-12

### Breaking Changes

- Changed the browser `open` API: `ignore_https_errors` is now `insecure`, `allow_file_access` has been removed, and `file:` pages can access other local files.
- Changed the browser `open` and `targets` `app` option from an object to a string or CDP endpoint/executable path. Use `argv` instead of `app.args` and the top-level `target` instead of `app.target`.
- Removed `task.file` and the task tool's `taskFile` field; subagent instructions must now be provided inline.
- Removed blocked todo tasks and the `blocked` status/blocker metadata. Existing blocked tasks are restored as pending.

### Added

- Added `systemPromptTemplates`, which maps model-selector patterns to Handlebars template files for customizing system prompts. Templates re-render when switching models, with warnings and fallback to the bundled prompt for missing or invalid templates.
- Added ordered multi-step tasks through `task.steps`. Subagents receive steps sequentially, and the final step determines the task result; interrupted tasks resume with their remaining steps.
- Added Liquid AI judge models `liquid/d1.1` and `liquid/d1-ultra`, including image resizing for Liquid's request limits.
- Added per-step progress, state, and duration reporting for GitHub Actions watches, with expandable details and native Tern Surface Protocol views.
- Added `task.autoParallel` (`off`, `suggest`, or `on`) to identify subtasks that can run concurrently and optionally delegate them in a single parallel task call.
- Added portable `awk`, `tar`, `lsof`, `shasum`, `md5`, and `strings` support to the `bash` tool, including Windows support and internal-URI paths.

### Changed

- Browser sessions now prefer the bundled ABKit WebKit engine when available, with automatic installation and SHA-256 verification. WebKit provides headed, user-visible tabs and broader browser compatibility; Chromium remains the fallback and can be selected explicitly with `app: "chromium"`, while `app: "webkit"` requires WebKit. Configure this behavior with `browser.webkit` and `browser.webkitPath` or the corresponding environment variables.
- Browser visibility controls now show or hide WebKit tab windows immediately. Headed WebKit tabs can be interacted with directly, while Chromium tabs retain their existing mode-switching behavior.
- In Tern environments with native DOM access, browser observation and interaction use trusted native input across frames and closed shadow roots, with caret-aware typing and case-insensitive text selectors.
- `edit.modelVariants` now uses the longest matching model pattern, so specific patterns take precedence over generic ones regardless of configuration order.
- The `ask` tool now submits the form's current values when its timeout expires; updated settings and documentation reflect this behavior.
- The `read` tool loads detailed format selectors and URI sub-path syntax on demand, reducing the default request description while retaining inline details when `read` is disabled.
- The default system prompt and tool descriptions have been streamlined, with guidance moved closer to the tools and detailed task/procedure references provided when relevant.
- The `bash` pseudo view renders words built from literals and expansions as f-strings (`f"repos/org/{r}/rulesets"`) instead of `concat(...)` calls.

### Fixed

- Fixed `computer.close()` so subsequent computer-control calls start a fresh desktop session instead of failing.
- Fixed extension providers with `oauth.modifyModels` so they do not load the full model catalog before login.
- Fixed resuming sessions so it no longer scans unrelated later session transcripts.
- Fixed session saving on Windows to avoid UI stalls caused by repeated session-file access.
- Fixed automatic chart selection so generated charts use compatible data and chart types.
- Fixed `bash` previews for `env -i` commands so they display the requested command rather than generated shell setup code.

## [18.18.9] - 2026-11-11

### Added

- Added Sofya as a web search engine (`web/sofya`), using `SOFYA_API_KEY` or a stored `sofya` credential ([#18185](https://github.com/can1357/oh-my-pi/pull/18185) by [@yusufgurdogan](https://github.com/yusufgurdogan))
- Documented autoresearch mode in [docs/autoresearch.md](https://github.com/can1357/oh-my-pi/blob/main/docs/autoresearch.md): activation and its git gates, the three stop conditions, the per-segment iteration cap that defaults to none, the harness `METRIC`/`ASI` contract, and the on-disk store that `OMP_AUTORESEARCH_DB_DIR` relocates ([#18655](https://github.com/can1357/oh-my-pi/pull/18655) by [@sjawhar](https://github.com/sjawhar))
- Extensions can import the form theme, the native span helpers (`styledSpans`, `compactText`, `rowsText` and the rest of the ANSI/span conversions), the `xd://` URL helpers (`parseXdUrl` and friends) and the `cfgExtensionTranscriptPresenters` setting handle from `@oh-my-pi/pi-coding-agent` instead of internal module paths, which stop the extension from loading when a file moves ([#18849](https://github.com/can1357/oh-my-pi/pull/18849) by [@materemias](https://github.com/materemias))
- `/context` shows loaded instruction files and skills in their own categories; System Prompt marks where each one sits without counting it twice, and notes when an extension or SDK callback changed the prompt after it was built ([#17971](https://github.com/can1357/oh-my-pi/pull/17971) by [@c-w-z](https://github.com/c-w-z))
- Added Hacker News search (`web/hackernews`): `web_search` queries scoped to `site:news.ycombinator.com` now search HN stories and comments through the keyless HN Search API before the configured engines

### Changed

- A role edit in another omp instance no longer rewrites the `task` and `eval` tool descriptions of every running session, which was invalidating the Anthropic prompt cache from the tool definitions onward and dropping signed thinking blocks on prefix-bound models; the per-call model advertisement is now frozen into the base prompt surface and changes only when that surface rebuilds ([#18716](https://github.com/can1357/oh-my-pi/issues/18716), [#18732](https://github.com/can1357/oh-my-pi/pull/18732) by [@yuzu-octopus](https://github.com/yuzu-octopus))
- Agent-to-agent messages now always reach the recipient as user turns: one that ends a `wait` arrives right after it instead of inside the `wait` tool result, and none is sent with developer or system authority
- Launch services now persist for non‑interactive sessions
- The shell's built-in `jq` now behaves like jq 1.8.2 instead of jaq: the same output (number formatting, colors, `-S`, `--indent`, `--seq`, `--stream`), error messages and exit statuses, jq's full option set (`--version` reports `jq-1.8.2`), and its grammar and builtins (`?//`, `$__loc__`, modules, `getpath`/`setpath` creating missing paths, `|=` deletions, Oniguruma regexes, dates); it passes jq 1.8.2's own test suite

### Fixed

- Nix builds with `withAppleFm = false` no longer compile the Apple Foundation Models bridge with the host's Xcode ([#18911](https://github.com/can1357/oh-my-pi/pull/18911))
- Apple Silicon Nix builds include Apple Foundation Models support instead of silently building without it ([#16584](https://github.com/can1357/oh-my-pi/pull/16584) by [@honsunrise](https://github.com/honsunrise))
- On Windows, the bash tool runs external commands when omp itself runs in an AppContainer sandbox, instead of failing every one with `Permission denied` (exit 126) ([#18800](https://github.com/can1357/oh-my-pi/pull/18800) by [@devjay4561](https://github.com/devjay4561))
- Explicit Bash prompt rules remain enforced in yolo mode when a command also matches a critical pattern ([#18788](https://github.com/can1357/oh-my-pi/pull/18788) by [@jasonharrison](https://github.com/jasonharrison)).
- Fixed job widgets and captions failing outright when the `widget` model errors: they now try the role's next model (`retry.fallbackChains.widget`, else the built-in `smol` defaults) and fail only once every candidate has ([#18793](https://github.com/can1357/oh-my-pi/issues/18793))
- Failed job-widget, job-caption, cache-warm, composer-prediction, and subagent completion-probe calls now keep the provider's error message in their session usage records ([#18792](https://github.com/can1357/oh-my-pi/issues/18792))
- `/changelog`, `/changelog full`, and `/changelog last N` now list releases newest-first, matching `CHANGELOG.md` and the startup release notes ([#18809](https://github.com/can1357/oh-my-pi/issues/18809))
- Fixed a `read` placed after a `bash` call in the same message returning the file as it was before that command changed, created or deleted it, in primary and advisor turns ([#16274](https://github.com/can1357/oh-my-pi/pull/16274) by [@will-bogusz](https://github.com/will-bogusz))
- RPC/ACP `/session delete` now switches the live session before deleting its file, so later turns save to a new, resumable session ([#18665](https://github.com/can1357/oh-my-pi/issues/18665)).
- Browser `tab.click`, `tab.dblclick`, `tab.check`, `tab.uncheck`, `tab.uploadFile` and `frame.click` on Chromium tabs now look their selector up again when the page replaces the element before the click goes out, including during and after delivery watcher setup, instead of waiting out the action timeout on the replaced element; a click through an element handle or an `aria-ref` whose element was replaced fails at once ([#18676](https://github.com/can1357/oh-my-pi/pull/18676) by [@will-bogusz](https://github.com/will-bogusz))
- A browser `tab.run` whose code uses `document`, `window`, `location` or another page-only global now says the code runs in omp's runtime, not the page, and to use `tab.evaluate`, instead of only "document is not defined" ([#18840](https://github.com/can1357/oh-my-pi/pull/18840) by [@will-bogusz](https://github.com/will-bogusz))
- JavaScript eval cells and `tab.run`/`computer.run` strings ending in assignments, blocks, loops, or declarations now return nothing; trailing expressions and explicit returns still produce values ([#18865](https://github.com/can1357/oh-my-pi/pull/18865) by [@will-bogusz](https://github.com/will-bogusz))
- A page calling `window.print()` no longer hangs the browser omp launches: `print()` returns at once and `tab.pdf()` still makes PDFs ([#18838](https://github.com/can1357/oh-my-pi/pull/18838) by [@will-bogusz](https://github.com/will-bogusz))
- `tab.select()` and element-handle `select()` return the options selected after the page's `input` and `change` handlers ran, instead of the choice the page then reset (Chromium tabs) or an option the page's handler had just replaced (cmux and Tern tabs) ([#18829](https://github.com/can1357/oh-my-pi/pull/18829) by [@will-bogusz](https://github.com/will-bogusz))
- `tab.waitForDownload()` fails, naming the path it looked for, when no file is there on omp's machine, as with a browser reached through `app.cdp_url` on another machine, instead of returning a path that does not exist; such a download is left out of `tab.downloads()` ([#18830](https://github.com/can1357/oh-my-pi/pull/18830) by [@will-bogusz](https://github.com/will-bogusz))
- When Chrome detaches omp from a relay tab omp opened and omp cannot reattach, the error now says omp tried to close that tab and to open a new one, instead of telling the agent to navigate it in Chrome; a failed close may be deferred until the relay reconnects ([#18832](https://github.com/can1357/oh-my-pi/pull/18832) by [@will-bogusz](https://github.com/will-bogusz))
- A relay `app.target` that matches no tab now recommends omitting `app.target` to open omp's own tab ([#18833](https://github.com/can1357/oh-my-pi/pull/18833) by [@will-bogusz](https://github.com/will-bogusz))
- Judgments skip a judge candidate for five minutes after it answers 404 for its model, as they already do after a 401/402/403, instead of re-sending the failing request on every judgment of a `find` call ([#18854](https://github.com/can1357/oh-my-pi/issues/18854))
- Fixed Tern and other OSC 7501 terminals showing a session as `working`, with no needs-you alert, while a dialog waits on you, such as a `ctx.ui.confirm` an extension's `tool_call` handler opens to gate a command: every dialog the TUI shows (extension and hook dialogs, tool approvals, `ask`, `cfg://` changes, the coding-plan reserve confirm, plan review) now reports `blocked` with what it asks until you answer, and a tool approval reports `working` again as soon as you answer it ([#15107](https://github.com/can1357/oh-my-pi/issues/15107), [#18868](https://github.com/can1357/oh-my-pi/pull/18868) by [@wolfiesch](https://github.com/wolfiesch))
- The shell's built-in `jq` no longer slows down quadratically on repeated updates such as `reduce range(n) as $i ([]; . + [$i])`
- `/tan` completion notices now quote the user's request and mark the result as the user's tangent, so the main agent no longer mistakes it for its own work
- `omp zsh` with zsh-autosuggestions' `completion` strategy no longer echoes each typed key onto new lines: `vared` inside a `zpty` command now edits on the pty instead of the shell's terminal
- An instruction file that leaves a code fence open has it closed at its end, so the rest of the system prompt is formatted as usual ([#17971](https://github.com/can1357/oh-my-pi/pull/17971) by [@c-w-z](https://github.com/c-w-z))
- Read-only activity stays visible after snap-compaction or another mid-turn transcript rebuild instead of leaving the UI stuck on “Working…” ([#18876](https://github.com/can1357/oh-my-pi/pull/18876) by [@JustasMasiulis](https://github.com/JustasMasiulis)).
- With the Spotlight experiment on, a session now warns when Spotlight finds no Stencil credential, once each time the credential goes missing, and says how to sign in again; the `spotlight:shape` journal entry records failed Spotlight calls by cause (`failureCauses`) ([#18850](https://github.com/can1357/oh-my-pi/pull/18850) by [@wolfiesch](https://github.com/wolfiesch))

### Removed

- Removed `/mcp smithery-search`, `/mcp smithery-login` and `/mcp smithery-logout`; Smithery shut down its API on October 31, 2026 ([#18822](https://github.com/can1357/oh-my-pi/pull/18822) by [@samettemizer](https://github.com/samettemizer))

## [18.18.8] - 2026-11-11

### Changed

- `curl -fsSL https://omp.sh/install | sh` and `install.ps1` now install the standalone binary by default, even when bun is present, so installs get delta updates; pass `--source`/`-Source` for a bun package install
- Ask forms can attach notes to selected options; those notes accompany the answers separately from submitted form values ([#18779](https://github.com/can1357/oh-my-pi/pull/18779) by [@Shadorain](https://github.com/Shadorain))

### Fixed

- Claude auto-redeem now spends a full saved reset on an account blocked by its weekly limit when the reset also clears the Fable cap; such resets were treated as Fable-only and skipped while Fable usage had room ([#18801](https://github.com/can1357/oh-my-pi/pull/18801))
- Fixed agents showing as idle in the Agent Hub while still running after a failed streaming edit preview (`edit.streamingAbort`) auto-recovered the turn ([#18790](https://github.com/can1357/oh-my-pi/pull/18790) by [@H4vC](https://github.com/H4vC))
- A browser call on a tab that is not open now says to open it with `await browser.open({ name })` (Python: `await browser.open(name=…)`) and the url and app it was opened with, instead of pointing at the removed `action:"open"` ([#18739](https://github.com/can1357/oh-my-pi/pull/18739) by [@will-bogusz](https://github.com/will-bogusz))
- Fixed `computer.window({ app })` and `computer.windows({ app })` matching similarly named apps when the exact app name has an open window, such as Google Chrome alongside Google Chrome for Testing ([#18744](https://github.com/can1357/oh-my-pi/pull/18744) by [@will-bogusz](https://github.com/will-bogusz))
- In Tern, browser `role/` selectors keep input roles and names under Turkish and Azeri locales ([#18658](https://github.com/can1357/oh-my-pi/pull/18658) by [@will-bogusz](https://github.com/will-bogusz))
- Chrome `role/RootWebArea` waits with `visible` return the document instead of failing, and `hidden` waits keep waiting ([#18658](https://github.com/can1357/oh-my-pi/pull/18658) by [@will-bogusz](https://github.com/will-bogusz))
- An `omp -p` or other omp that your session's bash tool or eval cell starts inside Tern or cmux no longer picks Tern or cmux from the pane it inherited, so its browser tabs stop floating over your pane ([#18773](https://github.com/can1357/oh-my-pi/pull/18773) by [@will-bogusz](https://github.com/will-bogusz))
- Browser relay connections sharing a tab no longer lose cross-site frames when another connection disables auto-attachment on its page; automatic children detach locally when their last armed page leaves, while explicitly attached frame subtrees remain usable after opting out ([#18657](https://github.com/can1357/oh-my-pi/pull/18657) by [@will-bogusz](https://github.com/will-bogusz))
- Browser agents now say when a step can't be done through the page, instead of patching the page with scripts and reporting the step as done ([#18761](https://github.com/can1357/oh-my-pi/pull/18761) by [@will-bogusz](https://github.com/will-bogusz))
- An extension's `assistant_message` rewrite now reaches the next Codex Responses request: same-model native replay used to resend the captured original text while the transcript showed the rewritten one ([#18312](https://github.com/can1357/oh-my-pi/issues/18312))
- MCP reconnects and tool-list refreshes now keep extension-deactivated tools inactive while enabling newly discovered tools ([#18678](https://github.com/can1357/oh-my-pi/issues/18678)).
- Exiting after aborting a `bash` command now waits for its TERM-resistant foreground processes to be killed ([#18669](https://github.com/can1357/oh-my-pi/issues/18669)).
- An `edit` touching several files that anchors lines no read displayed now reveals those lines for every file in one rejection, so the identical resend applies instead of being rejected again for the next file ([#18742](https://github.com/can1357/oh-my-pi/pull/18742) by [@MaisonnatM](https://github.com/MaisonnatM))
- `omp auth-gateway stdio` now serves judge, image, speech, embedding, rerank and video models: `/v1/models` lists them, and `/v1/systemone` answers `typesafe/jev-*` or `@judge` instead of 404, or 422 from a chat model ([#18740](https://github.com/can1357/oh-my-pi/pull/18740) by [@andyhite](https://github.com/andyhite))
- `omp auth-gateway stdio` no longer cuts its last responses off at 128 KiB when its input ends before a slow reader has read them ([#18740](https://github.com/can1357/oh-my-pi/pull/18740) by [@andyhite](https://github.com/andyhite))
- `omp --session <id> --restore` restores that session, as `omp --restore --session <id>` does, instead of opening the session picker: a bare `--restore` keeps a session `--session` or `--resume` already named ([#18685](https://github.com/can1357/oh-my-pi/pull/18685) by [@AdamDureyAtWillship](https://github.com/AdamDureyAtWillship))
- The legacy Pi virtual module now builds in an npm install that keeps the bundled Pi packages nested: it is anchored to the installed package, so its imports resolve through that package's own dependency graph ([#15208](https://github.com/can1357/oh-my-pi/issues/15208), [#18733](https://github.com/can1357/oh-my-pi/pull/18733) by [@yuzu-octopus](https://github.com/yuzu-octopus))
- User-level agents, commands, and other `~/.omp/agent` config (including agents saved from the agents hub) now follow `PI_CODING_AGENT_DIR`, matching where `omp agents unpack` writes ([#18684](https://github.com/can1357/oh-my-pi/issues/18684))
- Fixed `grep` and `glob` treating a `;` list that starts with an internal URL and includes a local path, such as `artifact://1;notes.txt`, as one address; each listed target is now searched ([#18714](https://github.com/can1357/oh-my-pi/pull/18714) by [@eggpeat](https://github.com/eggpeat))
- Isolated tasks that edit a file whose name contains spaces now commit that file, including in a nested git repository, instead of leaving it unstaged or committing a different file that shares part of the name ([#18715](https://github.com/can1357/oh-my-pi/pull/18715) by [@eggpeat](https://github.com/eggpeat))
- A disposed or switched session now releases every persistent shell it owns, including the ones a surface keeps under a name of its own (`/loop` conditions), instead of holding one native shell per surface for the life of the process ([#18717](https://github.com/can1357/oh-my-pi/pull/18717) by [@eggpeat](https://github.com/eggpeat))

## [18.18.7] - 2026-11-10

### Added

- `/usage` and `omp usage` show LiteLLM key and user budgets for the built-in `litellm` provider and every models.yml provider with `discovery.type: litellm`, unless listed in `disabledProviders` ([#17873](https://github.com/can1357/oh-my-pi/pull/17873) by [@maykonmichel](https://github.com/maykonmichel))
- Extensions can ask the operator before an interactive quit, or cancel it, with `session_before_shutdown`; a further `/exit` or Ctrl+D skips the pending prompts and closes ([#18424](https://github.com/can1357/oh-my-pi/pull/18424) by [@aw1cks](https://github.com/aw1cks))

### Changed

- Saved-reset auto-redeem is set per window: `codexResets.autoRedeem5h`/`autoRedeemWeekly` and `claudeResets.autoRedeem5h`/`autoRedeemWeekly`/`autoRedeemFable` replace each provider's `autoRedeem`, whose value migrates into the 5h and weekly keys; a Claude Fable launch reset is governed by `autoRedeemFable` alone and spent only for a block that includes the Fable weekly cap, or before expiry when Fable usage is above zero ([#18661](https://github.com/can1357/oh-my-pi/pull/18661) by [@TheAifam5](https://github.com/TheAifam5))
- Sessions without a prompt UI (such as `omp -p`) no longer spend saved resets while auto-redeem is `unset`, even ones about to expire ([#18661](https://github.com/can1357/oh-my-pi/pull/18661))
- Google Antigravity is back in `/login` and `omp login`, marked "(at your own risk)": a new login first explains that Google may suspend accounts that sign in from third-party tools and continues only after you type `yes`; saved Antigravity logins work again ([#18499](https://github.com/can1357/oh-my-pi/issues/18499))
- On Windows, the bash tool's description tells the model it runs in an emulated bash environment, not cmd or PowerShell, so it writes bash instead of `dir`, `%VAR%` and other cmd syntax

### Fixed

- Extension prompts shown from `session_before_*` handlers no longer time out after 30 seconds while the operator is still answering ([#18424](https://github.com/can1357/oh-my-pi/pull/18424) by [@aw1cks](https://github.com/aw1cks))
- A second exit request now skips pending `worktree.onExit` prompts and keeps those worktrees instead of waiting for an answer ([#18424](https://github.com/can1357/oh-my-pi/pull/18424) by [@aw1cks](https://github.com/aw1cks))
- Advice that makes the agent keep working after it finished no longer comes back a second time, often as a blocker, while the agent is fixing it: advisor reviews of the earlier answer are cancelled and the advisor reviews the fix instead ([#18735](https://github.com/can1357/oh-my-pi/pull/18735) by [@H4vC](https://github.com/H4vC))
- On Windows, the bash tool's shell resolves MSYS drive paths (`/c/Users/...`, `/mnt/c/...`) everywhere, so running `/c/.../tool.exe`, `cd /c/...`, `[ -f /c/... ]` and `< /c/...` reach drive C: like they already did for `ls` and other built-in utilities
- On Windows, cmd-style command lines such as `dir | find /c /v ""`, `sort /r`, `timeout /t 5` and `whoami /all` in the bash tool run the Windows programs they were written for, instead of pi's GNU-style `find`/`sort`/`timeout`/`whoami` (which read `/c` as drive C: and could walk the whole drive)
- Changing or unsetting `PATH` in the bash tool's shell now forgets remembered command locations, as bash does, so a command no longer runs from a directory that has left `PATH`
- One slow or flooding collab guest no longer ends sharing for the room: the host drops that guest's backlog and asks it to rejoin, sessions larger than the send budget can be joined, and guest questions nobody received settle as unavailable ([#18629](https://github.com/can1357/oh-my-pi/pull/18629) by [@iliaal](https://github.com/iliaal))

## [18.18.6] - 2026-11-09

### Added

- In Tern, a turn's long-press menu on a phone can edit and resend a prompt, retry the turn, open the rewind page on it, or fork the session from it into a new session
- A rewind from the transcript says how many turns it dropped and offers Undo on its toast in Tern, which puts the turns and your draft back

### Changed

- Browser `role/` selectors in Chrome tabs now match the role and name Chrome's accessibility tree reports, so they reach open shadow roots and skip hidden elements; in Tern every name `observe()` reports selects its element again ([#18632](https://github.com/can1357/oh-my-pi/pull/18632) by [@will-bogusz](https://github.com/will-bogusz))

### Fixed

- A late usage-limit error from a previous provider no longer blocks or cools down the selected provider; when the old provider has spent its retry budget, a replay-safe turn still tries the selected model without the old quota delay ([#17098](https://github.com/can1357/oh-my-pi/issues/17098), [#17571](https://github.com/can1357/oh-my-pi/pull/17571) by [@Bensonluo](https://github.com/Bensonluo))
- Multi-question ask forms in Tern show Submit on the last question tab, not only on the Review tab
- MCP `headers` and stdio `env` values that use `!command` now run again on a 401/403 (the request is retried once), on `/mcp reconnect` and other reconnects, and on `/mcp reload`, so servers whose command mints short-lived tokens keep working past expiry instead of staying 401 until restart ([#18631](https://github.com/can1357/oh-my-pi/issues/18631))
- Pausing an unapproved plan no longer tells the agent that the draft was approved or to continue executing it, and pausing with `/plan` closes an open plan review so it can no longer save and execute the plan ([#18610](https://github.com/can1357/oh-my-pi/issues/18610)).
- Turning off `lsp.enabled` now also stops `write` and `edit` from starting language servers for diagnostics or formatting; previously only the `lsp` tool was disabled ([#18205](https://github.com/can1357/oh-my-pi/issues/18205), [#18490](https://github.com/can1357/oh-my-pi/pull/18490) by [@yuzu-octopus](https://github.com/yuzu-octopus))
- Fixed background tabs omp borrows (relay `app.target`, `app.cdp_url`) ignoring omp's clicks and keys or timing out on hover and drag; the page reads as visible while omp drives it and hidden again once released ([#17831](https://github.com/can1357/oh-my-pi/pull/17831) by [@will-bogusz](https://github.com/will-bogusz))
- Fixed the transcript jumping at the screen's top edge while scrolled back during a streamed reply, and the screen dropping two rows when a reply finished ([#12307](https://github.com/can1357/oh-my-pi/issues/12307), [#16117](https://github.com/can1357/oh-my-pi/pull/16117) by [@galtamam-cmyk](https://github.com/galtamam-cmyk))
- Focusing a subagent or returning to the main session no longer loses or freezes the next assistant reply when a fast tool turn finishes before the previous reply's links finish resolving, and messages and tool runs that arrive during the switch show exactly once, in order ([#18564](https://github.com/can1357/oh-my-pi/pull/18564) by [@eggpeat](https://github.com/eggpeat))
- `omp gc --strip` now keeps every response of the latest replay turn (including earlier tool-call steps joined by their tool results), reference-only images, and the transcript's file permissions ([#18636](https://github.com/can1357/oh-my-pi/pull/18636) by [@eggpeat](https://github.com/eggpeat))
- Session files whose entries were written without ids are re-indexed when loaded, and migrating old sessions no longer gives two entries the same id ([#18636](https://github.com/can1357/oh-my-pi/pull/18636) by [@eggpeat](https://github.com/eggpeat))
- `wait` and `write proc://<id>/kill` now say how a settled job's result reached the caller: delivered by the call itself (it finished while the call ran), handed over by this snapshot (it superseded the job's queued completion push, so no duplicate follows), or genuinely late — the last keeps its "not auto-delivered; recovered by this snapshot" warning and adds how long before the call it had finished ([#16052](https://github.com/can1357/oh-my-pi/issues/16052), [#18635](https://github.com/can1357/oh-my-pi/pull/18635) by [@yuzu-octopus](https://github.com/yuzu-octopus))
- Fixed `ask` notes added with `n` right after picking an answer landing on the previous question instead of the one shown; a Tern click then Note still notes the answer just clicked, and the Note button names it ([#18317](https://github.com/can1357/oh-my-pi/pull/18317) by [@DonMikone](https://github.com/DonMikone))

## [18.18.4] - 2026-11-09

### Added

- SDK: `PromptOptions.followUps` queues prompts to run after the prompt, in order; if the prompt never reaches the agent they come back with it in `DroppedPrompt.followUps`

### Changed

- The `task` tool no longer advertises a per-call `model` field unless `task.perCallModel` is `on` or the bundled seance is spawnable; a `model` sent anyway is still refused before dispatch ([#18554](https://github.com/can1357/oh-my-pi/pull/18554) by [@xiangnan0811](https://github.com/xiangnan0811))

### Fixed

- `/usage`, session statistics, and `omp stats` now include session title spend from both the default fork title and the tiny title model, and tiny-model titles count toward `--max-cost` ([#18177](https://github.com/can1357/oh-my-pi/issues/18177), [#18491](https://github.com/can1357/oh-my-pi/pull/18491) by [@yuzu-octopus](https://github.com/yuzu-octopus))
- Retries after `--model pi/<role>` (or `@<role>`, `<role>`) now walk that role's `retry.fallbackChains` entry instead of the `default` chain, including on `--continue` ([#18389](https://github.com/can1357/oh-my-pi/issues/18389), [#18534](https://github.com/can1357/oh-my-pi/pull/18534) by [@harshaygadekar](https://github.com/harshaygadekar))
- Fixed a `->` / `=>` list sent to an idle session running its second item before its first; if the first item can't start (Esc, a refused or failed setup), the whole list goes back to the editor ([#10802](https://github.com/can1357/oh-my-pi/issues/10802))
- Fixed auto-compaction repeating every turn when the system prompt and tool schemas alone exceed the compaction budget; it now warns once instead ([#18589](https://github.com/can1357/oh-my-pi/issues/18589)).
- Fixed a blank per-call `model` (`""` or whitespace) failing the gate for task calls, eval `agent()` and eval `workpool()` instead of using the agent's configured model ([#18576](https://github.com/can1357/oh-my-pi/pull/18576) by [@iwangjie](https://github.com/iwangjie))
- `task` tool calls with an empty model string or empty model array now use the agent's normal model routing ([#18554](https://github.com/can1357/oh-my-pi/pull/18554) by [@xiangnan0811](https://github.com/xiangnan0811))
- Fixed `todo append` without a phase failing instead of adding tasks to the active phase, the last phase, or a new `Tasks` phase ([#17265](https://github.com/can1357/oh-my-pi/issues/17265), [#18575](https://github.com/can1357/oh-my-pi/pull/18575) by [@taotao7](https://github.com/taotao7)).
- Learned-only memory guidance no longer tells the model to read a missing `memory_summary.md` ([#18523](https://github.com/can1357/oh-my-pi/pull/18523) by [@nick-maderight](https://github.com/nick-maderight)).
- A `wait` that times out now says how long it waited and how long a back-to-back wait allows, instead of returning a bare still-running snapshot that agents read as an empty result, and the back-to-back reminder tells agents not to start `sleep` jobs to wait longer ([#18612](https://github.com/can1357/oh-my-pi/pull/18612) by [@alphastorm](https://github.com/alphastorm)).
- `auth-gateway stdio` now follows a role's configured fallback chain even when `modelRoles` does not set the role (a chat role without its own chain inherits the `default` chain) ([#18509](https://github.com/can1357/oh-my-pi/pull/18509) by [@enieuwy](https://github.com/enieuwy))
- In the Pseudo shell visualization, a `;`-separated chain no longer draws its statement separators as rows of their own, so `echo a; echo b` reads as two statements ([#18258](https://github.com/can1357/oh-my-pi/issues/18258), [#18497](https://github.com/can1357/oh-my-pi/pull/18497) by [@yuzu-octopus](https://github.com/yuzu-octopus))
- Autoresearch `update_notes` with `append_idea` now creates an `## Ideas` section instead of inserting the bullet before the first heading when notes contain only a similarly named heading such as `## Ideas backlog` or `### Ideas` ([#18505](https://github.com/can1357/oh-my-pi/pull/18505) by [@eggpeat](https://github.com/eggpeat))
- Exclusive tools (`edit`, `write`, `eval`, …) called as Cursor MCP tools now keep their place in the tool batch, so a check sent right after an edit sees the new file and an edit no longer starts before an earlier read finishes ([#18502](https://github.com/can1357/oh-my-pi/pull/18502) by [@eggpeat](https://github.com/eggpeat))
- Quarantined Hindsight memories are now deleted once their 30-day review period ends even when no new memory is quarantined ([#18504](https://github.com/can1357/oh-my-pi/pull/18504) by [@eggpeat](https://github.com/eggpeat))
- The compaction display summary no longer requests reasoning, so thinking models return a summary instead of spending the 512-token cap on reasoning and returning nothing ([#18541](https://github.com/can1357/oh-my-pi/pull/18541) by [@phillipxkang](https://github.com/phillipxkang))
- Retries on the same model now stop after three consecutive generic aborts instead of spending the whole retry budget ([#18535](https://github.com/can1357/oh-my-pi/pull/18535) by [@nick-maderight](https://github.com/nick-maderight))
- `lsp.formatOnWrite` no longer re-indents 2/4-space files at 1 space per level when they contain JSDoc/block comments or one-off odd indents, and no longer converts tab-indented files that open with a JSDoc block to spaces ([#18544](https://github.com/can1357/oh-my-pi/issues/18544))
- Isolated task sandboxes now finish cleanup after a SIGHUP or other signal even when releasing them takes longer than the agent shutdown grace period ([#18519](https://github.com/can1357/oh-my-pi/issues/18519)).

## [18.18.3] - 2026-11-09

### Breaking Changes

- The `ask` tool takes one HTML form (`{ html }`) instead of `questions[]`: the model writes a `<form>` of radios, checkboxes, selects, text inputs and textareas with its recommendation preselected, and receives the submitted form data as JSON. `AskToolDetails` is now `{ answers: { name, question, answer }[]; timedOut? }`; `QuestionResult`, the "Other", "Chat about this", answer-note and answer-image paths of the tool are removed, and `/tree` re-answer reopens the original form (`NavigateTreeResult.reopenAsk` carries `html`).

### Added

- In Tern, right-clicking an `ask` answer offers Note, which annotates that answer without picking it ([#18551](https://github.com/can1357/oh-my-pi/pull/18551) by [@H4vC](https://github.com/H4vC))
- `task.eager` (`preferred`/`always`) now shapes only the main agent's system prompt; subagents fall back to their model's own delegation policy instead of being pushed to spawn further subagents
- `ask` forms can show pictures: `<img src>` from an http(s) URL, a `data:` URI or a local file (relative to the session's working directory), and inline `<svg>` diagrams, drawn in the terminal form and natively in Tern
- `ask` forms give every radio and checkbox group a free-text "Other" answer: its text is the radio's value or is appended to the checkbox group's array (field-by-field fallback, collab guests and ACP elicitation included)
- Extension UI gains optional `ui.formDialog(html, options)`, which renders an HTML `<form>` and resolves to `{ data, timedOut? }` (undefined when cancelled). The interactive TUI renders it as a form dialog, ACP clients with form elicitation get one elicitation with a property per field, and hosts without it (RPC) answer the `ask` tool field by field through `select`/`input`/`editor`.
- Eval cells can run shell commands with `sh`: `sh("git status")` in Python, `` await sh`ls ${dir}` `` or `await sh("make", { cwd })` in JavaScript. Commands run on the embedded bash engine to completion (never auto-backgrounded), return their output, and raise `ShellError` with the exit code on failure.
- `omp zsh` on Windows runs omp's builtin utilities (`ls`, `cat`, `head`, `jq`, …) for commands `PATH` does not have, unless a `command_not_found_handler` handles them ([#18532](https://github.com/can1357/oh-my-pi/pull/18532) by [@H4vC](https://github.com/H4vC)).

### Changed

- Clarified tool and internal-URL descriptions for `history://` concise transcripts, `proc://` job retention and parked-agent lookups, and `read` JSON query text output ([#18553](https://github.com/can1357/oh-my-pi/pull/18553) by [@xiangnan0811](https://github.com/xiangnan0811))
- Models without a delegation rule (Claude, Gemini, …) no longer get pushed to delegate: the "map unknown code via task" rule and the "Task + scout" nudges in search tool descriptions are replaced by a light suggestion to explore unfamiliar subsystems with a scout
- In Tern, clicking an `ask` answer and then Note now annotates the answer highlighted on the question shown instead of the one just clicked ([#18551](https://github.com/can1357/oh-my-pi/pull/18551) by [@H4vC](https://github.com/H4vC))

### Fixed

- Fixed `ask` notes added with `n` right after picking an answer landing on the previous question instead of the one shown; a Tern click then Note still notes the answer just clicked, and the Note button names it ([#18317](https://github.com/can1357/oh-my-pi/pull/18317) by [@DonMikone](https://github.com/DonMikone))
- Fixed `/export` failing on Windows when saving in the current directory, including relative paths such as `sub/../session.html`; the export message now shows the full path of the written file ([#18369](https://github.com/can1357/oh-my-pi/issues/18369), [#18525](https://github.com/can1357/oh-my-pi/pull/18525) by [@minhngoc25a](https://github.com/minhngoc25a)).
- Todo initialization now names empty phases `Tasks`, so subsequent updates can address them ([#18552](https://github.com/can1357/oh-my-pi/pull/18552) by [@xiangnan0811](https://github.com/xiangnan0811))
- `omp zsh` and the bash tool on Windows: background commands without job control ignore Ctrl-C (`INT`, and `QUIT` in zsh) as zsh and bash do, so the console's Ctrl-C leaves them running ([#18532](https://github.com/can1357/oh-my-pi/pull/18532) by [@H4vC](https://github.com/H4vC)).
- `omp zsh` finds the system zsh's function library (`compinit` loads) on Debian, Ubuntu and Arch, and on Windows from an MSYS2, Cygwin or Git for Windows zsh ([#18532](https://github.com/can1357/oh-my-pi/pull/18532) by [@H4vC](https://github.com/H4vC)).
- `omp zsh` on Windows: typed commands no longer end in `^M`, programs are found through `Path`, piped scripts run every line, `cd` takes `C:\…`/`C:/…`, `..` and `~` (keeping `$PWD` as `C:/…`), `>/dev/null` works, the prompt is `%` rather than root's `#`, `$OSTYPE` is `msys`, and no `USERNAME` warning is printed ([#18532](https://github.com/can1357/oh-my-pi/pull/18532) by [@H4vC](https://github.com/H4vC)).
- `omp zsh` on Windows edits lines with ZLE (history, Tab completion, key bindings, `$COLUMNS`); Ctrl-C abandons the line, runs an `INT` trap, or interrupts a `read` that then goes on, instead of ending the shell ([#18532](https://github.com/can1357/oh-my-pi/pull/18532) by [@H4vC](https://github.com/H4vC)).
- `omp zsh` on Windows: Ctrl-C interrupts the foreground program, `jobs`, `fg` and `bg` work (a job brought back with `fg` gets Ctrl-C too), and process substitution reaches Windows programs (`diff <(…) <(…)`, `prog >(…)`) ([#18532](https://github.com/can1357/oh-my-pi/pull/18532) by [@H4vC](https://github.com/H4vC)).
- On Windows, `/dev/null` works in the bash tool (`>/dev/null`, `cat /dev/null`, `[ -c /dev/null ]`) ([#18532](https://github.com/can1357/oh-my-pi/pull/18532) by [@H4vC](https://github.com/H4vC)).
- On Windows, `/dev/tty` opens the console in `omp zsh` and the bash tool (`prog >/dev/tty`), and an MSYS or Cygwin program killed by Ctrl-C reports status 130 instead of 512 ([#18532](https://github.com/can1357/oh-my-pi/pull/18532) by [@H4vC](https://github.com/H4vC)).
- `omp zsh` prints the `[n] pid` line for a background pipeline under job control, as it does for a single command ([#18532](https://github.com/can1357/oh-my-pi/pull/18532) by [@H4vC](https://github.com/H4vC)).
- `omp zsh` starts `compinit` many times faster: single array and association elements are assigned and read without copying the whole parameter, and `autoload -r` no longer re-reads the `.zwc` digests in `$fpath` for every function it resolves ([#18533](https://github.com/can1357/oh-my-pi/pull/18533) by [@H4vC](https://github.com/H4vC)).
- `omp zsh`'s `read -k` and `read -q` read a key from the terminal without waiting for Enter, as zsh does, instead of reading standard input ([#18533](https://github.com/can1357/oh-my-pi/pull/18533) by [@H4vC](https://github.com/H4vC)).
- `omp zsh` completion listings mark file types again (`dir/`, `exe*`), `print -c` lays words out in columns without a terminal, and `${x?msg}` ends a non-interactive shell with status 1 as zsh does ([#18533](https://github.com/can1357/oh-my-pi/pull/18533) by [@H4vC](https://github.com/H4vC)).
- `omp zsh` floats keep full precision in arithmetic (`s=$EPOCHREALTIME; print $(( EPOCHREALTIME - s ))` no longer drifts by up to a second) and still print in their `-F`/`-E` style ([#18533](https://github.com/can1357/oh-my-pi/pull/18533) by [@H4vC](https://github.com/H4vC)).
- `omp zsh`'s `typeset -U path` / `typeset -U fpath` (and `local -U path`) drop repeated entries as zsh does ([#18533](https://github.com/can1357/oh-my-pi/pull/18533) by [@H4vC](https://github.com/H4vC)).
- `omp zsh` and the bash tool: `$!` of a background pipeline is its last program's pid, as in bash and zsh, so `kill $!` signals that program; `omp zsh`'s `[n]` line for a background pipeline lists the pid of each of its processes, as zsh does ([#18547](https://github.com/can1357/oh-my-pi/pull/18547) by [@H4vC](https://github.com/H4vC)).
- `omp zsh` is faster: function calls, loops and arithmetic run 2–3× faster, `compinit` almost 4× faster, and building a large array or association one element at a time (`a+=(x)`, `h[k]=v`) or reading `$a[i]` from a large array no longer slows down with its size ([#18565](https://github.com/can1357/oh-my-pi/pull/18565) by [@H4vC](https://github.com/H4vC)).

## [18.18.2] - 2026-11-08

### Breaking Changes

- `logoutCredential()` now accepts an `AgentSession` instead of a model registry and session ID. Hosts must install a scoped-model refresher with `AgentSession.setScopedModelsRefresher()`; `InteractiveMode` and `InteractiveModeContext` no longer accept `refreshScopedModelsAfterLogin`.
- `SessionStorage.hasAssistantTurn()` is replaced by the optional `scanLines(path, visit)`, which session listings use to recover both a missed assistant record and a first prompt past the 4 KB head; custom storages that implemented `hasAssistantTurn()` must implement `scanLines()` instead.

### Added

- The shell's `ls` builtin supports macOS/BSD `-O`: a long listing gains the file-flags column (`hidden`, `compressed`, `uchg`, `restricted`, …) instead of rejecting the option, so `ls -lO` works and flags are visible again.
- The shell ships `sd` as a builtin, so `sd FIND REPLACE [FILES]…` find-and-replace (regex or `-F` literal, in place or `-p` preview) works without the binary installed.
- Added `omp gc --strip` (or `gc.strip`), which removes provider replay data (thinking signatures, encrypted reasoning, cached native responses, request controls) from sessions idle for `gc.stripAfterDays` (default 30, `--strip-after-days`), including subagent and archived transcripts; stripped sessions still resume on any model.

### Changed

- The `sloppy` edit tool (`*** Find`/`*** Replace`) now rejects only the operations that fail to match and applies the rest, including across files; the result lists each rejected operation against the file as written, and the call fails only when no file changes. Payloads that do not parse still apply nothing.
- A `bash` call that overlaps another one (parallel calls, or a call while one runs in the background) now runs in a copy of the session shell, so it sees the session's variables, functions, options, and working directory from before the other command; what it sets still does not persist.
- The `.`/`c` continue shortcut now interrupts a running turn and continues it, in the main session and in focused subagent views, instead of failing with "Agent is already processing" or doing nothing.
- Updated system prompts with the ⁂ section marker and improved task completion guidance, including proportional verification, efficient file reading, batching independent operations, and stopping after changes are verified.
- Added faster isolated-subagent startup for ovnfs-backed checkouts, while preserving the existing baseline behavior for repositories with nested repositories or submodules.
- Improved extension and plugin management: `/extensions` now lists and toggles extensions from configured extension packages and installed plugins, and marketplace sources resolve relative and bare-name paths consistently with Claude Code.
- Scoped model lists now refresh after logout, model-catalog refreshes, and RPC login or logout, so available models stay synchronized with authentication and provider changes.
- Added source actions to LSP `code_actions`, including actions such as Organize Imports, with application by title or index.
- Browser automation now supports downloads from relay tabs and broader `role/` selectors for implicit landmarks and structural roles.
- Improved skill and session workflows: skills created or installed during a session become immediately discoverable, and user-attributed custom messages that start a turn receive the appropriate prompt setup.
- Validated security findings now display validation status, timestamp, and summary information.
- Dual-mode language servers retain pushed diagnostics alongside pull diagnostics, preserving build and lint errors across edits.
- Improved session navigation and reliability when switches, forks, branches, context resets, or new sessions overlap; requests are processed in order without freezing or misrouting messages.
- Improved eval and interactive execution behavior, including preservation of JavaScript state and output across asynchronous failures, clearer startup and runtime errors, and better reporting when kernels or runtimes terminate.
- Parent-to-subagent messages now appear as IRC cards in live and Agent Hub transcripts.
- Paused agent turns can allow the machine to sleep at safe boundaries and restore sleep prevention when resumed.
- Improved JSON-mode shutdown handling so final tool events and buffered output are preserved.
- Improved task efficiency and responsiveness for isolated subagents, file search, browser guidance on Linux/X11, and long-running or cancellable operations.
- Updated the `tui.mouse` setting documentation to accurately describe wheel-scrolling behavior.
- `mnemopi.dbPath` values beginning with `~` now resolve relative to the home directory.
- Disabling the Codex provider now prevents its configuration from overriding omp settings, and providers can be disabled without applying their other settings.
- `omp gc` now shows a progress bar for each slow step (listing and scanning sessions, scanning transcripts for blob refs, archiving) on interactive terminals.
- `omp gc --strip` and `--compress` start work immediately instead of first reading every session's metadata, and `--strip` processes several sessions at once with a running tally of transcripts stripped.
- `omp gc` without `--apply` now says up front that it is a dry run.

### Fixed

- Fixed `omp --resume` showing `(no messages)` for sessions whose first prompt follows a large memory recall, image-only message, or `/skill:` reply ([#16495](https://github.com/can1357/oh-my-pi/issues/16495))
- In the shell visualization, a running command's inline script, heredoc, or `sh -c`/`ssh` script stays undimmed with the command instead of fading as inactive.
- The shell visualization highlights heredocs and inline scripts behind launchers (`uv run python -`, `timeout 60 python3 -c`, `env … bun -e`, `ssh host 'bash -s' <<EOF`, `ssh host <<EOF`, `docker run … bash -euc`), names a heredoc by its `#!` line or the file it writes (`cat > "$dir/lib.rs"`), and highlights Rust, Go, C-family and Swift heredocs.
- On Windows, commands run by the bash tool, including `nohup` background commands, get a console of their own, so programs that draw directly on the console (xperf and PowerShell progress bars, password prompts) no longer corrupt the TUI ([#18517](https://github.com/can1357/oh-my-pi/pull/18517) by [@H4vC](https://github.com/H4vC)).
- Reading Reddit URLs now works when Reddit blocks its API: posts, comment threads, subreddits, and user pages fall back to a Redlib mirror and then the Arctic Shift archive, and render full nested comment trees.
- Limited xAI `web_search` to two hosted-search turns per request to help prevent unexpected X search costs.
- Fixed extension event delivery so each extension receives events in emission order, even when another extension is slow to process an earlier event.
- `pi.sendUserMessage()` now rejects when a message is dropped before a turn begins, including the cost-cap reason when available.
- Prevented OpenTelemetry settings from omp-managed `.env` files from leaking into child processes or in-process extensions.
- Supervised-service waits now complete only after logs, metadata, and session-owner state have been published.
- Fixed Windows daemon metadata loss when another process temporarily reads `meta.json`.
- Improved image-generation errors to report why each model in a failed fallback chain was unsuccessful.
- Fixed model switching after remote compaction so the destination provider can recover the necessary conversation history instead of receiving only a placeholder summary.
- Remote MCP HTTP and SSE connections now honor `NODE_EXTRA_CA_CERTS` from the agent environment, including certificates loaded after startup.
- Preserved provider prompt-cache reuse across auto-learn captures, skill updates, and other session changes that do not require rebuilding the full system prompt.
- Closing `/btw` history during tool approval now correctly returns focus to the approval prompt.
- URL reads now handle bot-protection challenges more reliably, try alternate user agents, and report blocked or failed results instead of returning a protection page as content.
- Timed-out or cancelled JSON reads now stop their `jq` processing promptly.
- Fixed standalone binaries loading extensions that import top-level `@oh-my-pi/pi-utils` subpaths.
- HUD job status updates now continue to reflect elapsed time instead of freezing until matching output arrives.
- Generic remote compaction now supports `before_provider_request` payload hooks.
- Background completions no longer start hidden turns after an ACP prompt ends or incorrectly leave the session busy.
- Fixed shell behavior for exit status and `EXIT` traps in subshells to match Bash semantics.
- Preserved provider prompt-cache hits when resuming sessions after pruning, rewinding, branching, tree navigation, or other history changes.
- Cursor native edit operations now display accurate edit cards and diffs, including failed edits, instead of misleading separate read/write cards.
- `grep` and `glob` now respect timeout and cancellation when ovnfs status or daemon handshakes stall.
- Fixed `--mode json` shutdowns so tool completion events and the final JSON record are not lost or truncated.
- Commands beginning with `cd /` now execute from the filesystem root as intended.
- Edit auto-repair now accounts for retry costs and stops before exceeding the session cost cap.
- MCP prompt commands now correctly assign positional arguments that follow `key=value` arguments.
- `/shake thinking` now reports and preserves reasoning blocks that the provider continues to replay, avoiding inaccurate context-reduction claims.

## [18.18.1] - 2026-11-08

### Breaking Changes

- Rust SDK: `BashCommand` and `ReadyEvent` struct literals need `exclude_from_context: None` and `supports_bash_exclude_from_context: None` ([#18206](https://github.com/can1357/oh-my-pi/pull/18206) by [@andrebrait](https://github.com/andrebrait))

### Added

- RPC `bash` accepts `excludeFromContext: true` to keep a run out of model context like terminal `!!`; runtimes advertise support with `supportsBashExcludeFromContext` in the `ready` frame, and the Python SDK exposes that frame as `client.ready` ([#18206](https://github.com/can1357/oh-my-pi/pull/18206) by [@andrebrait](https://github.com/andrebrait))

### Changed

- Agent `bash` commands run with `LANG`/`LC_ALL=C.UTF-8` on every platform instead of the inherited locale, so sort order, number formats and tool messages no longer vary by machine; a locale in the command's `env` or `.envrc` still wins, and `!` commands keep yours
- omp's built-in shell (`omp bash`/`omp zsh` and the bash tool) parses scripts about a third faster, sources large function libraries about 20% faster, and re-runs a repeated `eval` or `source` without recompiling it.
- The `computer` tool's `el.perform()` takes any spelling of an action `ax()` lists (`perform("open")`), and `computer.backgroundFallback: refuse` refuses every spelling of a raise, open, context menu or popup press ([#15282](https://github.com/can1357/oh-my-pi/pull/15282) by [@will-bogusz](https://github.com/will-bogusz))
- The `computer` tool no longer takes over your screen for a macOS `win.drag` across the text of a native text view, such as a TextEdit document; it selects that text in the background and returns the selection ([#16223](https://github.com/can1357/oh-my-pi/pull/16223) by [@will-bogusz](https://github.com/will-bogusz))

### Fixed

- A browser relay tab stays usable after a password manager's inline autofill menu opens in it; the call that opened the menu still fails once (reinstall the extension with `omp browser-relay install` and reload it) ([#16908](https://github.com/can1357/oh-my-pi/pull/16908) by [@will-bogusz](https://github.com/will-bogusz))
- A `%%bash` cell in Python eval no longer prints its exit status (a stray `0`) after the command's output; a failing cell reports `%%bash: exit status N` on stderr instead.
- Reusing an already running `omp stats` dashboard now exits successfully without stopping the existing server ([#18443](https://github.com/can1357/oh-my-pi/issues/18443)).
- A function defined inside a command substitution in a here-document body (`cat <<E` / `$(f() { …; }; f)` / `E`) no longer crashes the built-in shell.
- A Cursor tool call sent in the same batch as a native StrReplace or Write no longer runs before the edit is written, so a check right after an edit sees the new file ([#18434](https://github.com/can1357/oh-my-pi/pull/18434) by [@KadirBerkpolat1](https://github.com/KadirBerkpolat1))
- Pinned sessions color their pin icon with the theme accent in the status line and the band composer's title instead of taking the title's color or dim style, matching the resume picker ([#18401](https://github.com/can1357/oh-my-pi/pull/18401) by [@SuperUserA](https://github.com/SuperUserA))
- An ovnfs checkout stays recoverable with `omp worktree clear` when removing it fails, or when creating it fails after the daemon may already have it, instead of being forgotten ([#18337](https://github.com/can1357/oh-my-pi/pull/18337) by [@eggpeat](https://github.com/eggpeat))
- A `retain` call that fails midway no longer delivers part of itself to the Hindsight server while telling the model nothing was queued ([#18440](https://github.com/can1357/oh-my-pi/pull/18440) by [@eggpeat](https://github.com/eggpeat))
- A `bash.patterns` `deny` rule now blocks a command anywhere in a `;`, `|`, `||` or `&&` line even when an earlier `prompt` rule matches another part of it, and project settings can no longer override the operator's `deny` or `prompt` patterns with `allow` ([#18349](https://github.com/can1357/oh-my-pi/pull/18349) by [@asuffield](https://github.com/asuffield))
- A subagent stopped by the session cost cap (`--max-cost` / `session.maxCost`) now reports the cap's refusal instead of "Subagent ended without a final message" ([#18362](https://github.com/can1357/oh-my-pi/issues/18362))
- ERB templates open in ruby-lsp as `erb`, so valid templates no longer report dozens of bogus Ruby errors, and a diagnostics pull ruby-lsp answers with `null` no longer holds the call for its whole timeout ([#18372](https://github.com/can1357/oh-my-pi/pull/18372) by [@alphastorm](https://github.com/alphastorm))
- Mistral Vibe browser sign-in shows subscription billing in the status line and advisor spend instead of pay-as-you-go pricing ([#18374](https://github.com/can1357/oh-my-pi/issues/18374))
- Native OpenAI compaction no longer waits for a Hindsight memory recall it cannot use; fallback summaries still recall memory ([#18327](https://github.com/can1357/oh-my-pi/issues/18327))
- An eval `wait()` on jobs owned by a worker returns finished jobs and consumes their results instead of reporting them as running or delivering them again ([#18363](https://github.com/can1357/oh-my-pi/issues/18363))
- `/restart` no longer drops running subagents: they go on with their interrupted turns in the relaunched process and deliver their results to the agent that spawned them, as `omp --restore` now also does after a normal quit
- A shell command nested hundreds of levels deep (subshells, groups, command substitutions) is now a syntax error in the built-in shell instead of crashing omp with a stack overflow.
- Eval `wait()` progress rows for agents spawned by one `task` call show each agent's own tool count, context, cost and activity instead of the first agent's ([#18393](https://github.com/can1357/oh-my-pi/issues/18393))
- In the Pseudo shell visualization, an `&&` chain keeps its `and` rows while it runs and after it finishes, instead of switching to literal `&&` rows and a raw-bash tail when the output minimizer runs it one command at a time ([#18408](https://github.com/can1357/oh-my-pi/issues/18408))
- Autoresearch `update_notes` calls can now append an idea with only `append_idea`, without passing a replacement `body` ([#18439](https://github.com/can1357/oh-my-pi/pull/18439) by [@eggpeat](https://github.com/eggpeat))

## [18.18.0] - 2026-11-07

### Fixed

- Fixed transcript output freezing after provider restarts or switching sessions mid-stream ([#18358](https://github.com/can1357/oh-my-pi/pull/18358) by [@JustasMasiulis](https://github.com/JustasMasiulis))
- Bash tool cards for a command whose leading `cd <dir> &&` / `cd <dir>;` was hoisted into the working directory show that `cd` again above the visualized command, with the separator the model wrote, instead of dropping where it ran
- Bash commands starting with `cd <dir>; ...` now run in `<dir>` as their working directory when it exists, so its direnv environment loads and the directory shows on the tool card ([#18329](https://github.com/can1357/oh-my-pi/pull/18329) by [@harshaygadekar](https://github.com/harshaygadekar))
- Task-file approvals show and keep the checked file target through dispatch, so retargeted symlinks cannot silently substitute another assignment; replaced files require a retry ([#18314](https://github.com/can1357/oh-my-pi/pull/18314) by [@iliaal](https://github.com/iliaal)).
- Subagents receive task instructions with their blank lines, Markdown hard breaks, and table spacing intact, whether given inline or via `taskFile`.
- Hindsight `retain` and `learn` memories are no longer lost when delivery fails or omp exits: they are kept on disk, retried, and delivered by the next session without duplicates ([#18176](https://github.com/can1357/oh-my-pi/pull/18176) by [@alphastorm](https://github.com/alphastorm))
- Fixed the session crashing with `Native shell returned an invalid execution trace` when a bash command assigned a long value containing multi-byte characters such as Chinese text ([#18259](https://github.com/can1357/oh-my-pi/issues/18259))
- `grep -e` and `rg -e` in the bash tool accept patterns that start with `-` (e.g. `grep -e "--canary"`) instead of failing with an unknown-option error.
- The bash execution visualization keeps updating, and saved traces still restore, after a command handles bytes that aren't valid UTF-8 (e.g. `v=$(printf '\377')`)
- On Windows, `grep`, `glob` and isolated subagents no longer flash a console window when they query or start the ovnfs daemon.
- A bash command containing a bare `[` (e.g. `a && [` while still streaming) no longer crashes omp in the Pseudo shell visualization ([#18320](https://github.com/can1357/oh-my-pi/issues/18320))
- Fixed a prompt that mentions an internal-scheme URL with `@` (e.g. `@local://x`, `@vault://x`) aborting the run with "uses internal scheme ... not as a filesystem path"; such a mention is now left as plain text ([#16071](https://github.com/can1357/oh-my-pi/issues/16071))
- Fixed MCP OAuth login and token refresh failing with `JSON Parse error: Unexpected identifier "access_token"` against GitHub's token endpoint ([#18292](https://github.com/can1357/oh-my-pi/issues/18292))
- MCP OAuth requests tokens for the MCP server's own resource (from its protected-resource metadata) instead of a different `resource` advertised by the authorization server, fixing `401 invalid_token` after `/mcp reauth` on servers such as Firecrawl's hosted MCP ([#18315](https://github.com/can1357/oh-my-pi/issues/18315))
- Concurrent subagent MCP calls now grant newly loaded tools to the session that made each call, even when providers reuse call IDs. ([#18324](https://github.com/can1357/oh-my-pi/pull/18324) by [@eggpeat](https://github.com/eggpeat))
- LSP document symbols now show identifier lines, so those lines work with references, definition, and rename ([#18257](https://github.com/can1357/oh-my-pi/issues/18257)).
- Subagents on worker threads no longer fail with `Cannot send … instance across threads` when their model comes from an extension-registered provider with its own `streamSimple` ([#18310](https://github.com/can1357/oh-my-pi/pull/18310) by [@Dangerboi](https://github.com/Dangerboi))
- ⌘V in terminals with kitty enhanced paste (OSC 5522, e.g. Ghostty 1.4) now attaches macOS TIFF screenshots instead of reporting "Clipboard paste has no supported text or image data" ([#17696](https://github.com/can1357/oh-my-pi/issues/17696), [#18203](https://github.com/can1357/oh-my-pi/pull/18203) by [@roboomp](https://github.com/roboomp))
- Disabling `display.shellVisualization` now omits bash execution traces from tool updates and saved sessions, including in ACP ([#18267](https://github.com/can1357/oh-my-pi/issues/18267)).
- `/quit` and `/exit` no longer wait several seconds for an unresponsive OTLP telemetry collector ([#18255](https://github.com/can1357/oh-my-pi/issues/18255)).
- Cancelling a Python eval cell right as it starts now stops the cell cleanly instead of letting it run and killing the kernel ([#18242](https://github.com/can1357/oh-my-pi/pull/18242) by [@eggpeat](https://github.com/eggpeat))
- Browser `open` now returns the same tab with a recovery notice when Chrome detaches the relay during navigation and omp successfully reattaches, instead of failing the open and closing newly opened tabs ([#18252](https://github.com/can1357/oh-my-pi/pull/18252) by [@will-bogusz](https://github.com/will-bogusz))
- `tab.errors()` keeps the fields of plain-object and other non-Error rejections, bounded like console arguments, instead of reporting only `Object` ([#16959](https://github.com/can1357/oh-my-pi/issues/16959)) ([#18251](https://github.com/can1357/oh-my-pi/pull/18251) by [@Alex-Wengg](https://github.com/Alex-Wengg))
- An extension provider with `authHeader: true` keeps its cached `fetchDynamicModels` catalog when `omp models refresh` fails, instead of showing 0 models until the next successful forced refresh ([#18227](https://github.com/can1357/oh-my-pi/issues/18227))
- A session whose request carries no titleable text of its own — an attached `@brief.md`, a greeting, a bare number — is now named once from the assistant's reading of it, instead of staying untitled until the next message that happens to be titleable (which, for an agent launched from one brief and left to run, never came) ([#18238](https://github.com/can1357/oh-my-pi/pull/18238) by [@sjawhar](https://github.com/sjawhar))
- Prewalk no longer hands a subagent to its cheap model when the subagent messages its parent or another agent (`write agent://…`) before its first file edit ([#18322](https://github.com/can1357/oh-my-pi/pull/18322) by [@1vivy](https://github.com/1vivy))

## [18.17.0] - 2026-11-06

### Added

- Bash commands, foreground and background, now show a live execution visualization in Raw or Python-like Pseudo view, with variable values and replay history; disable with `display.shellVisualization` (default on).
- `grep` and `glob` inside an ovnfs checkout ask the ovnfs daemon to search the checkout in-process, avoiding per-file mount round trips; the daemon and its mount come from `ovnfs --json status` when the ovnfs binary is found. They fall back to the native search when the daemon is unavailable or rejects the request, and cancelling the tool cancels the daemon's search. ovnfs with admin protocol 5 is required.
- Added `skills.manualSkills` glob patterns to hide skills from the model catalog while keeping them manually invocable ([#18114](https://github.com/can1357/oh-my-pi/pull/18114) by [@Shadorain](https://github.com/Shadorain))
- Added Keenable web search (`web/keenable`), using `KEENABLE_API_KEY` or a stored `keenable` credential, or a keyless public endpoint when explicitly selected ([#17953](https://github.com/can1357/oh-my-pi/pull/17953) by [@KGKallasmaa](https://github.com/KGKallasmaa))
- `web_search` results list failed providers with reason and status code in `details.failures` ([#18124](https://github.com/can1357/oh-my-pi/pull/18124) by [@will-bogusz](https://github.com/will-bogusz))
- Added opt-in background auto-update (`update.auto`, offered in setup) that installs new releases via your install method and runs them next launch; skipped on Nix, source checkouts, and Tern.
- `omp update` refuses to run while another update (including auto-update) is installing.
- Added `none` to `edit.mode` (and `PI_EDIT_VARIANT`) to remove the `edit` tool; `bash` stays available even if `bash.enabled` is off.
- Added default-off `providers.openaiResponsesWebsockets` to use WebSockets for supported standard Responses models ([#17354](https://github.com/can1357/oh-my-pi/pull/17354) by [@TatsukiMeng](https://github.com/TatsukiMeng))
- Pinned sessions show a pin beside their title; `/unpin [session id]` unpins a session ([#17848](https://github.com/can1357/oh-my-pi/pull/17848) by [@SuperUserA](https://github.com/SuperUserA))
- Extensions can draw tool calls and `message`/`event` blocks full, compact, or hidden via `pi.registerTranscriptPresenter()`, and redraw with `ctx.ui.refreshTranscript(ids)`; enable with `extensionRenderers.transcriptPresenters` (default off) ([#17960](https://github.com/can1357/oh-my-pi/pull/17960) by [@materemias](https://github.com/materemias)) ([#17997](https://github.com/can1357/oh-my-pi/pull/17997) by [@materemias](https://github.com/materemias))
- Consecutive compact transcript blocks render as tight rows without blank gaps; extension renderers opt in via `isTranscriptBlockCompact()` ([#17997](https://github.com/can1357/oh-my-pi/pull/17997) by [@materemias](https://github.com/materemias))
- Added a fullscreen link browser for links in scrollback: press Alt+O again (or Page Up) while link tags are shown ([#16476](https://github.com/can1357/oh-my-pi/pull/16476) by [@materemias](https://github.com/materemias))
- Added a `cache` status-line segment (`full`/`nerd` presets) showing whether the next message hits the prompt cache; Tern and `/session` show why not and how much is resent ([#12677](https://github.com/can1357/oh-my-pi/issues/12677)) ([#17496](https://github.com/can1357/oh-my-pi/pull/17496) by [@will-bogusz](https://github.com/will-bogusz))
- `^` model tags accept a `:level` suffix (e.g. `^openai-codex/gpt-6-astra:high`) to set the subagent's effort (overriding `task.maxEffort`), with completion of each model's supported levels ([#17574](https://github.com/can1357/oh-my-pi/pull/17574) by [@a-glapinski](https://github.com/a-glapinski))
- Added the `chillax` magic keyword for brief, lowest-effort thinking on supported models; configure via `magicKeywords.chillax`
- Added `tui.colorfulMarkdown` (on by default): replies color headings by level, bold and italic text, inline code and table headers from the theme's palette; turn it off for the previous single heading color and plain bold/italic
- Added `tui.motion` (`full`/`reduced`/`none`), `tui.spinnerInterval` (`0` = static) and `tui.maxFps` to control animation and repaint rate, also via `--motion`/`--spinner-interval`/`--max-fps` and `PI_MOTION`/`PI_SPINNER_INTERVAL`/`PI_MAX_FPS`; an explicit `tui.spinnerInterval` beats `tui.motion`, and keystroke echo keeps 30 fps ([#14240](https://github.com/can1357/oh-my-pi/pull/14240) by [@mccraigmccraig](https://github.com/mccraigmccraig))
- Added `omp zsh`, `omp bash` and `omp sh` to run omp's built-in shell engine directly, passing all arguments through and exiting with the shell's status.
- `omp zsh`/`omp bash` keep shell history in your `$HISTFILE`, compatible with real zsh, including `!` expansion, `fc` and `history`.
- `omp zsh` runs interactively like zsh (line editor, `bindkey`, completion, job control, prompt hooks, common modules), so oh-my-zsh and powerlevel10k configs start.
- RPC `bash` results report truncated output via `elidedBytes`/`elidedLines` and `columnTruncated*`/`columnMax` fields, decoded by the Go, Python and Rust SDKs ([#17957](https://github.com/can1357/oh-my-pi/pull/17957) by [@H4vC](https://github.com/H4vC))
- Added `pi.getShortcutConflict(chord)` so extensions can check whether a key chord is free or who holds it ([#17961](https://github.com/can1357/oh-my-pi/pull/17961) by [@materemias](https://github.com/materemias))
- Exported `unwrapHashlineHeaderPath` from `@oh-my-pi/pi-coding-agent` to turn a `[path#TAG]` target into its plain path ([#17961](https://github.com/can1357/oh-my-pi/pull/17961) by [@materemias](https://github.com/materemias))
- `devin-cli` login imports Devin CLI credentials, so the `devin` provider no longer requires `DEVIN_API_KEY` ([#13637](https://github.com/can1357/oh-my-pi/pull/13637) by [@pavel-kalmykov](https://github.com/pavel-kalmykov))
- `devin-windsurf` login authenticates the `devin` provider with an existing Windsurf Enterprise account ([#13288](https://github.com/can1357/oh-my-pi/pull/13288) by [@pavel-kalmykov](https://github.com/pavel-kalmykov))

### Changed

- ovnfs turns on by itself when its binary is found (`ovnfs.path`, else `ovnfs` on PATH): agents get the separate-checkout guidance, and isolated subagents use ovnfs checkouts when `isolation.backend` is `auto`
- Text Verbosity now defaults to low and applies to Codex too, matching the official Codex client: shorter answers that finish sooner; set `textVerbosity` to `medium` for the old length
- A cost cap set on the main thread now applies to running subagents immediately
- RPC wire protocol and task streaming have lower serialization overhead
- Local Whisper speech-to-text, Parakeet/Nemotron speech, and the local tiny model install their runtimes on first use, shrinking installs; first use needs network access
- `wait` with nothing new returns after 5s (backing off to 5m over repeated idle waits) instead of blocking up to 30 minutes, and nudges the agent toward other work
- `wait` returns jobs finishing within 1.5s of each other in one result
- Broadcasts and progress notes no longer cut short `wait` or interrupt bash/eval; a direct message still ends a wait and delivers every queued message
- `wait` for a reply gives up after 5 minutes (was 30) and returns at once if the other agent is waiting on the user
- In Tern, streamed assistant text and thinking are sent unpaced, cutting omp's CPU use; other terminals keep the smooth reveal
- Source-checkout sessions start faster; existing build stamps remain readable
- The agent's `bash` tool never touches your shell history or completion, and its `zsh -i`/`bash -i` skip `.zshrc`/`.bashrc`
- Embedded Bash follows Bash 5.3 semantics and preserves supported aliases
- CLI flags, session-only settings writes, and SDK overrides now outrank a setting's env var (`PI_MOTION=none omp --motion full` uses full motion); env vars still outrank settings files
- JS and Python tool aborts now report the original abort reason
- Many concurrent subagents now run in worker threads so they don't slow the TUI; new `task.workerThreads` caps workers (default 4; `0` keeps all on the main thread)
- Interactive startup reaches the first frame ~75ms sooner when skills are listed in the system prompt
- "What's New" release notes now appear just after the first frame; quitting before it keeps them for the next start
- Subagents can no longer broadcast (`write agent://all` fails, pointing to a direct `agent://<id>` message) and are no longer told to announce shared-file edits; the main agent can still broadcast
- Factory Droid Gemini 4 Argon sessions keep earlier turns intact across save and reload, with correct image clamping ([#17861](https://github.com/can1357/oh-my-pi/pull/17861) by [@will-bogusz](https://github.com/will-bogusz))

### Fixed

- On macOS, the browser tool's headless Chromium keeps background tabs at normal CPU priority, so on a busy machine `tab.traceStart()`, opening a second tab, and other calls into background tabs no longer stall or time out
- Subagents loading MCP tools (such as Kata's `load_*`) no longer change the main session's tools or system prompt
- Mounting an MCP tool mid-session on prefix-bound models no longer changes the eval tool description, and the mount notice now reaches the model
- Worker-thread subagents are faster: switching views on long transcripts no longer lags, `wait` no longer streams full transcripts, and they stall less on a busy main thread
- Streaming a large batch `task` call no longer slows quadratically (about 80 ms → 2 ms for a 200 KB call)
- `computer` from Eval now uses `zoom` for legible close-ups instead of cropping the downscaled screenshot ([#18158](https://github.com/can1357/oh-my-pi/pull/18158) by [@will-bogusz](https://github.com/will-bogusz))
- Python eval `@tool` definitions with type annotations now register on Python 3.9 ([#18143](https://github.com/can1357/oh-my-pi/pull/18143) by [@Winston-Hsiao](https://github.com/Winston-Hsiao))
- `read` of an SEC EDGAR filing document or folder returns that document, not the company profile ([#18150](https://github.com/can1357/oh-my-pi/pull/18150) by [@will-bogusz](https://github.com/will-bogusz))
- `read` of a Read the Docs page no longer returns another repository's linked file ([#18162](https://github.com/can1357/oh-my-pi/pull/18162) by [@will-bogusz](https://github.com/will-bogusz))
- A browser click beside a direct `tab.waitForDownload()` now errors with a `tab.run` suggestion that actually catches the download ([#17615](https://github.com/can1357/oh-my-pi/issues/17615)) ([#18155](https://github.com/can1357/oh-my-pi/pull/18155) by [@will-bogusz](https://github.com/will-bogusz))
- Browser `open({ viewport })` now sizes relay tabs, `app.cdp_url`/`app.path` browsers, and headed Chromium on first open ([#18160](https://github.com/can1357/oh-my-pi/pull/18160) by [@will-bogusz](https://github.com/will-bogusz))
- Discarded empty, reasoning-only, or length-stop turns still count billed usage in session totals and `omp stats` ([#18178](https://github.com/can1357/oh-my-pi/issues/18178))
- `/extensions` shows the active `~/.agents` skill when a higher-priority `~/.claude` copy is not opted in ([#18190](https://github.com/can1357/oh-my-pi/issues/18190))
- Tool results whose `details` contain a throwing getter no longer silently stop all later session saves ([#18134](https://github.com/can1357/oh-my-pi/pull/18134) by [@MonsieurBarti](https://github.com/MonsieurBarti))
- `write` to a new `ssh://` file no longer fails when the content ends with a `read` truncation notice ([#18154](https://github.com/can1357/oh-my-pi/pull/18154) by [@will-bogusz](https://github.com/will-bogusz))
- `find` returns verified hits as partial results when its 20 s budget runs out instead of failing ([#14809](https://github.com/can1357/oh-my-pi/issues/14809)) ([#18161](https://github.com/can1357/oh-my-pi/pull/18161) by [@will-bogusz](https://github.com/will-bogusz))
- Background bash completion notices name the command, so parallel jobs are distinguishable ([#12607](https://github.com/can1357/oh-my-pi/issues/12607)) ([#18166](https://github.com/can1357/oh-my-pi/pull/18166) by [@will-bogusz](https://github.com/will-bogusz))
- LSP results stay current for open files edited outside OMP, and files unused for 5 minutes are closed in the language server ([#18153](https://github.com/can1357/oh-my-pi/pull/18153) by [@will-bogusz](https://github.com/will-bogusz))
- Markdown edits no longer falsely warn that valid text (e.g. `| a |||`) fails to parse ([#18151](https://github.com/can1357/oh-my-pi/pull/18151) by [@will-bogusz](https://github.com/will-bogusz))
- Bash arguments like `"skill:// external command"` reach external commands as written instead of failing with exit 126 ([#18163](https://github.com/can1357/oh-my-pi/pull/18163) by [@will-bogusz](https://github.com/will-bogusz))
- Thin tool images are padded to the vision model's minimum size instead of causing a 400 ([#18081](https://github.com/can1357/oh-my-pi/issues/18081))
- JSON query truncation notices report the 50KB read budget instead of the bytes shown ([#18022](https://github.com/can1357/oh-my-pi/pull/18022) by [@eggpeat](https://github.com/eggpeat))
- Extension links, renderers, and `ctx.ui.getLinkClicksAvailable()` now work on every launch, not only the first after an edit ([#18116](https://github.com/can1357/oh-my-pi/pull/18116) by [@materemias](https://github.com/materemias))
- Multi-line AST Grep captures show on one `meta:` row instead of splitting across rows ([#18105](https://github.com/can1357/oh-my-pi/pull/18105) by [@JustasMasiulis](https://github.com/JustasMasiulis))
- Extension shortcuts now match regardless of modifier order or spelling: reserved chords stay ignored and the last-loaded duplicate wins ([#17961](https://github.com/can1357/oh-my-pi/pull/17961) by [@materemias](https://github.com/materemias))
- Building from source works again ([#18074](https://github.com/can1357/oh-my-pi/pull/18074) by [@Maziar123](https://github.com/Maziar123))
- `.`/`c` continue no longer reports "Nothing to resume" after `/handoff`, compaction, or a `/skill:`-started session
- `omp bash` and `omp sh` show a prompt when `PS1` is unset
- `display.cacheMissMarker` now flags turns that re-send most of the conversation (e.g. after an idle gap), even when the system prompt block was cached
- A running session keeps its setting values when `config.yml` gains a value its omp version doesn't know, preserving tools and prompt cache
- Forcing a queued message with Enter now reliably resumes the agent
- Interrupting a Python eval cell blocked on top-level `await` cancels the cell and keeps the kernel and variables ([#18115](https://github.com/can1357/oh-my-pi/pull/18115) by [@Winston-Hsiao](https://github.com/Winston-Hsiao))
- Apostrophes in slash-command and prompt-template arguments (e.g. `/fix the user's login bug`) now reach `$ARGUMENTS` and `$1`, `$2`, … intact ([#18008](https://github.com/can1357/oh-my-pi/issues/18008))
- Bash output: middle truncation no longer splits lines and reports accurate line ranges; silent success returns `(no output, exit code 0)` ([#17957](https://github.com/can1357/oh-my-pi/pull/17957) by [@H4vC](https://github.com/H4vC))
- A new session's first frame always shows your configured default model and thinking level, not one from another session or folder
- System-prompt skill listings show the compressed routing hint instead of a truncated description when it fits 160 characters; previously skipped skills are recompressed
- Skill descriptions stop triggering background model requests once the session-tree cost cap is reached, and their spend counts toward the cap ([#18016](https://github.com/can1357/oh-my-pi/issues/18016))
- The idle recap survives resume, restart, and transcript rebuilds, staying at the end until the conversation moves on ([#18113](https://github.com/can1357/oh-my-pi/pull/18113) by [@materemias](https://github.com/materemias))
- Chat sessions on a `web` (or other model-kind) role model no longer fall back to `web/*` search providers and fail with `Unhandled API in mapOptionsForApi: web-search` ([#18056](https://github.com/can1357/oh-my-pi/pull/18056) by [@haesol-shin](https://github.com/haesol-shin))
- Grouped `read` rows naming a URL link the whole URL, not just its last path segment ([#18071](https://github.com/can1357/oh-my-pi/pull/18071) by [@iacore](https://github.com/iacore))
- A second `ask` note on a later single-select question no longer replaces the previous question's note ([#17979](https://github.com/can1357/oh-my-pi/issues/17979))
- The first run of a compiled binary after install or upgrade no longer fails `omp --smoke-test` with `SubagentCodeChangedError` or keeps subagents on the main thread ([#18060](https://github.com/can1357/oh-my-pi/issues/18060))
- Retrying an aborted turn keeps the unsent composer draft ([#17977](https://github.com/can1357/oh-my-pi/pull/17977) by [@Shadorain](https://github.com/Shadorain))
- The `tts` tool uses Grok Voice again instead of silently falling back to Kokoro, and sends `language` to xAI (auto-detected if omitted) ([#17992](https://github.com/can1357/oh-my-pi/pull/17992) by [@Mirceone](https://github.com/Mirceone))
- Windows bash output on non-UTF-8 code pages (CJK) no longer turns into mojibake after one invalid byte; the byte shows as `�` ([#17947](https://github.com/can1357/oh-my-pi/pull/17947) by [@H4vC](https://github.com/H4vC))
- Hindsight no longer silently drops the last mental model (often `User Preferences`) from the prompt when over the render budget ([#17548](https://github.com/can1357/oh-my-pi/issues/17548), [#17955](https://github.com/can1357/oh-my-pi/pull/17955) by [@harshaygadekar](https://github.com/harshaygadekar))
- Subagents woken by IRC, restored, revived, or rerun by a workpool keep their `task.softRequestBudget` guard; it and `task.agentSoftRequestBudget` resolve by agent name (e.g. `scout`), not task ID ([#17988](https://github.com/can1357/oh-my-pi/pull/17988) by [@sinhduc01](https://github.com/sinhduc01), [#18121](https://github.com/can1357/oh-my-pi/pull/18121) by [@eggpeat](https://github.com/eggpeat))
- A focused subagent's `blocked` indicator follows its own approval mode, tool policies, and grants instead of the main session's
- Bash tool: `exec >file`, `exec 2>/dev/null`, or `exec <file` no longer redirects later commands in the session
- Bash tool: an `EXIT` trap fires once at the end of its command, not after every later command
- Bash tool: late output from a background job (`(sleep 1; echo late) &`) no longer appears in a later command's output
- Bash tool: `env -i` no longer passes non-shell-name variables (`A-B=1`), and `X=v env -i`/`X=v env -u X` no longer pass an exported outer `X`
- Bash tool: `xargs` reports a signal-killed command like GNU xargs: `xargs: CMD: terminated by signal N`, stopping with status 125
- macOS: starting a bash tool session no longer briefly sets umask to 022, which could give new files wrong permissions
- Bash tool: a shebang-less executable script run in the background from a FIFO (`./script < fifo &`) runs as bash instead of failing with `Exec format error`
- Subagents no longer hang in an async Python `@tool` call waiting on an `asyncio.Lock` held by another subagent's call
- Cancelling a subagent mid-call cancels its async Python `@tool` coroutine, releasing locks, and reports `Python tool request was cancelled`
- Agent Hub no longer shows a previous session's subagents after creating or switching sessions
- `ast_grep` and `ast_edit` detect languages for uppercase file extensions
- snapcompact no longer treats incompatible older archives as reductions
- `computer` window lookup and app opening work for app IDs, paths, and `~` paths, and survive Wayland permission timeouts
- Embedded headless Chrome no longer outlives its host process, and `computer`/browser lifecycle works in SDK embeddings and local test runs
- Out-of-credit provider errors now fail immediately instead of retrying for long periods; Retry works promptly once the account is funded.
- DeepSeek-style `*** End` and `*** End Patch` markers are no longer written into files or truncate later edits
- Composer prediction ghost text no longer vanishes when advisor messages arrive

## [18.16.0] - 2026-11-02

### Added

- With the Hindsight memory backend, `retain` and `learn` can now store a memory with `scope: "global"` so every project recalls it. It is opt-in through the new `hindsight.globalScope` setting (off by default) and needs `global` or `per-project-tagged` scoping ([#17706](https://github.com/can1357/oh-my-pi/pull/17706) by [@alphastorm](https://github.com/alphastorm), from [#15030](https://github.com/can1357/oh-my-pi/pull/15030) by [@kithawk](https://github.com/kithawk)).
- Added `btw.inject` (off by default; `/settings` → Interaction → "/btw Steering Inject"): when you ask `/btw` for a steering prompt, it drafts one in an `<inject>` block shown behind a pink rail, and `Alt+I` (`app.btw.inject`) sends it to the main session (as a steer while the agent runs, else as a new turn) from the inline answer or the BTW history sheet, once per answer from the current run. Once sent, the block turns green with `➤` on each line and "Injected into main session" below it; if the main session drops or refuses the send, the block turns back to pending and the same key retries ([#17618](https://github.com/can1357/oh-my-pi/pull/17618) by [@apullin](https://github.com/apullin))
- With OTLP metrics export configured (`OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`), composer predictions export content-free `omp.composer.prediction.*` metrics by serving model: requests by outcome (offered, skipped, stale, cancelled, timeout, error) with their duration, predictions shown (counted on the first frame that paints them), shown predictions by whether they were accepted with Tab or Right, and the time from first display to acceptance ([#17739](https://github.com/can1357/oh-my-pi/pull/17739) by [@wolfiesch](https://github.com/wolfiesch))
- Bash results the output minimizer rewrote now keep which filter ran and the bytes before and after in the session, and the bash card shows them (`Minimized: git 120.4KB → 3.2KB`) ([#16586](https://github.com/can1357/oh-my-pi/pull/16586) by [@will-bogusz](https://github.com/will-bogusz))
- Eval completion handles expose `attempts` (JS `await handle.attempts()`, Python `handle.attempts`): each fallback candidate tried, in order, with the model, the reasoning effort sent, its outcome, and the error when it failed ([#17782](https://github.com/can1357/oh-my-pi/pull/17782) by [@xiangnan0811](https://github.com/xiangnan0811))
- Added `composer.predictionAlternatives` (off by default; `/settings` → Interaction → "Prediction Alternatives", listed while Composer Predictions is on): the same single prediction request returns up to four different next messages, most likely first. Type a few letters to get ghost text for the first one that matches; after inserting one, press Tab again to pick another from a list. Prediction metrics carry how many alternatives were offered (`omp.composer.prediction.choices`), and an accepted prediction now resolves when it retires, with the rank of the alternative inserted last (`omp.composer.prediction.rank`) ([#17796](https://github.com/can1357/oh-my-pi/pull/17796) by [@wolfiesch](https://github.com/wolfiesch))
- `/review` and `/annotate code-review` work from a folder of checkouts: `/review owner/repo#123` reviews a GitHub PR from anywhere; `/review ./repo [#123 | !7] [focus]` reviews in that checkout (`#N` a GitHub PR, `!N` a GitLab MR); and outside any repository, the local and open-PR menu choices ask which child repository to use

### Changed

- `/resume` and `omp --resume` open at once on your titled sessions (read from `~/.omp/agent/history.db`), then fill in prompts, status, and untitled sessions when the full scan finishes; the first scan saves older sessions' titles too, so later opens list them right away
- With `symbolPreset: ascii`, status glyphs are three columns wide (`[+]`, `[-]`, `[#]`, `[ ]`) and status spinners animate as `[|] [/] [-] [\]` ([#17732](https://github.com/can1357/oh-my-pi/pull/17732) by [@JustasMasiulis](https://github.com/JustasMasiulis))
- The subagent HUD marks each running agent with the running status glyph instead of a dot ([#17732](https://github.com/can1357/oh-my-pi/pull/17732) by [@JustasMasiulis](https://github.com/JustasMasiulis))

### Fixed

- Browser: `browser.close({ all: true })` from a subagent no longer closes its parent's tabs; it releases only the calling agent's tabs. Tabs now belong to the agent that opened them rather than its conversation id, so after `/new`, `/resume`, fork, or branch they are still frozen, idle-closed, released by close-all, and closed when the session ends instead of leaking ([#15975](https://github.com/can1357/oh-my-pi/issues/15975), [#16133](https://github.com/can1357/oh-my-pi/pull/16133) by [@harshaygadekar](https://github.com/harshaygadekar))
- `lsp request` now sends `payload: "null"` as JSON null instead of substituting auto-built document params ([#17715](https://github.com/can1357/oh-my-pi/issues/17715)).
- A prompt rejected before a turn starts because its model or credential is missing returns to the editor for retry; `.`/`c` on an empty conversation reports that there is nothing to resume ([#17828](https://github.com/can1357/oh-my-pi/issues/17828)).
- Factory Droid requests keep attached images and snapcompact system-prompt frames when tools carry large runtime state ([#17819](https://github.com/can1357/oh-my-pi/issues/17819)).
- `pr://<n>`, `issue://<n>`, and repo-less `github` tool calls in a checkout whose `upstream` remote is not the fork parent of `origin` now resolve to `origin` instead of the upstream project; `gh repo set-default` still wins
- `omp -p` text mode now prints each automatic retry with its error (for example "Couldn't reach api.anthropic.com … check your network") instead of showing only `Working...` while a turn retries ([#17529](https://github.com/can1357/oh-my-pi/pull/17529) by [@Mannan-Goyal](https://github.com/Mannan-Goyal))
- `omp --export` and `/export` no longer fail with `Error: Out of memory` on large sessions with subagent transcripts, and use far less memory: the HTML is now streamed to disk instead of built as one string ([#17741](https://github.com/can1357/oh-my-pi/issues/17741))
- A native `security_scan` with `async.enabled` on (the default) now waits for its background `security-reviewer` workers and publishes their findings, instead of ending `partial` with 0 findings and "The scan session ended without publishing a canonical result" ([#17788](https://github.com/can1357/oh-my-pi/issues/17788))
- Browser (Chrome tabs): a click or drag cancelled before its final release now releases off-page instead of completing on its target, and the page sees no click from it (not even on the document root), a timed-out key combo sends no further key, and a call or run cut off mid-gesture releases the mouse button or keys it held instead of leaving them down in the tab. Input already dispatched to Chrome, including a target release, cannot be recalled and may still take effect after timeout ([#17778](https://github.com/can1357/oh-my-pi/pull/17778) by [@will-bogusz](https://github.com/will-bogusz))
- Relay mode: `tab.waitForSelector`, `tab.evaluate` and `tab.goto` no longer fail after 20 s when the page or server takes longer; like on a launched Chrome they now run to the call's own timeout, up to omp's 60 s protocol timeout, and a command Chrome never answers names itself and its tab ([#17778](https://github.com/can1357/oh-my-pi/pull/17778) by [@will-bogusz](https://github.com/will-bogusz))
- Fixed browser `tab.click(selector, { button, count })` and `frame.click` ignoring their options and left-clicking once, so a right-click meant to open a context menu clicked the element instead; cmux tabs refuse buttons and counts they cannot press ([#17767](https://github.com/can1357/oh-my-pi/pull/17767) by [@will-bogusz](https://github.com/will-bogusz))
- Browser `fill` in Chrome no longer sometimes puts the new text in front of a Slate editor's old text when the machine is busy, and refuses a rich-text editor whose focus moves to a wrapper or the page instead of reporting success ([#17742](https://github.com/can1357/oh-my-pi/pull/17742) by [@will-bogusz](https://github.com/will-bogusz))
- Fixed a browser relay call working in a cross-site frame (an embedded sign-in form, say) failing with a bare `Target closed` when Chrome detached omp from the tab; it now says Chrome detached omp and whether the tab was reattached, as a call in the page itself does ([#17768](https://github.com/can1357/oh-my-pi/pull/17768) by [@will-bogusz](https://github.com/will-bogusz))
- Browser tabs omp opens with `persist: true` in your Chrome through the relay now stay open when the session ends (an `omp -p` run exits, a subagent finishes), so a page left for you is still there; other tabs omp opened still close, and an explicit close racing session cleanup still closes its page ([#17751](https://github.com/can1357/oh-my-pi/pull/17751) by [@will-bogusz](https://github.com/will-bogusz))
- Fixed keys you type in another app going into a page on macOS when omp's click in a relay tab opened a new tab or popup ([#16284](https://github.com/can1357/oh-my-pi/pull/16284) by [@will-bogusz](https://github.com/will-bogusz))
- Parked subagents keep their `xd://` device mounts when woken after omp restarts, so they no longer lose their earlier Claude thinking ([#17746](https://github.com/can1357/oh-my-pi/pull/17746) by [@will-bogusz](https://github.com/will-bogusz))
- Fixed cancelling `%pip` in Python eval leaving the installer process behind in Linux containers and chroots without a usable `/proc` ([#16552](https://github.com/can1357/oh-my-pi/pull/16552) by [@will-bogusz](https://github.com/will-bogusz))
- Fixed numbered `read` pages of files with very long lines ending after a few KB: a line cut to `tools.outputMaxColumns` now counts the width shown, not its full length, against the page size, so paging no longer stops before such a line or refuses to step past it. When the first cut line is larger than a `:raw` read returns, the cut notice names that byte cap, and a multi-range read that the page size stops partway through a range says where to continue ([#16595](https://github.com/can1357/oh-my-pi/pull/16595) by [@will-bogusz](https://github.com/will-bogusz))
- Fixed `write` accepting the output of a `read` whose long lines were cut to `tools.outputMaxColumns` and overwriting the file with the cut lines; it now refuses it as an incomplete read, as it does for other truncated reads ([#16595](https://github.com/can1357/oh-my-pi/pull/16595) by [@will-bogusz](https://github.com/will-bogusz))
- Fixed a session resumed, or a parked subagent woken, on a later day resending its first message with that day's date, which made Claude drop all of its earlier thinking and missed the prompt cache; earlier messages now keep the date they were sent with ([#15343](https://github.com/can1357/oh-my-pi/issues/15343)) ([#17622](https://github.com/can1357/oh-my-pi/pull/17622) by [@will-bogusz](https://github.com/will-bogusz))
- `models.yml` accepts `tokenizer: cl100k` on a custom model or override ([#17607](https://github.com/can1357/oh-my-pi/pull/17607) by [@will-bogusz](https://github.com/will-bogusz))
- Claude no longer receives the reasoning kept in a snapcompact archive whose summary an extension wrote without the reasoning legend, with or without image input, and reads that summary's own words instead of a generic one ([#17745](https://github.com/can1357/oh-my-pi/pull/17745) by [@will-bogusz](https://github.com/will-bogusz))
- Fixed `~/.omp/agent/agent.db` getting corrupted (wiping stored logins) on Linux when grep, `read`, the bash tool, extensions or eval read it while omp has it open; `write` and `tts` now refuse to overwrite a database omp holds open ([#15586](https://github.com/can1357/oh-my-pi/issues/15586))

## [18.15.0] - 2026-11-01

### Added

- Long or multi-step background shell commands get a one-line caption saying what they do and when they end, written once per job by the `widget` model role when the job, after running 15 seconds, is shown in a live widget or listed by `/jobs full`; the jobs sheet and `/jobs full` show it under the job's purpose. It follows the Live Job Widgets setting (`async.widgets`), and `CreateAgentSessionOptions.jobCaptionWriter` replaces the model call ([#17649](https://github.com/can1357/oh-my-pi/pull/17649) by [@wolfiesch](https://github.com/wolfiesch))

### Changed

- In a source checkout, the error for a missing HTML export viewer now names the script that builds it, `packages/collab-web/scripts/build-export-viewer.ts`, beside `bun gen:export-viewer` ([#17636](https://github.com/can1357/oh-my-pi/pull/17636) by [@sjawhar](https://github.com/sjawhar))
- Fixed an eval cell running silently on a new kernel after the session's Python kernel or JS worker died between cells (a crash, a kill, an out-of-memory kill, or a cancelled JS cell): the first cell on the replacement now carries `Kernel restarted: … state is unavailable. Re-run needed setup` ahead of its own output, instead of failing with a bare `NameError` on a variable an earlier cell set ([#17595](https://github.com/can1357/oh-my-pi/pull/17595) by [@sjawhar](https://github.com/sjawhar))
- Fixed a task worker messaged (`write agent://<id>`) while still starting up running on the shared `context` alone and never receiving its `tasks[].task` assignment; the message now waits for the assignment's turn ([#17587](https://github.com/can1357/oh-my-pi/issues/17587))
- `lsp reload` now discovers Rust crates created after rust-analyzer started, so hover and other analysis work without restarting omp ([#17658](https://github.com/can1357/oh-my-pi/issues/17658)).
- A model without image input (GLM, DeepSeek, Grok Composer and the like) reads a snapcompact archive's full kept text instead of image-omitted placeholders for its frames, after a model switch, on resume and in side requests ([#17510](https://github.com/can1357/oh-my-pi/pull/17510) by [@will-bogusz](https://github.com/will-bogusz))
- Snapcompact no longer refuses a new archive as "would not reduce context" when it shrinks a session that already holds one (`/compact snapcompact`, idle and pre-prompt compaction) ([#17490](https://github.com/can1357/oh-my-pi/pull/17490) by [@will-bogusz](https://github.com/will-bogusz))
- A failed `/compact snapcompact` now reports its reason once instead of twice, and names the `/compact` mode to run instead ([#17490](https://github.com/can1357/oh-my-pi/pull/17490) by [@will-bogusz](https://github.com/will-bogusz))
- Background bash and eval jobs now carry the purpose the model gave for the call: `/jobs`, `/jobs full`, `proc://` listings, `wait` and `job` results, and the jobs HUD hover lead with it ahead of the raw command line ([#17649](https://github.com/can1357/oh-my-pi/pull/17649) by [@wolfiesch](https://github.com/wolfiesch))
- The `seance` guidance in the task tool and the `archive` docs now say that a question about an earlier session is answered by the `seance` agent, and that reading the session's raw JSONL belongs to narrow mechanical checks only, so a consult is no longer duplicated by transcript reads and re-run checks ([#17523](https://github.com/can1357/oh-my-pi/pull/17523) by [@iacore](https://github.com/iacore))

### Fixed

- A prompt on a model whose provider has no usable credential (logged out, refresh token expired, or an auth broker holding none) now switches to the first `retry.fallbackChains` candidate that has one instead of failing with "No API key found", and switches back on the first prompt after the credential returns ([#17559](https://github.com/can1357/oh-my-pi/pull/17559) by [@wolfiesch](https://github.com/wolfiesch))
- Fixed background results arriving during manual `/compact` starting turns on stale history or disappearing from the saved session ([#17599](https://github.com/can1357/oh-my-pi/issues/17599)).
- Fixed isolated tasks on fuse-overlayfs leaving their overlay mounted and the `fuse-overlayfs` daemon running when the unmount hit a transient "Device or resource busy"; a failed unmount now reports fusermount's error and keeps the workspace for `omp worktree clear` instead of deleting its layers under the live mount ([#17644](https://github.com/can1357/oh-my-pi/issues/17644))
- Usage-limit retries now count system sleep toward the quota-reset deadline instead of re-arming the remaining uptime delay after the countdown reaches zero ([#17606](https://github.com/can1357/oh-my-pi/pull/17606) by [@zhiland](https://github.com/zhiland)).
- Fixed role assignments to a `models.yml` model whose id differs only by case from a bundled model of the same provider (such as `xiaomi/MiMo-V2.6-Pro` beside `xiaomi/mimo-v2.6-pro`) silently staying unset ([#17580](https://github.com/can1357/oh-my-pi/issues/17580))
- Fixed Eval's direct browser wait helpers (`tab.waitForSelector`, `tab.waitForText`, …) giving up after 29 s when passed a longer `{ timeout }`; the requested timeout is now honored up to the browser tool's 300 s cap ([#17617](https://github.com/can1357/oh-my-pi/issues/17617))
- Fixed `browser.open` with a fresh custom Chrome profile failing when Chrome has no initial tabs; it now opens its own tab without navigating an existing one ([#17583](https://github.com/can1357/oh-my-pi/issues/17583)).
- Fixed the read tool's repeated-output notice suggesting a `path:A-B` selector on `xd://` topics, MCP resources and other URLs that reject selectors ([#17631](https://github.com/can1357/oh-my-pi/issues/17631))
- The `lsp` tool now starts `typescript-native` (`tsc --lsp --stdio`) for a TypeScript 7 `tsc` installed without a `package.json`, such as the nixpkgs package, instead of leaving the project with no TypeScript server ([#17659](https://github.com/can1357/oh-my-pi/issues/17659))
- DuckDuckGo excludes advertising click redirects before applying result limits, keeping them out of direct and Public Web sources ([#17564](https://github.com/can1357/oh-my-pi/pull/17564) by [@jasonharrison](https://github.com/jasonharrison)).
- Fixed `/fast` refusing Ultrafast ("The current model does not offer the Ultrafast service tier") on custom OpenAI-compatible providers whose `/v1/models` row lists `ultrafast` in `service_tiers`, such as relays in front of a ChatGPT subscription ([#17577](https://github.com/can1357/oh-my-pi/pull/17577) by [@jakehemmerle](https://github.com/jakehemmerle))
- Importing the SDK no longer takes over the embedding host's signal and fatal-error shutdown; registered cleanup still runs at exit ([#17674](https://github.com/can1357/oh-my-pi/issues/17674)).
- Fixed raw browser `page.waitForFunction` waits timing out after a full-document navigation even when the destination matches the predicate ([#17584](https://github.com/can1357/oh-my-pi/issues/17584))
- Fixed a Ctrl+R history entry picked while an ask dialog's "Other" or note prompt is open landing in the hidden main chat input instead of that prompt ([#17565](https://github.com/can1357/oh-my-pi/issues/17565))
- Bash commands no longer hang on `git rebase -i` when git config sets a `sequence.editor` (an inline `GIT_SEQUENCE_EDITOR=…` still wins), or on Git Credential Manager GUI/browser sign-in prompts ([#17452](https://github.com/can1357/oh-my-pi/pull/17452) by [@wolfiesch](https://github.com/wolfiesch))
- Fixed intercepted bash commands asking for approval before being blocked anyway ([#17502](https://github.com/can1357/oh-my-pi/pull/17502) by [@asuffield](https://github.com/asuffield))
- Fixed `omp --from-claude` listing a Claude Code session renamed with `/rename` by its first prompt; the picker now shows the renamed title and importing the session keeps it ([#17361](https://github.com/can1357/oh-my-pi/pull/17361) by [@namest504](https://github.com/namest504)).
- Auto-learn capture turns now reuse the main turn's prompt cache instead of re-sending the whole conversation uncached: they advertise the same tool list and refuse every call except `learn` and `manage_skill` without running it ([#17418](https://github.com/can1357/oh-my-pi/pull/17418) by [@STRML](https://github.com/STRML)).
- Fixed extensions being unable to replace the background-job completion card with `registerMessageRenderer("async-result", …)`; a registered renderer now owns the card, and the built-in row remains the fallback when none is registered, when one declines, and when one throws ([#17372](https://github.com/can1357/oh-my-pi/pull/17372) by [@AlexBrd999](https://github.com/AlexBrd999), from [#14484](https://github.com/can1357/oh-my-pi/pull/14484) by [@F0Rextasy](https://github.com/F0Rextasy); [#14131](https://github.com/can1357/oh-my-pi/issues/14131))
- Local dictation stops live previews when the speech model repeatedly cannot keep up, so final transcripts no longer wait behind repeated previews ([#17410](https://github.com/can1357/oh-my-pi/issues/17410)).
- ACP clients now receive `_omp/compaction/start` and `_omp/compaction/end` notifications, including failures and cancellations, without requiring an active prompt. ([#16969](https://github.com/can1357/oh-my-pi/issues/16969); [#17384](https://github.com/can1357/oh-my-pi/pull/17384) by [@SAKANA-MOONLIGHT](https://github.com/SAKANA-MOONLIGHT)).
- Fixed `cd` (and `pushd`/`popd`/`z`) failing with `command not found: __zsh_like_cd` in agent shells when `mise activate` or `zoxide init` installed wrapper functions: the shell snapshot now keeps the underscore-prefixed helper functions those wrappers call, instead of dropping every private-looking function ([#17448](https://github.com/can1357/oh-my-pi/pull/17448) by [@KamijoToma](https://github.com/KamijoToma))

## [18.14.2] - 2026-10-31

### Added

- Added `task.perCallModel` (`off` by default, `eval`, `on`) so a task item or an eval `agent()`/`workpool()` call can run on one exact model the operator already names: a chat role from your own (non-project) settings, the selected agent's own model, or the parent's current model. Glob values (`anthropic/*`) never approve a model. `task.perCallModelAllow` narrows that list, `task.maxEffort` caps the worker's effort, and the worker never switches to another model. Project settings can only narrow this: they never turn it on or approve a model ([#12229](https://github.com/can1357/oh-my-pi/pull/12229) by [@Xytronix](https://github.com/Xytronix))
- Added `Settings.reloadFromDisk({ includeParents: true })`, which reloads the persisted settings behind an overlay while keeping the overlay's own overrides ([#12229](https://github.com/can1357/oh-my-pi/pull/12229) by [@Xytronix](https://github.com/Xytronix))

### Changed

- `model` is now declared in every task schema: a task call, eval `agent()` or `workpool()` that passes a model the operator's configuration does not allow is refused with an error ([#12229](https://github.com/can1357/oh-my-pi/pull/12229) by [@Xytronix](https://github.com/Xytronix))
- Viewing a subagent or returning to the main session no longer posts a "Viewing agent …" / "Returned to main session" status (a popup in Tern); the status line and Tern's composer already show which agent is in view
- In a Tern pane, `omp stats` shows the dashboard in place of the block it runs in, with a Close button (or Esc, or Ctrl+C) that stops it and brings the terminal back, and `/stats` opens it in a browser block beside omp, instead of the system browser
- `bash` tool commands now see `PI_TOOL_CALL_ID`, the id of the call running them, so a script the agent runs can point at that call in the session transcript ([#17489](https://github.com/can1357/oh-my-pi/pull/17489) by [@will-bogusz](https://github.com/will-bogusz))
- Native judgments with a configured fallback now move to it after a 3-second candidate deadline (configurable with `judgment.attemptTimeoutMs`) and briefly skip the timed-out route; without a configured fallback a slow judge is never cut off or replaced ([#17465](https://github.com/can1357/oh-my-pi/pull/17465) by [@Xytronix](https://github.com/Xytronix)).

### Fixed

- Fixed a `!` or `$` command run while the agent works floating over the composer in Tern, where expanding its output covered the conversation; it now sits at the end of the conversation
- Fixed `out://` replies sent from an eval cell (`tool.write` to `out://`, or `tool.bash` with `> out://`) never appearing even though the write reported "Shown to the user."; they now draw as replies after the eval card, and are refused where nothing would show them (a backgrounded cell, a browser tab script)
- Fixed a `write` to `out://` (such as `out://baselines.md`) drawing as a Write card with line numbers instead of a reply streaming as prose
- Fixed table charts drawing a `ratio` or `speedup` column as a series beside the timings it was computed from, which read as "719× less" against the baseline
- Fixed `read` of a directory hiding existing `dist`, `build`, `node_modules`, `.git`, and other dependency/build/cache subdirectories, which made them look absent ([#17539](https://github.com/can1357/oh-my-pi/issues/17539))
- Fixed artifact writes reporting the staging-file cleanup error instead of the original short-write or publication failure ([#17485](https://github.com/can1357/oh-my-pi/pull/17485) by [@jchanghong023](https://github.com/jchanghong023))
- Fixed MCP tool calls failing without reconnecting after DNS or socket-open errors ([#17461](https://github.com/can1357/oh-my-pi/pull/17461) by [@Xytronix](https://github.com/Xytronix)).
- Fixed MCP connection timeouts and cancellation allowing a stdio server to start after the connection attempt had already failed. ([#17512](https://github.com/can1357/oh-my-pi/pull/17512) by [@jchanghong023](https://github.com/jchanghong023))
- Fixed ACP updates and extension dialogs switching to an unadvertised session handle after a session reset, and a client reopening a continued conversation after a restart landing on the original session ([#17517](https://github.com/can1357/oh-my-pi/pull/17517) by [@jchanghong023](https://github.com/jchanghong023))
- Fixed IRC coordination cards remaining visible when Hide Tool Activity is enabled, including live messages and replay ([#17498](https://github.com/can1357/oh-my-pi/pull/17498) by [@dannyboy-ai](https://github.com/dannyboy-ai)).
- Fixed a message you queue while the agent waits on `ask` sitting behind the unanswered dialog; the dialog now closes without cancelling the turn, while IRC messages and background completions leave it open ([#17537](https://github.com/can1357/oh-my-pi/issues/17537)).
- Fixed JS eval `output()` ignoring its documented `offset`, `limit`, `query` and `format` options and returning the raw `read` tool result; it now returns the selected text (or the `format: "json"` metadata) like Python's `output()` ([#17455](https://github.com/can1357/oh-my-pi/issues/17455))
- Fixed session lookup losing readable project sessions when an unrelated project folder is unreadable ([#17467](https://github.com/can1357/oh-my-pi/pull/17467) by [@Xytronix](https://github.com/Xytronix)).
- Fixed the advisor resending a byte-identical refused review before trying its model fallback when the review contained no primary reasoning to strip ([#17473](https://github.com/can1357/oh-my-pi/issues/17473))
- Fixed `read` of a whole URL returning no content when the page's first line is over the 50 KB output budget, as on minified pages read with `:raw`; it now shows that line's first 50 KB ([#17500](https://github.com/can1357/oh-my-pi/pull/17500) by [@will-bogusz](https://github.com/will-bogusz))
- Fixed an advisor whose usage-limited account kept being reported as switchable retrying the same capped account thousands of times; it now tries each sibling account at most once per provider per failing review, then falls back, waits, or pauses on the quota ([#17472](https://github.com/can1357/oh-my-pi/issues/17472))
- Fixed LSP definition, type definition, implementation and reference results carrying a stray carriage return on every source context line from files with Windows (CRLF) line endings ([#17549](https://github.com/can1357/oh-my-pi/pull/17549) by [@JustasMasiulis](https://github.com/JustasMasiulis))

## [18.14.1] - 2026-10-31

### Added

- Added the `providers.openai-codex.daybreak` setting (default on) to stop omp from automatically requesting the Daybreak Blue cyber access program on eligible ChatGPT accounts; each session follows its own value ([#17508](https://github.com/can1357/oh-my-pi/pull/17508) by [@H4vC](https://github.com/H4vC))
- Added queueable compaction: `/compact` sent with the follow-up key (Ctrl+Q) while the agent works now runs when it yields instead of interrupting it ([#17397](https://github.com/can1357/oh-my-pi/pull/17397) by [@H4vC](https://github.com/H4vC))
- Added `omp session lease [--json] -- <session-id>...` and the RPC command `get_session_lease`, which report which sessions a running omp owns (`{"held": [...], "unknown": [...]}`) without taking ownership, so another program can check a session without forking it ([#17428](https://github.com/can1357/oh-my-pi/pull/17428) by [@andrebrait](https://github.com/andrebrait))
- Added opt-in `title.refreshAfterPrompts`: every N operator prompts, the judge model checks whether a generated session title still fits the conversation and regenerates it when it does not; user-set titles are never replaced ([#17443](https://github.com/can1357/oh-my-pi/pull/17443) by [@wolfiesch](https://github.com/wolfiesch))
- Gateway rows discovered from `/v1/models` now keep the `reasoning_effort_map` and `reasoning_required` facts they advertise: a route that serves only low/high/max routes `medium` to `high` instead of the nearest lower tier, and a thinking-off request still sends a tier the route accepts ([#17395](https://github.com/can1357/oh-my-pi/pull/17395) by [@Maziar123](https://github.com/Maziar123))
- Computer-use scripts can wait for a window opened by an action and read it in the same call with a window filter's optional `wait` ([#17391](https://github.com/can1357/oh-my-pi/pull/17391) by [@will-bogusz](https://github.com/will-bogusz))

### Changed

- `read` of a web page keeps the title, description, author and dates of its `<meta>` tags and lists the others by name only, so pages cost about 6% fewer tokens ([#17393](https://github.com/can1357/oh-my-pi/pull/17393) by [@will-bogusz](https://github.com/will-bogusz))
- On the Anthropic API, the newest message now keeps all its images up to the 128 MB request limit, past the 120 MB image budget ([#17492](https://github.com/can1357/oh-my-pi/pull/17492) by [@will-bogusz](https://github.com/will-bogusz))

### Fixed

- Fixed account-policy recovery repeatedly rotating through denied credentials instead of surfacing the error or using the configured model fallback, including unnecessary sibling-unblock waits after the account allowance is spent ([#17439](https://github.com/can1357/oh-my-pi/pull/17439) by [@wolfiesch](https://github.com/wolfiesch))
- Startup prewalk now arms a later fallback candidate of the role named by prewalk.into when its first candidate is unavailable, matching /prewalk and /new ([#17373](https://github.com/can1357/oh-my-pi/pull/17373)).
- Fixed `omp install git:github.com/user/repo` treating `git` as the host instead of installing the GitHub plugin ([#17436](https://github.com/can1357/oh-my-pi/issues/17436)).
- Fixed `read` showing a zip, tar, asar or ISO archive's old contents after a same-size rewrite within milliseconds of its previous write, on filesystems with coarse timestamps such as Linux ext4 ([#17389](https://github.com/can1357/oh-my-pi/pull/17389) by [@will-bogusz](https://github.com/will-bogusz))
- Browser `fill` in Chrome replaces the text of rich-text editors such as Slate (Discord) and Lexical instead of leaving the old text in place or breaking the editor, and an empty fill clears them ([#17417](https://github.com/can1357/oh-my-pi/pull/17417) by [@will-bogusz](https://github.com/will-bogusz))
- Requests to the Anthropic API and Factory Droid's hosts now drop their oldest images when long text, tool arguments, or re-declared tool definitions would otherwise push the request past the host's size limit ([#17492](https://github.com/can1357/oh-my-pi/pull/17492) by [@will-bogusz](https://github.com/will-bogusz))
- Factory Droid requests size images against what each route actually sends: Gemini models count their expanded tool schemas and no longer drop images for another model's reasoning, and only Claude models count withdrawn tool definitions ([#17492](https://github.com/can1357/oh-my-pi/pull/17492))

## [18.14.0] - 2026-10-29

### Breaking Changes

- Custom tool loaders now resolve the injected host SDK themselves; constructors take cwd as their first argument instead of a pi namespace.
- WebMCP now uses Chrome's native WebMCP support through WebMcpController, which accepts a Puppeteer Page. The former page-hook installation helpers, bridge constant, and page-hook types have been removed; Tern tabs no longer support WebMCP.
- Provider-qualified model selectors in --model, settings, roles, and task agents must identify an exact model ID or alias. Near matches now fail with a helpful error and suggestions instead of silently selecting a sibling model. Bare selectors such as opus retain fuzzy matching, and the Google Vertex Claude alias remains supported. Older migrated web fallback chains replace the retired Codex entry with openai-codex/gpt-5.6-sol.

### Added

- Agents can send an interim response without ending the current task by writing Markdown to out:// (or using > out:// in bash), with streaming output up to 64 KiB. This is enabled by default in the interactive TUI and can be configured with out.enabled; it is disabled by default in print, RPC, and ACP sessions.
- Added computer-tool approval modes: tools.approval["computer.control"] can allow unattended foreground control on dedicated machines or deny the request without prompting. The approval mode does not itself grant access.
- Added optional task-file input (task.file=true), allowing subagent instructions to be loaded from an absolute UTF-8 file path or local:// URL with the submitted path and SHA-256 recorded ([#17133](https://github.com/can1357/oh-my-pi/pull/17133) by [@iliaal](https://github.com/iliaal)).
- Sessions can be pinned or unpinned from the resume picker with Alt+K and Alt+Shift+K, or the remappable app.session.pin and app.session.unpin actions. Pinned sessions move to the top and take priority in search results ([#9837](https://github.com/can1357/oh-my-pi/pull/9837) by [@zhang17-24](https://github.com/zhang17-24)).
- Added PI_LINK_SCHEME and optional PI_LINK_HOST, allowing file links from SSH or tmux sessions to open through a desktop protocol handler ([#15855](https://github.com/can1357/oh-my-pi/pull/15855) by [@KunoLu](https://github.com/KunoLu)).
- Extensions and RPC clients can start live voice sessions using their own WebRTC peer, including phone-browser clients, through ctx.startLive({ sdpOffer }) or live_connect ([#17013](https://github.com/can1357/oh-my-pi/pull/17013) by [@materemias](https://github.com/materemias)).
- Extensions can customize assistant-text rendering and rerender individual replies through the opt-in extensionRenderers.assistantText setting ([#16238](https://github.com/can1357/oh-my-pi/pull/16238) by [@materemias](https://github.com/materemias)), and can register interactive link schemes with extension callbacks and renderer fallbacks ([#16239](https://github.com/can1357/oh-my-pi/pull/16239) by [@materemias](https://github.com/materemias)).
- /debug reports now include session-logs.txt containing all log records written by the reporting session and its subagents for the current day.
- Added prewalk.from and prewalk.into settings to choose the planning model and handoff target (default @default → @smol); /prewalk [into] and /prewalk restart [from] [into] override them for one command ([#17373](https://github.com/can1357/oh-my-pi/pull/17373) by [@H4vC](https://github.com/H4vC)).

### Changed

- Improved startup responsiveness by deferring nonessential UI, accessibility, browser, provider, slash-command, and interactive-composer loading until needed, and by overlapping independent session preparation work.
- OpenAI live steering is now disabled by default for GPT models. Typed messages wait for the next tool boundary unless providers.openaiLiveSteering is enabled, avoiding unsupported in-flight message errors.
- HTML exports now match the /stats visual design with a higher-contrast light theme, timeline and full-trace views, and navigation for nested subagents and advisors. Packaged viewers use integrity-pinned shared assets and require network access; source checkouts continue to embed the viewer.
- tui.autoGraph now defaults to auto: charts are refined by the judge for supported native TypeSafe judge models and otherwise use the built-in estimate.
- Filesystem changes are detected automatically, so manual scan-cache invalidation after edits is no longer needed.
- Model refreshes use substantially less CPU by reusing unchanged models and avoiding repeated model-cache database opens.
- Overlapping sloppy-edit operations are now applied sequentially, with each operation matched against the result of the preceding operation.
- PI_INTENT_PROMPT and PI_INTENT_DESC can now customize the system guidance and tool-schema description for the i intent field.
- Printed JSON values in eval, including large Python dictionaries and lists, are displayed as collapsible JSON trees.
- Codex and Claude rate-limit reset warnings now appear once per reset across conversations and windows, only during the final six hours; the status line continues to show the countdown.
- The . and c continue shortcuts now simply answer an unanswered last message instead of adding a hidden continue directive.
- With bash.gitGuard enabled, checkout, switch, restore, reset, and stash operations run safely in linked worktrees, while discarded uncommitted changes are preserved for recovery.
- Sessions with computer use enabled receive the desktop guide before the first computer call.
- The Tern interface now presents warnings, errors, update notices, file reads, and completed background work consistently with chat messages.
- Muted live voice sessions remain visibly muted while the voice model starts work.

### Fixed

- Fixed live configuration reloads missing edits immediately after a symlink switches to another file in the same directory.
- Fixed auth-gateway model routing after catalog refreshes so bare model IDs select the highest-priority credentialed provider, with wire-format compatibility used as a tie-breaker.
- Fixed chart recommendations that incorrectly inferred whether higher or lower values were better from row or column names; smart charting now uses the judge and avoids charting unsuitable numeric text such as page or step numbers.
- Fixed binary data flowing through background Bash pipelines being displayed as corrupted text or counted as huge line output.
- Fixed browser-tab closing delays when reattaching after a worker exits.
- Fixed startup warnings being obscured by the Tern interface; they now appear as normal in-app warnings.
- Fixed todo init clearing existing flat items when list was empty.
- Fixed legacy extensions using detached event handlers failing to load.
- Fixed MCP tools connected during vibe mode being activated prematurely and exceeding provider tool limits.
- Fixed Bash services rejecting port 0 when a log readiness condition was also provided.
- Fixed context usage and automatic compaction overstating token usage for inline tool descriptors.
- Fixed terminal titles not being restored after exit on terminals without title-stack support, including Windows consoles.
- Fixed cached approval directory grants that did not cover every target in a request.
- Fixed text typed during startup being delayed until startup completed, including resumed drafts.
- Fixed pull-request metadata and diffs remaining stale after a successful git push.
- Fixed live voice playback clicks when audio stalls mid-word.
- Fixed read rejecting artifact URLs from truncation hints under cached approvals or restricted folders.
- Fixed peer task acknowledgements being mistaken for final answers, so wait continues until the peer replies.
- Failed Hindsight memory recalls and retention operations now produce visible warnings instead of silently continuing without memory.
- Fixed long conflict-path handling, conflict-content selectors, and stale conflict IDs after aborted merges or external file changes.
- Fixed cancelled MCP OAuth flows and authentication lookups from crashing the session.
- Fixed progress HUD entries for idle local-model workers that were no longer used.
- Improved LSP diagnostics reliability across cold starts, push-diagnostics servers, save-only servers, retries, multi-server and multi-file edits, and reopened files; incomplete results are no longer reported as clean, and repeated clangd checks are faster.
- Fixed live job widgets showing incidental text from files, web pages, or search results instead of the actual job status.
- Fixed repeatedly failing advisor batches being retried indefinitely; they are now dropped after three failures.
- Fixed thinking overrides on prefix-bound Claude models from losing their provider prefix behavior during compaction and retries.
- Fixed failed large-value JSON queries from displaying the rejected value instead of a useful error.
- Fixed F5 retry reporting no retry when a background result arrived after cancellation or interruption.
- Fixed WebMCP invocation errors being empty and timed-out page invocations continuing to run.
- Fixed HTTP 413 errors for Factory Droid GPT and Grok after computer-use sessions by removing obsolete screenshots from requests.
- Fixed unavailable configured default or dictation models being silently replaced; omp now warns and identifies the fallback model.
- Fixed LSP references for files in sibling Git worktrees by adding those checkouts to the active workspace.
- Improved macOS computer-use behavior for applications without windows by opening the app and inspecting its returned window in one operation.

## [18.13.3] - 2026-10-28

### Added

- Manual compactions (RPC `compact`, `/compact`, extension `ctx.compact()`) emit `manual_compaction_start` and `manual_compaction_end` session events, so RPC hosts can show compaction progress; `docs/rpc.md` documents these with the other progress events (`retry_fallback_applied`, `ttsr_triggered`, `goal_updated`) ([#17247](https://github.com/can1357/oh-my-pi/pull/17247) by [@Quelaan1](https://github.com/Quelaan1))
- Added `retry.rateLimitWalksChain` (default `false`): with it on, a 429 rate limit after a turn with signed Claude thinking moves to the next model in `retry.fallbackChains` at once instead of retrying the throttled model until `retry.maxRetries` is spent ([#17232](https://github.com/can1357/oh-my-pi/pull/17232) by [@sjawhar](https://github.com/sjawhar))
- Sessions can be renamed from the resume picker: the new title persists as a user title without loading the session, and renames of live sessions are refused instead of forking the transcript ([#17262](https://github.com/can1357/oh-my-pi/pull/17262) by [@Twilight0](https://github.com/Twilight0))
- Added `display.advisorCollapsedLines` (Settings → Appearance → Display) to cap how many note lines a collapsed advisor card shows; the default keeps the full preview ([#17228](https://github.com/can1357/oh-my-pi/pull/17228) by [@bluecapone](https://github.com/bluecapone))
- `omp config list --scope global|project` lists only the keys that layer sets, with the values as written: path-scoped `enabledModels`, `enabledProviders` and `disabledProviders` entries (`{ path, … }`) stay unresolved, so a host can edit the global value without dropping them ([#17246](https://github.com/can1357/oh-my-pi/pull/17246) by [@Quelaan1](https://github.com/Quelaan1))
- `tools.xdevNotices: false` hides the `xd://: mounted …` notices shown as MCP servers connect, without turning on `startup.quiet` ([#17263](https://github.com/can1357/oh-my-pi/pull/17263) by [@MaisonnatM](https://github.com/MaisonnatM))

### Changed

- Updated Bun engine requirement to ≥1.4.4

### Fixed

- A running job's glance keeps the whole a meter counts instead of the bare numerator: a widget whose headline restated `140` beside a `140/190` bar now draws `140/190` in the job card, the HUD pill and the status line ([#17226](https://github.com/can1357/oh-my-pi/pull/17226) by [@iacore](https://github.com/iacore))
- Fixed the managed-skills root guard rejecting a symlinked store outright; a root that resolves to a directory now accepts writes inside its target, while a broken link or a link to a non-directory is still refused ([#17201](https://github.com/can1357/oh-my-pi/pull/17201) by [@iacore](https://github.com/iacore))
- Fixed experimental context rollover repeatedly running during tool calls when the fixed prompt and tool schemas already exceed the recovery band ([#17205](https://github.com/can1357/oh-my-pi/issues/17205))
- Fixed Ctrl+D during deferred extension startup falsely reporting an extension exit error and exiting 1 instead of closing cleanly ([#17259](https://github.com/can1357/oh-my-pi/issues/17259)).
- Resuming a session, or reviving a parked or restored subagent, after a prewalk or plan-yolo handoff continues on the model and effort the handoff switched to instead of falling back to the planning model ([#17229](https://github.com/can1357/oh-my-pi/pull/17229) by [@shgew](https://github.com/shgew))
- Fixed one interrupt silently stopping a session from ever waking on its own background job results again: an interrupt (Esc, the RPC `abort` command, an ACP cancel, a collab guest stop, an extension's `ctx.abort()`) that stops no run and no queued work no longer suppresses those wakes, and after an interrupt that did stop a run they come back once a later turn has run and ended. Esc on the "waiting on background jobs" row still ends that wait: its results land in context for your next prompt, as before ([#17243](https://github.com/can1357/oh-my-pi/pull/17243) by [@sjawhar](https://github.com/sjawhar))
- Fixed `!` commands on zsh/fish waiting forever at interactive prompts (e.g. the Oh My Zsh update question on `!code .`); keystrokes now go to the running command while it runs, and Esc still cancels ([#17210](https://github.com/can1357/oh-my-pi/issues/17210))
- Fixed auto-compaction firing early on OpenAI-compatible chat-completions models that don't replay past reasoning ([#15797](https://github.com/can1357/oh-my-pi/issues/15797), [#17231](https://github.com/can1357/oh-my-pi/pull/17231) by [@ghisguth](https://github.com/ghisguth))
- Eval's `tool.<name>(…)` now accepts `xd://<name>` and the Claude Code `mcp__<server>__<tool>` spelling like direct tool calls, and reports registered but unavailable tools instead of "Unknown tool" ([#17250](https://github.com/can1357/oh-my-pi/issues/17250))
- Updated the `ask` prompt to encourage assistants to show missing decision context before the dialog opens ([#17242](https://github.com/can1357/oh-my-pi/pull/17242) by [@jasonharrison](https://github.com/jasonharrison))
- Custom LiteLLM providers now refresh cached model rosters after paginated `/v2/model/info` discovery was fixed; cached first-page-only lists no longer hide later-page models ([#17237](https://github.com/can1357/oh-my-pi/pull/17237) by [@maykonmichel](https://github.com/maykonmichel)).
- Fixed hosted search repeating the same request when the active model is also its search target but uses a cloned or refitted model object ([#17202](https://github.com/can1357/oh-my-pi/pull/17202) by [@mateo-bolanos](https://github.com/mateo-bolanos)).
- Fixed a killed or failed inline browser tab worker keeping its connection to the browser relay, which left Chrome's "started debugging this browser" bar on every tab until the omp session exited ([#17212](https://github.com/can1357/oh-my-pi/pull/17212) by [@nickzitzer](https://github.com/nickzitzer))
- Fixed a live tool card dropping the model's `i` intent, which the harness strips from the args `tool_execution_start` carries; the card now keeps it, so a bash call in Tern shows its description instead of a bare "Bash" as it already did in a resumed session ([#17197](https://github.com/can1357/oh-my-pi/pull/17197) by [@iacore](https://github.com/iacore))
- RPC sessions now report settled (`isSettled: true`, `session_settled`) after a turn whose failed `todo` call queued a reminder for the next prompt, instead of appearing busy until another prompt arrives ([#17238](https://github.com/can1357/oh-my-pi/pull/17238) by [@kmccleary3301](https://github.com/kmccleary3301))
- `/annotate` keeps notes and an unfinished note when the overlay is closed without sending them: reopening the same source restores them, **Saved draft** resumes any of the session's drafts, and **Discard notes and close** drops one ([#17271](https://github.com/can1357/oh-my-pi/pull/17271) by [@H4vC](https://github.com/H4vC), based on [#17230](https://github.com/can1357/oh-my-pi/pull/17230) by [@Shadorain](https://github.com/Shadorain)).
- Annotation feedback names each note's source line, so notes on blank or repeated lines stay distinguishable ([#17271](https://github.com/can1357/oh-my-pi/pull/17271) by [@H4vC](https://github.com/H4vC), based on [#17230](https://github.com/can1357/oh-my-pi/pull/17230) by [@Shadorain](https://github.com/Shadorain)).
- Fixed `/tan` clones ending without a final answer when they call `ask`; the clone now keeps running and the parent receives its final answer instead of an empty result ([#17223](https://github.com/can1357/oh-my-pi/pull/17223) by [@trukhinyuri](https://github.com/trukhinyuri))
- Pasting in a terminal with enhanced paste (Tern, kitty) now lands in the open dialog's field — the agents hub's New agent description, an /annotate note — instead of the hidden prompt
- Pasting or dropping an image file into the prompt in a terminal with enhanced paste (Tern, kitty) now attaches the image instead of typing its path
- The plan review's edit button in Tern names your editor ("Edit in Notepad", "Edit in nvim") instead of "Edit in $EDITOR"
- Fixed `/tan` clones ending without a final answer when they call `ask`; the clone now keeps running and the parent receives its final answer instead of an empty result ([#17223](https://github.com/can1357/oh-my-pi/pull/17223) by [@trukhinyuri](https://github.com/trukhinyuri))
- Fixed GitHub `/review` diff links keeping the snapshot that built the request after the cached diff refreshes in the background, instead of opening whatever file now sits at the same index ([#16310](https://github.com/can1357/oh-my-pi/pull/16310) by [@tkossak](https://github.com/tkossak))

## [18.13.2] - 2026-10-27

### Added

- Extensions in the interactive TUI can read and directly switch plan, vibe, goal, and loop modes with `ctx.sessionModes` and observe changes with the `mode_changed` event, without submitting slash commands; `extensionHandlers.modeControl: false` turns off extension-driven mode changes ([#15753](https://github.com/can1357/oh-my-pi/pull/15753) by [@Shadorain](https://github.com/Shadorain))
- RPC hosts can capture draft-only speech-to-text with live previews when speech input is enabled, without submitting an agent turn; slow flushes have adjustable deadlines, and failed transcription does not block a session change after capture closes ([#17158](https://github.com/can1357/oh-my-pi/pull/17158) by [@felipe-santos-aya](https://github.com/felipe-santos-aya)).
- Added `discovery.advertisedReasoning` to let a custom provider opt out of the reasoning ladder its `/v1/models` rows advertise (default `true`); `discovery: proxy` now reads that ladder, its `none` off-switch, and an explicit `reasoning: false` instead of building every model's thinking surface from the bundled catalog reference alone ([#15255](https://github.com/can1357/oh-my-pi/issues/15255), [#17077](https://github.com/can1357/oh-my-pi/pull/17077) by [@Youwenqwq](https://github.com/Youwenqwq))
- `WATCHDOG.yml` advisor entries now accept `scope` (`main`, `subagent`, or `all`, default `all`) to attach an advisor only to the top-level session or only to advised subagents, and `includeReasoning: false` to omit primary assistant `_thinking:_` blocks from advisor review deltas ([#17058](https://github.com/can1357/oh-my-pi/pull/17058) by [@trukhinyuri](https://github.com/trukhinyuri))
- Added `session.worktreeScope` to keep the resume picker scoped to one directory ([#17061](https://github.com/can1357/oh-my-pi/pull/17061) by [@Dante-dan](https://github.com/Dante-dan)).
- LM Studio decision models can now serve the `judge` role (`modelRoles.judge: lm-studio/<model>`); they answer over LM Studio's `/v1/decisions` endpoint instead of being offered as chat models ([#17169](https://github.com/can1357/oh-my-pi/pull/17169) by [@richiestanaway](https://github.com/richiestanaway))
- Extensions' `getAllTools()` now reports `mcpServerName`, `mcpToolName` and `mcpReadOnlyHint` for MCP-backed tools, so an extension can tell read-only connector tools from ones that change things ([#17120](https://github.com/can1357/oh-my-pi/pull/17120) by [@cfpperche](https://github.com/cfpperche))
- RPC: `navigate_tree` (move the leaf in the same session file, optionally summarizing the abandoned branch), `abort_branch_summary` and `set_label`, with matching `RpcClient` methods ([#17138](https://github.com/can1357/oh-my-pi/pull/17138) by [@andrebrait](https://github.com/andrebrait))
- RPC: delta `message_update` frames (`messageUpdates: "delta"`) now carry the block on start/end events and the message on a restart, so a client can rebuild the streaming message from deltas alone ([#17137](https://github.com/can1357/oh-my-pi/pull/17137) by [@andrebrait](https://github.com/andrebrait))
- `ctx.ui.input` now accepts `{ secret: true }` to mask typed characters as bullets in the TUI, forward an optional `secret` host hint on RPC `extension_ui_request` frames, and refuse plaintext form elicitation in ACP mode ([#17080](https://github.com/can1357/oh-my-pi/pull/17080) by [@GTanger](https://github.com/GTanger))
- Added opt-in `gc.autoCompress` (default off): interactive launches start a detached, low-priority `omp gc --compress --apply` at most once a day, so idle sessions are stored compressed without running the command; volumes where compression does not shrink a probe file (e.g. macOS 27) are skipped, and the latest run's output or skip reason is in `gc-auto-compress.log` in the agent dir ([#17189](https://github.com/can1357/oh-my-pi/pull/17189) by [@wolfiesch](https://github.com/wolfiesch))
- Added `withFatLto` to the Nix package: `omp.override { withFatLto = false; }` links `pi-natives` with thin LTO for faster builds ([#13752](https://github.com/can1357/oh-my-pi/pull/13752) by [@n3oney](https://github.com/n3oney))

### Changed

- Bundled `scout` subagents now include `ast_grep` in their default tool list, matching the agent prompt's AST-search directive; `scout` stays read-only, so `lsp` (which can rename and apply code actions) is not added ([#17151](https://github.com/can1357/oh-my-pi/pull/17151) by [@sinhduc01](https://github.com/sinhduc01))
- Clearing a draft now brings back the idle recap and idle compaction it held off, a subagent view you return to gets the recap it still owed, and prompts, turn-starting messages and IRC wakes that arrive during idle compaction wait for it to finish; SDK owners can opt a session in with `AgentSession.enableIdleMaintenance({ isBlocked, scheduledTurn, onRecap })` and `refreshIdleMaintenance()` ([#17136](https://github.com/can1357/oh-my-pi/pull/17136) by [@andrebrait](https://github.com/andrebrait))
- TTSR interrupts include a bounded excerpt of the text that matched the rule, quoted as untrusted data with harness tags escaped; excerpts are retained once per stream, preserved alongside AST matches, and omitted for zero-width matches ([#17099](https://github.com/can1357/oh-my-pi/pull/17099) by [@shgew](https://github.com/shgew))
- Sessions that load several provider-registering extensions into a shared model registry (subagents, `/tan`, SDK hosts) start faster: the model catalog is rebuilt once instead of once per extension ([#17088](https://github.com/can1357/oh-my-pi/pull/17088) by [@Delije4](https://github.com/Delije4))
- Qwen 3.8 models (for example `Qwen3.8-Flash-Next` served locally) now get the `replace` edit tool instead of hashline, like Kimi, DeepSeek and GLM 5.3 Flash; an explicit `edit.mode`, `edit.modelVariants`, `PI_EDIT_VARIANT` or `PI_STRICT_EDIT_MODE` still wins ([#17096](https://github.com/can1357/oh-my-pi/pull/17096) by [@ianderse](https://github.com/ianderse))
- ACP clients now receive each tool's name on `tool_call`, so tools without a specific ACP kind (`task`, `wait`, `ask`, …) show their own name instead of a generic "tool" label ([#17162](https://github.com/can1357/oh-my-pi/pull/17162) by [@epk](https://github.com/epk))
- `/context` now opens an interactive, read-only viewer of the active prompt, tools, messages, and thinking with estimated token usage and per-tool output, instead of the static usage report ([#16160](https://github.com/can1357/oh-my-pi/pull/16160) by [@C-W-Z](https://github.com/C-W-Z)).
- Nix builds cache Rust dependencies and the native addon in separate derivations, so Rust edits no longer recompile every dependency and TypeScript edits reuse the addon ([#13752](https://github.com/can1357/oh-my-pi/pull/13752) by [@n3oney](https://github.com/n3oney))

### Fixed

- Fixed `ask` questions being unanswerable while the prompt held a draft: Up/Down now hand the keyboard to the question (typing still goes to the draft until then), and the untouched draft is back in the prompt once the question is answered or cancelled ([#17215](https://github.com/can1357/oh-my-pi/pull/17215) by [@H4vC](https://github.com/H4vC))
- Fixed the Agent Hub becoming unreachable after the last subagent finished: the people icon now stays (muted) while the session has subagents to inspect, and `/subagents` opens the hub as an alias of `/hub` ([#17215](https://github.com/can1357/oh-my-pi/pull/17215) by [@H4vC](https://github.com/H4vC))
- Fixed `/goal pause` leaving the `goal` tool active; pausing now restores the toolset from before the goal started ([#15753](https://github.com/can1357/oh-my-pi/pull/15753) by [@Shadorain](https://github.com/Shadorain))
- Fixed `/live` flipping between `listening` and `speaking` at every pause in the assistant's speech; `speaking` now holds through short pauses ([#17114](https://github.com/can1357/oh-my-pi/issues/17114))
- Fixed the `workflowz` notice showing Python call forms in JS-only sessions and describing keep-alive workers when `eval.workpool.freshAgents` is on ([#17152](https://github.com/can1357/oh-my-pi/pull/17152) by [@bigHippoZz](https://github.com/bigHippoZz))
- Fixed the first request after midnight or a working-directory change rewriting the conversation's first message, which broke OpenAI response chaining and the provider prompt cache, when an extension `context` handler or secret obfuscation was active, when an extension inserted its own message afresh on every request (superpowers' bootstrap), or when requests from one or more advisors ran in between; the new date or directory is now appended after the earlier turns, and is repeated when a side question (`/btw`) or a branch left out the turn that carried it ([#17117](https://github.com/can1357/oh-my-pi/pull/17117) by [@sjawhar](https://github.com/sjawhar))
- Fixed `:auto` on a retry fallback entry being ignored: a fixed-effort session now switches to auto thinking on that fallback instead of inheriting the failing turn's effort, and advisor fallbacks keep following the primary's effort without enabling unverified thinking ([#17100](https://github.com/can1357/oh-my-pi/pull/17100) by [@shgew](https://github.com/shgew))
- Fixed `ssh://` home-relative paths resolving against literal `/~` instead of the remote account's home ([#17182](https://github.com/can1357/oh-my-pi/pull/17182) by [@alphastorm](https://github.com/alphastorm))
- Fixed searches of `ssh://` directories failing with unsupported directory scans ([#17182](https://github.com/can1357/oh-my-pi/pull/17182) by [@alphastorm](https://github.com/alphastorm))
- Fixed clone-first worktrees carrying source-bound Python environments and CMake build trees, including self-ignored and nested directories ([#17181](https://github.com/can1357/oh-my-pi/pull/17181) by [@alphastorm](https://github.com/alphastorm))
- Fixed clean cloned worktrees carrying files ignored only by the source checkout, while retaining caches ignored by the target ([#17181](https://github.com/can1357/oh-my-pi/pull/17181) by [@alphastorm](https://github.com/alphastorm))
- Fixed glob patterns ending in `/` returning no directories or including matching files; directory-only constraints now work across local, URL, and multi-root searches ([#17180](https://github.com/can1357/oh-my-pi/pull/17180) by [@alphastorm](https://github.com/alphastorm))
- Fixed recursive `skill://` glob and find discovery skipping contained linked directories; linked resources keep their skill URLs and directory cycles terminate ([#17180](https://github.com/can1357/oh-my-pi/pull/17180) by [@alphastorm](https://github.com/alphastorm))
- Fixed find treating nonempty linked files as empty and dropping them before judgment ([#17180](https://github.com/can1357/oh-my-pi/pull/17180) by [@alphastorm](https://github.com/alphastorm))
- Fixed JSON selectors failing on BOM-prefixed input, backup and extensionless files, and modifier-only queries ([#17179](https://github.com/can1357/oh-my-pi/pull/17179) by [@alphastorm](https://github.com/alphastorm))
- Fixed JSON selectors on `ssh://` text files while preserving pagination and the remote read limit ([#17179](https://github.com/can1357/oh-my-pi/pull/17179) by [@alphastorm](https://github.com/alphastorm))
- Fixed `tool.apply_patch(...)` being rejected as an unknown tool in JavaScript eval when apply-patch editing is enabled ([#17178](https://github.com/can1357/oh-my-pi/pull/17178) by [@alphastorm](https://github.com/alphastorm))
- Fixed eval silently changing supplied cell deadlines without showing the requested and effective timeouts ([#17178](https://github.com/can1357/oh-my-pi/pull/17178) by [@alphastorm](https://github.com/alphastorm))
- Fixed unavailable Python remaining in eval's advertised languages and corrected its interpreter setup guidance ([#17178](https://github.com/can1357/oh-my-pi/pull/17178) by [@alphastorm](https://github.com/alphastorm))
- Fixed PDF archive members returning a binary-entry banner instead of converted text, with PDF selectors and page-image reads now supported ([#17175](https://github.com/can1357/oh-my-pi/pull/17175) by [@alphastorm](https://github.com/alphastorm))
- Fixed `github` `run_watch` labeling unavailable or partial failed-job logs as full logs, and included bounded fetch-failure reasons ([#17173](https://github.com/can1357/oh-my-pi/pull/17173) by [@alphastorm](https://github.com/alphastorm))
- Fixed `github` `pr_create` echoing large PR bodies in creation summaries and `xd://github` result details ([#17173](https://github.com/can1357/oh-my-pi/pull/17173) by [@alphastorm](https://github.com/alphastorm))
- Fixed raw URL reads prepending transport headers and normalizing response whitespace; raw URL bodies, ranges, and artifacts now share source-body coordinates ([#17171](https://github.com/can1357/oh-my-pi/pull/17171) by [@alphastorm](https://github.com/alphastorm))
- Fixed raw ranged reads adding elision rows, continuation notices for satisfied ranges, and conflict instructions to selected source text ([#17171](https://github.com/can1357/oh-my-pi/pull/17171) by [@alphastorm](https://github.com/alphastorm))
- Fixed `read` replacing a valid HTML page with a stale or missing guessed `.md` page; alternate representations now report their actual source URL ([#16834](https://github.com/can1357/oh-my-pi/issues/16834))
- Fixed implicit interactive `autoResume` failing every launch when a saved model cannot be restored and model fallback is disabled: startup now warns and opens a fresh session without carrying over the old history or cache identity, while preserving the original `--max-time` deadline. Saved-model diagnostics in the warning are sanitized and length-limited before display. Explicit resume and headless model-restoration restrictions remain unchanged ([#17163](https://github.com/can1357/oh-my-pi/pull/17163) by [@SAKANA-MOONLIGHT](https://github.com/SAKANA-MOONLIGHT)).
- Fixed `proc://<id>/mode` reporting a known in-process job or agent as a missing service, and clarified that stdin and lifetime modes are services-only ([#17170](https://github.com/can1357/oh-my-pi/pull/17170) by [@alphastorm](https://github.com/alphastorm))
- Fixed Rex and other OSC 7501 terminals losing the `working` or `blocked` indicator when omp redraws a user message during a run ([#17145](https://github.com/can1357/oh-my-pi/issues/17145))
- Fixed hintless Google HTTP 429 model-capacity responses using the 45–75s model-capacity backoff instead of the short generic retry delay ([#17127](https://github.com/can1357/oh-my-pi/pull/17127) by [@GTanger](https://github.com/GTanger))
- Fixed `skill://` reads, `/skill:` commands (terminal, ACP and RPC) and subagent autoload skills serving a plugin's old version, or failing with `File not found`, in a running session after `omp plugin upgrade` installed a new version; the session now rediscovers its skills and uses the upgraded files, whether or not the old version's directory was deleted ([#17027](https://github.com/can1357/oh-my-pi/pull/17027) by [@sjawhar](https://github.com/sjawhar))
- Fixed Esc on a busy session (and RPC `abort_and_restore_queue`) silently discarding queued messages from extensions and agents, such as `pi.sendMessage` steer/follow-up cards and agent-attributed prompts; they now appear in the transcript without restarting the run and reach the model with your next prompt ([#17161](https://github.com/can1357/oh-my-pi/pull/17161) by [@sjawhar](https://github.com/sjawhar))
- Fixed a failed delivery of messages typed during compaction discarding other queued messages, such as an extension's prompt; only the messages that delivery queued are taken back, and messages anything else queued before, during or after it stay queued ([#17161](https://github.com/can1357/oh-my-pi/pull/17161) by [@sjawhar](https://github.com/sjawhar))
- Fixed a failed delivery of messages typed during compaction sending the first of them twice: once now and again with the retried batch ([#17161](https://github.com/can1357/oh-my-pi/pull/17161) by [@sjawhar](https://github.com/sjawhar))
- Fixed `--resume <file|id>`, `--continue`, `SessionManager.continueRecent()`, the resume pickers and RPC `open_session` reviving an old copy of a conversation that had continued in a new file because omp could not keep writing the original (another omp process held it, or the file changed under it); resume now opens the copy with the newest turn, unless the original has turns of its own that copy lacks (for `--resume`, the pickers, and `--continue` or auto-resume of the terminal's last session), and says which file it picked; `--continue` and auto-resume without a record of the terminal's last session, and RPC `open_session`, take the copy with the newest turn among all linked copies, whichever one was written last. Copies saved before this fix are not linked and still resume as before ([#17159](https://github.com/can1357/oh-my-pi/pull/17159) by [@sjawhar](https://github.com/sjawhar))
- Fixed a `retry.fallbackChains` entry naming another Claude model being skipped while the latest Claude turn carries signed thinking: the chain now moves to that entry when the failure is on another model, is not retried (an account-policy denial, a non-retryable error, or a wait past `retry.maxDelayMs`), or has spent its retries ([#17115](https://github.com/can1357/oh-my-pi/pull/17115) by [@sjawhar](https://github.com/sjawhar))
- Anthropic composer predictions now cache the persisted conversation prefix; `/btw` follow-ups reuse stable topic history without caching regenerated image descriptions ([#17186](https://github.com/can1357/oh-my-pi/issues/17186))
- Fixed `wait` returning a skipped-tool error for background completions, peer messages, or parent steering queued before execution ([#17174](https://github.com/can1357/oh-my-pi/pull/17174) by [@alphastorm](https://github.com/alphastorm))
- Session-stop extensions now pass all continuation messages to the agent instead of silently discarding every message after the first; blocking decisions still take priority ([#17129](https://github.com/can1357/oh-my-pi/pull/17129) by [@aktanazat](https://github.com/aktanazat))
- Fixed the crash and SIGTERM recovery hint offering `omp --resume <id>` for a session that was never saved to disk, which `--resume` cannot load; such a session now prints no resume command ([#17119](https://github.com/can1357/oh-my-pi/pull/17119) by [@sjawhar](https://github.com/sjawhar))
- Fixed Ctrl+V over SSH pasting the server's clipboard when the client terminal forwards the key instead of pasting (e.g. Tern on Windows into a macOS host); omp now leaves the remote clipboard alone and points you to your terminal's paste shortcut ([#17149](https://github.com/can1357/oh-my-pi/pull/17149) by [@H4vC](https://github.com/H4vC))
- Fixed `apply_patch` committing unmatched old/context text or dropping numeric prefixes; matching now uses complete lines without changing other edit modes' fuzzy behavior ([#17184](https://github.com/can1357/oh-my-pi/pull/17184) by [@alphastorm](https://github.com/alphastorm))
- Fixed context-free `apply_patch` line deletions leaving blank rows, including first, last and only lines ([#17184](https://github.com/can1357/oh-my-pi/pull/17184) by [@alphastorm](https://github.com/alphastorm))
- Fixed `apply_patch` rejecting move-only updates and move-then-add envelopes; moves preserve source bytes and permissions and later sections see the ordered file state ([#17184](https://github.com/can1357/oh-my-pi/pull/17184) by [@alphastorm](https://github.com/alphastorm))
- Fixed `omp plugin` commands applying changes under `--dry-run`: `upgrade` and `omp update --plugins --check` now preview, and actions without a preview reject the flag ([#17104](https://github.com/can1357/oh-my-pi/pull/17104) by [@sjawhar](https://github.com/sjawhar))
- Turning off `async.widgets` mid-session now stops spec requests for already-shown job widgets and aborts any request in flight ([#17090](https://github.com/can1357/oh-my-pi/pull/17090) by [@yuzu-octopus](https://github.com/yuzu-octopus))
- Fixed `learn` not hot-registering a newly minted or updated managed skill in the active session (`session.skills`, `skill://`, and the system prompt), and fixed `composeRecallQuery` dropping prior user turns when an earlier turn repeated the latest prompt ([#17113](https://github.com/can1357/oh-my-pi/pull/17113) by [@GTanger](https://github.com/GTanger))
- Fixed `@path` file mentions skipping `.pdf`, `.docx`, `.xlsx`, `.pptx`, and `.epub` files as binary instead of converting them to Markdown with `markit` like CLI `@file` arguments and `read` ([#17193](https://github.com/can1357/oh-my-pi/pull/17193) by [@GTanger](https://github.com/GTanger))
- Fixed an automatic retry fallback (a hop down `retry.fallbackChains` or the Fireworks Fast degrade) re-rendering the system prompt for the new model, which made Anthropic write the whole cached conversation again on each hop; a hop now keeps the Model line and Delegation wording, and rebuilds only when the new model needs a different edit mode, tool-description handling, or tool set ([#17014](https://github.com/can1357/oh-my-pi/pull/17014) by [@sjawhar](https://github.com/sjawhar))
- Fixed a live subagent's system prompt re-rendering its peer list, with each peer's current activity, on every rebuild, which made Anthropic write the whole cached conversation again; the list now updates only when a rebuild changes the rest of the prompt, and `history://` lists the current peers ([#17014](https://github.com/can1357/oh-my-pi/pull/17014) by [@sjawhar](https://github.com/sjawhar))
- SQLite row selectors now avoid shadowed ROWID aliases so reads, updates, and deletes target the intended single row. ([#16998](https://github.com/can1357/oh-my-pi/issues/16998), [#17001](https://github.com/can1357/oh-my-pi/pull/17001) by [@ai-yang](https://github.com/ai-yang))
- Fixed composer predictions offering notes relayed in from other agents or sessions (for example an orchestrator's pasted status note) as the user's next message; predictions now cover only what the person at the keyboard would type ([#17185](https://github.com/can1357/oh-my-pi/pull/17185) by [@wolfiesch](https://github.com/wolfiesch))
- Fixed image descriptions using the first vision model in catalog order (such as `claude-fable-5`) when no vision model is configured; they now use the least expensive priced vision-capable model ([#17148](https://github.com/can1357/oh-my-pi/issues/17148), [#17196](https://github.com/can1357/oh-my-pi/pull/17196) by [@gcp](https://github.com/gcp))
- Fixed `wait` results and background job deliveries naming a finished subagent only by a job id that differs from its agent id (e.g. `Foo-2` for a messaged agent's new turn), where `agent://Foo-2` and `history://Foo-2` are not found; they now name `history://Foo`, plus `agent://Foo` when that turn published its output ([#17112](https://github.com/can1357/oh-my-pi/pull/17112) by [@sjawhar](https://github.com/sjawhar))
- Fixed `RpcClient.promptAndWait()` hanging until its timeout when the agent process exits or the client stops after the prompt was acknowledged; it now rejects right away ([#17135](https://github.com/can1357/oh-my-pi/pull/17135) by [@andrebrait](https://github.com/andrebrait))
- Fixed reading versioned Read the Docs pages serving the development branch's source file instead of the requested version's content when the page's Edit link targets another branch ([#17091](https://github.com/can1357/oh-my-pi/pull/17091) by [@yuzu-octopus](https://github.com/yuzu-octopus))
- Fixed RPC startup hanging when an extension opens a dialog during `session_start`: the client can now answer it, and other commands still wait for startup to finish, in order ([#17139](https://github.com/can1357/oh-my-pi/pull/17139) by [@andrebrait](https://github.com/andrebrait))
- Fixed extension tools disappearing once the startup plan mode (`plan.defaultOnStartup`) was paused or its plan approved: tools of extensions that load after startup now stay, while built-ins that plan mode registered, such as its `write` transport, still go ([#17085](https://github.com/can1357/oh-my-pi/pull/17085) by [@appboypov](https://github.com/appboypov))
- Fixed a batch `task` call silently ignoring a `model` (or `sourceSession`) on a non-`seance` item while the `seance` agent is hidden, so the child ran on its own model; the call is now refused with the same error as a single-agent call ([#17107](https://github.com/can1357/oh-my-pi/pull/17107) by [@sjawhar](https://github.com/sjawhar))
- Fixed an edit under an older `[path#TAG]` header, after another edit had changed the file, applying to lines that read never displayed, including a line it had cut at the column cap; such an edit now shows the anchored lines first, as it does under the file's current tag ([#16208](https://github.com/can1357/oh-my-pi/issues/16208), [#17033](https://github.com/can1357/oh-my-pi/pull/17033) by [@sjawhar](https://github.com/sjawhar))
- Fixed `omp gc --compress` (and the `gc.autoCompress` background run) taking minutes on large session histories ([#17195](https://github.com/can1357/oh-my-pi/pull/17195) by [@H4vC](https://github.com/H4vC))
- Fixed `omp gc --compress --apply` spending time on every idle session where the filesystem does not actually compress files (e.g. macOS 27); it now reports `compress skipped: <reason>`, and `gc.autoCompress` no longer slows interactive startup with that check ([#17195](https://github.com/can1357/oh-my-pi/pull/17195) by [@H4vC](https://github.com/H4vC))

## [18.13.1] - 2026-10-27

### Added

- Added `tools.restrictedFolders`: every action on a listed folder (the folder and everything below it) asks for an explicit Approve/Deny in every approval mode, `yolo` included, and no remembered grant, session approval, or ACP "Always allow" covers it; recursive searches rooted above a restricted folder ask too, commands are matched by the directory they run in, and a `deny` policy still denies ([#16049](https://github.com/can1357/oh-my-pi/pull/16049) by [@Peribunt](https://github.com/Peribunt))
- `/pause` shows draining turns and running jobs across the main agent's subagent tree, without waiting on finished turns, safely parked agents, or suspended advisor reviews ([#17073](https://github.com/can1357/oh-my-pi/pull/17073) by [@anatoli-tsinovoy](https://github.com/anatoli-tsinovoy)).

### Changed

- Reduced redraws during background subagent progress while keeping elapsed previews and native checklists current ([#17131](https://github.com/can1357/oh-my-pi/pull/17131) by [@iliaal](https://github.com/iliaal), based on [#16647](https://github.com/can1357/oh-my-pi/pull/16647) by [@Komzpa](https://github.com/Komzpa)).
- Restoring a session with many subagents refreshes the running-subagent badge and lists once per burst instead of once per agent ([#16642](https://github.com/can1357/oh-my-pi/pull/16642) by [@Komzpa](https://github.com/Komzpa))
- `ask` answers now name the option a note is on (`m: [X, Y] (note on Y: …)`, `User added note on Y: …`) ([#17126](https://github.com/can1357/oh-my-pi/pull/17126) by [@H4vC](https://github.com/H4vC))

### Fixed

- Fixed advisors dropping their review and showing a rate-limit error when the provider returns a timed 429 such as Codex's `turn_rate_limit_exceeded`; the advisor now waits out the Retry-After (within `retry.maxDelayMs`) and retries like the main agent ([#17087](https://github.com/can1357/oh-my-pi/pull/17087) by [@H4vC](https://github.com/H4vC))
- Fixed a hashline `PUT` being refused with "would hold one more copy of line N … than the range did" when its body restates the line next to the range, fills the range, and adds a new line equal to that neighbour (a second `@property` or `#[test]`, or a `break;` above a new `case`); it applies again, dropping only the restated line ([#17028](https://github.com/can1357/oh-my-pi/pull/17028))
- Fixed task subagents receiving `AGENTS.md` files, including the user-level `~/.omp/agent/AGENTS.md`, when the session has additional workspace roots (`--add-dir`, `/add-dir`, `workspace.additionalDirectories`)
- Fixed an `ask` note added right after picking an answer landing on the next question's answer, in Tern and the TUI; Note now goes to the answer just picked until the next question gets other input ([#17126](https://github.com/can1357/oh-my-pi/pull/17126) by [@H4vC](https://github.com/H4vC))

Older entries are archived in [packages/coding-agent/CHANGELOG.md@add60d3a7727](https://github.com/can1357/oh-my-pi/blob/add60d3a77271718311dd03e312f8b30dc646b07/packages/coding-agent/CHANGELOG.md).
Older entries are archived in [packages/coding-agent/CHANGELOG.md@5041889e64d3](https://github.com/can1357/oh-my-pi/blob/5041889e64d39ab59633bbc45b6dbb143fc936cc/packages/coding-agent/CHANGELOG.md).
## [18.4.3] - 2026-09-28

### Added

- Batch `task` calls now start each subagent as soon as its `tasks[]` item finishes streaming instead of waiting for the whole call; launched agents are aborted if the finished call is invalid, blocked, or changed. Controlled by `task.speculativeLaunch` (default on; requires auto-allowed task approval and no extension tool lifecycle handlers)
- Set `PI_SMART_GIT=1` to have every `git worktree add` in the bash tool — including inside compound commands, functions, and loops — copy-on-write clone the checkout (APFS, btrfs/XFS reflink, ReFS) instead of checking out every file, so new worktrees start with ignored build caches (`target/`, `node_modules/`) already in place; every `worktree add` option except `--orphan`, `--no-checkout`, `--track`, and `--relative-paths` is handled, and anything else still runs real git.
- In terminals that speak the Tern Surface Protocol, the working row, todo HUD, subagent HUD, judge/download progress rows, retry hint and stream console are native: the working spinner, message shimmer, elapsed timer and tok/s are terminal-clocked, todos are a phase tree with a progress bar, and clicking a subagent row focuses that agent
- `/usage` refreshes its reports with `r`. In terminals that speak the Tern Surface Protocol it is a glass sheet: provider frames with per-window meters, reset times and banked-reset badges, and a year of activity as a native heatmap with per-day tooltips; `/context` is one frame with a block grid, a legend and a bar marked at the compaction threshold; `/session` info gains a context meter; `/jobs` shows task jobs as live agent rows; `/stats` adds an Open dashboard button
- In terminals that speak the Tern Surface Protocol, MCP tool calls are native cards (an argument grid while running, then a collapsed Args section over highlighted JSON or markdown results) instead of the generic tool card; custom tools can supply their own `describeCall`/`describeResult` hooks for native views
- In terminals that speak the Tern Surface Protocol, a sent prompt's bubble shows its attached images above the text (click one to open the file) and keeps its attachment, skill and model-mention tokens highlighted as the composer drew them
- In terminals that speak the Tern Surface Protocol there is no status bar: the session name (and the branch's PR) is the tab title, Tern's pane header shows the path and branch, each finished turn ends with its time, tokens and cost, the composer carries a model chip (click to switch), an effort meter (click to cycle), a context hairline along its top edge and the context share and session cost, and other configured status segments sit as small facts in the composer; background jobs get a HUD pill
- Added the `/ratchet [flow and goal]` command: the agent asks one batched round of setup questions, builds (or reuses) an eval for the flow you name, gets three approvals (inputs, grader, plan), then hillclimbs it unattended, keeping a change only when it beats the best round on both train and held-out cases. It enables a new `ratchet(flow)` eval global for the session (docs at `xd://eval/ratchet`; persist with `ratchet.enabled`) that stores state in `.omp/ratchet/<flow>/`, invalidates approvals when the approved files change, and prices runs from the model catalog ([#13672](https://github.com/can1357/oh-my-pi/pull/13672) by [@H4vC](https://github.com/H4vC))

### Changed

- Running `omp "prompt"` without a terminal on stdin (scripts, CI, `</dev/null`) now runs the prompt headless like `-p`; a bare `omp` without a terminal exits 2 with an error instead of exiting silently ([#13623](https://github.com/can1357/oh-my-pi/pull/13623) by [@H4vC](https://github.com/H4vC))
- Invalid `--thinking`, `--approval-mode`, and `--mode` values are now rejected with a usage error (exit 2) listing the valid values, instead of being silently ignored ([#13623](https://github.com/can1357/oh-my-pi/pull/13623) by [@H4vC](https://github.com/H4vC))
- The default web search chain is now free-only: Parallel, the session's own model (new `web/hosted`), Exa, Firecrawl, SearXNG, and the credential-free scrapers. Paid engines (Perplexity, Tavily, Brave, Kagi, …) and other providers' chat models run only when you set them on the `web` role or its fallback chain.
- Parallel, Exa, and Firecrawl now run their keyless endpoints in the automatic chain instead of only when explicitly selected.
- Perplexity search no longer falls back to your OpenRouter key; select `openrouter/perplexity/…` explicitly to search through OpenRouter.
- Hosted web search now follows the model rather than the host: GPT-5+ over any Responses API, Claude 4+ over any Messages API, and Gemini 2+ (including Gemini CLI), so `web/hosted` works through proxies and gateways. A model-backed search that returns no sources now counts as a failure, so the chain moves on to the next engine instead of showing an unsourced answer.
- `web/hosted` first tries a cheaper model on the session's own provider (e.g. Opus → Haiku, GPT-5.x → GPT-5.6 Luna, Gemini Pro → Flash) and falls back to the session model itself when the host does not offer it or the call fails.
- Image generation now tries the session provider's own image model first (e.g. GPT-5.x → `gpt-image-2`, Gemini → `gemini-3-pro-image`, Grok → `grok-imagine-image`), and a GPT-5+ session model generates images itself through the hosted image tool when its provider or proxy has no image model.
- The default image model chain now uses `openai/gpt-image-2`, `openai-codex/gpt-image-2`, and the GA `gemini-3-pro-image` (Google and OpenRouter) instead of `gpt-image-1` and the Gemini preview id.
- Reduced CPU while streaming replies and tool calls: the reveal no longer deep-compares frozen leading content on every flush, streamed argument extraction no longer re-verifies the whole prefix, and deltas no longer queue extension notifications when no extension listens for `message_update` ([#13650](https://github.com/can1357/oh-my-pi/pull/13650) by [@H4vC](https://github.com/H4vC)).
- Reduced CPU and allocations for in-memory reads (URLs, notebooks, converted documents), tool-result spill checks, write read-projection guards, and hashline prefix stripping ([#13650](https://github.com/can1357/oh-my-pi/pull/13650) by [@H4vC](https://github.com/H4vC)).

### Fixed

- Fixed alt+p and `/switch` model picker latency by avoiding unnecessary catalog rebuilds
- Fixed `--tools` with an unknown name printing a stack trace and listing only the tools left after filtering; it now prints a clean error naming unknown tools, built-in tools unavailable in the session, and the built-in and registered tools ([#13623](https://github.com/can1357/oh-my-pi/pull/13623) by [@H4vC](https://github.com/H4vC))
- Fixed unknown CLI flags exiting 1 with an extra "ended before completing" line instead of exiting 2 ([#13623](https://github.com/can1357/oh-my-pi/pull/13623) by [@H4vC](https://github.com/H4vC))
- Fixed a mistyped `--model` in print mode telling you to set an API key; it now suggests the closest available models ([#13623](https://github.com/can1357/oh-my-pi/pull/13623) by [@H4vC](https://github.com/H4vC))
- Fixed the alt+p / `/switch` model picker taking seconds to appear: it rebuilt the whole model catalog on every open before painting, and now re-reads it only when startup discovery is still landing or models.yml changed
- Fixed `tool_call` `additionalContext` being delivered more than once when several extension or hook handlers on the same call returned identical text ([#13633](https://github.com/can1357/oh-my-pi/pull/13633) by [@andrebrait](https://github.com/andrebrait))
- Fixed hosted OpenAI web search on hosts that accept only string tool_choice values, such as Command Code ([#13666](https://github.com/can1357/oh-my-pi/pull/13666) by [@riicodespretty](https://github.com/riicodespretty))

### Removed

- Removed the web search provider picker from `omp setup`; set the `web` model role (or keep the free default chain) instead.

## [18.4.2] - 2026-09-28

### Added

- The shell's `cp` builtin accepts macOS's `-c` (clone where possible, else copy; same as `--reflink=auto`).

### Changed

- Removed unused timestamp metadata from model usage tracking queries to optimize database overhead
- Improved session storage reliability by using atomic inode identity verification for lock management
- Optimized internal role chain resolution and caching to reduce event-loop contention during judge initialization
- On macOS, the shell's `cp` builtin now also clones (copy-on-write) when overwriting an existing file, instead of rewriting its data; the destination keeps its permissions, and hard-linked destinations are still written in place.
- The `find` tool now fails with a timeout error after 20 seconds instead of blocking the turn when the judge model stalls.
- Reduced main-thread stalls with many agents running: `read` code summaries now parse off the main thread, streamed tool-call snapshots no longer deep-copy growing argument text on every delta, and model-cache reads skip re-parsing unchanged rows.
- Reduced CPU while an agent streams: the working-row token rate and status line no longer re-tokenize or re-resolve settings every frame, and `^` model mentions no longer rebuild the model scope per keystroke.
- `task` and `/vibe` subagents now get their own Python kernel and JS/Ruby/Julia eval state instead of sharing the parent's, so agents can no longer overwrite each other's variables or reset each other's kernels.
- On Windows, the shell's `cp` builtin now clones files (copy-on-write) on ReFS and Dev Drive volumes by default, falling back to a regular copy elsewhere; `--reflink` and `-c` no longer fail there.

### Fixed

- Fixed mouse handling ignoring per-mode TUI mouse setting
- Fixed the shell's `cp --reflink=always` emptying an existing destination when the filesystem cannot clone; the destination is now left untouched.
- Fixed `block-clone` task isolation on Windows ReFS and Dev Drive volumes failing on files whose size is not a whole number of clusters, larger than 4 GiB, or sparse.
- Fixed Google Antigravity requests failing with `429 RESOURCE_EXHAUSTED` on every turn: the system prompts' RFC 2119 conventions line is reworded so the endpoint no longer rejects it ([#13379](https://github.com/can1357/oh-my-pi/pull/13379) by [@heshuoshuo0512](https://github.com/heshuoshuo0512))
- Fixed CRLF `SKILL.md` files injecting raw YAML frontmatter into user-invoked and autoload skill messages ([#13590](https://github.com/can1357/oh-my-pi/issues/13590)).
- Fixed Cursor native Grep ignoring requested context, Read negative offsets starting at the top, and Delete reporting zero-byte files ([#13600](https://github.com/can1357/oh-my-pi/issues/13600)).

## [18.4.1] - 2026-09-28

### Changed

- With LSP disabled (`--no-lsp` or `lsp.enabled: false`), startup skips language-server discovery and warmup, and the welcome screen no longer shows the LSP Servers section
- The first frame's status bar now renders live at the current terminal width from the cached model, thinking level, and status-line settings instead of replaying an `…`-filled snapshot: path and git branch are always current, the context gauge shows the window without a stale percent, git dirty counts no longer blank out when the session bar takes over, and folders that never ran omp paint the bar (and your theme) too.
- Moved the composer startup cache (theme, welcome, recent sessions, LSP rows, status bar) from per-project JSON files under `cache/composer/` to a single `cache/composer.db`; the old directory is no longer read and can be deleted.
- Improved interactive startup: the session status bar appears sooner because `retry.fallbackChains` validation, the background model-catalog refresh, and project daemon registration no longer block the first session frame.
- Reduced CPU use from subagent HUD repaints during active sessions ([#13245](https://github.com/can1357/oh-my-pi/pull/13245) by [@iliaal](https://github.com/iliaal)).
- Clarified which provider transports honor `thinkingBudgets` and that local OpenAI-compatible models use effort controls instead ([#13503](https://github.com/can1357/oh-my-pi/issues/13503)).
- `/fork` now prints how to resume the session it leaves behind (`omp --resume <id>` or `/resume <id>`) instead of the new transcript's filename ([#13338](https://github.com/can1357/oh-my-pi/pull/13338) by [@LlemonDuck](https://github.com/LlemonDuck))
- `/vibe` status checks no longer redraw every worker the director killed: `vibe_wait` and `vibe_list` leave killed sessions off the wall with a `N killed hidden` count, and `vibe_list` collapses them to one trailing line naming the most recent (transcripts stay at `history://<id>`) ([#13073](https://github.com/can1357/oh-my-pi/pull/13073) by [@igasmi](https://github.com/igasmi)).

### Fixed

- Fixed `find` exhausting memory on trees with many matching lines: its keyword scan now counts matches as they stream in, holding a few hundred MiB where a 5-million-line tree took several GiB, and finishes faster ([#13495](https://github.com/can1357/oh-my-pi/issues/13495))
- Fixed a native compaction speculation that failed for good turning off background compaction for the rest of the cycle. With `compaction.methodOrder` such as `["remote", "soft"]`, speculation now moves to the next configured method and the threshold pass keeps deferring to it, instead of running that method on the blocking path ([#13478](https://github.com/can1357/oh-my-pi/pull/13478) by [@andrebrait](https://github.com/andrebrait)).
- Extensions that register bash through the legacy `createBashTool`/`createBashToolDefinition` with a `spawnHook` no longer make every bash call fail with `ready and env require a service name.` ([#13461](https://github.com/can1357/oh-my-pi/pull/13461) by [@sjawhar](https://github.com/sjawhar))
- Fixed `/new` with automatic thinking starting the new session at the previous session's classified effort instead of the provisional level, both in its first `thinking_level_change` entry and on the wire ([#13383](https://github.com/can1357/oh-my-pi/issues/13383))
- Fixed a corrupt `agent.db` crashing every launch with `no such table` (for example `hint_usage`) instead of being preserved and recreated ([#13530](https://github.com/can1357/oh-my-pi/pull/13530) by [@Hunter-124](https://github.com/Hunter-124))
- Fixed `edit` rejecting a one-line replacement of an `if` opener, `case` label, or function signature with another of the same shape as an "ambiguous boundary" whenever another edit in the same batch broke the file's syntax; it now applies with the usual syntax-error warning. ([#13522](https://github.com/can1357/oh-my-pi/pull/13522))
- Jujutsu status and diffs now report renames and copies (`R`/`C`, `rename from`/`rename to`) the way `jj status` and `jj diff` do, instead of a delete plus an add ([#13406](https://github.com/can1357/oh-my-pi/pull/13406) by [@sjawhar](https://github.com/sjawhar)).
- Fixed a subagent that finished before a later step failed (such as the isolation merge) losing its evidence: the `task` result now names the child's exit status and `agent://` output, keeps that output on disk, and is marked as an error ([#13557](https://github.com/can1357/oh-my-pi/pull/13557) by [@aktanazat](https://github.com/aktanazat))
- Fixed SDK sessions created with `agentDir` loading user rules (`rules/`, `RULES.md`) and custom tools from the default agent dir instead of that `agentDir`; `discoverCustomToolPaths` and `discoverAndLoadCustomTools` accept an `agentDir` argument ([#13558](https://github.com/can1357/oh-my-pi/pull/13558) by [@aktanazat](https://github.com/aktanazat))
- Reduced daemon broker metadata writes for historical services when owners reconnect or the broker restarts ([#13471](https://github.com/can1357/oh-my-pi/pull/13471) by [@Dante-dan](https://github.com/Dante-dan)).
- Fixed compaction re-emitting the whole transcript into native scrollback when `display.collapseCompacted` is off, for both the automatic compaction-end and the manual `/compact` path ([#12140](https://github.com/can1357/oh-my-pi/issues/12140), [#13235](https://github.com/can1357/oh-my-pi/pull/13235) by [@holny](https://github.com/holny))
- Subagents can submit their preceding report with a data-less yield after a finish reminder ([#12837](https://github.com/can1357/oh-my-pi/pull/12837) by [@iliaal](https://github.com/iliaal)).
- Fixed session dispose losing the final message and exit record on SQL/indexed session storage ([#13415](https://github.com/can1357/oh-my-pi/pull/13415) by [@sjawhar](https://github.com/sjawhar))
- Fixed the `recall`, `reflect`, and `memory_edit` tool descriptions naming each other by bare name when those tools are reachable only as `xd://` devices ([#13207](https://github.com/can1357/oh-my-pi/pull/13207) by [@andrebrait](https://github.com/andrebrait)).
- Listed the directories searched for agent files in the `task` tool's unknown-agent error, with the home directory shortened to `~`
- Fixed sessions and subagents of the same agent in different working directories (such as one git worktree per task) never sharing the cached Anthropic system prompt: context files, workspace tree, workspace roots, and other directory-specific sections now come after the static system prompt, which stays a cache hit across directories ([#13104](https://github.com/can1357/oh-my-pi/issues/13104))
- Fixed the startup "What's New" heading and config warnings keeping the dark palette on a light terminal: they were colored before the terminal reported its background, so the heading rendered near-white on white. Both now resolve their color at render time and follow the auto theme switch
- Fixed idle `display: true` custom messages (such as extension `pi.sendMessage` notices sent without starting a turn) not appearing in the transcript until the session was reloaded ([#12718](https://github.com/can1357/oh-my-pi/pull/12718) by [@Broglah1](https://github.com/Broglah1)).
- Fixed `omp usage` ignoring usage providers registered by extensions, which left those accounts listed as having no usage data; `omp usage` now also accepts `-e`/`--extension` and `--no-extensions` ([#13579](https://github.com/can1357/oh-my-pi/issues/13579))
- Fixed a task model saved in `/agents` being ignored for the rest of the session after an Alt+P session-only pick ([#13345](https://github.com/can1357/oh-my-pi/issues/13345)).
- Fixed tool calls made through an `xd://` alias being recorded under the alias, which made OpenAI/OpenRouter Responses replay reject every later request ([#13352](https://github.com/can1357/oh-my-pi/issues/13352)).
- Fixed pasted images in skill invocations not reaching the configured vision model when the main model supports only text ([#13480](https://github.com/can1357/oh-my-pi/issues/13480)).
- A provider listed in `disabledProviders` no longer answers through a retry fallback chain, an advisor or a restored model, and gets no credential however one of its models was selected ([#13194](https://github.com/can1357/oh-my-pi/pull/13194) by [@sjawhar](https://github.com/sjawhar)).
- Fixed `glob` silently clamping `limit` above 200 while advising `Use limit=<clamped>` retries: a clamped request is now disclosed up front and the "Use limit=" advice is dropped once the hard cap is reached ([#13263](https://github.com/can1357/oh-my-pi/issues/13263))
- Fixed subagents that stop to wait for their own background job failing with a missing yield instead of waiting for the job ([#13305](https://github.com/can1357/oh-my-pi/issues/13305)).
- Fixed a failed session append leaving partial bytes behind on Windows, where ftruncate is refused on the append handle: the rollback now reopens the file without O_APPEND and verifies it is still the same file before truncating ([#13362](https://github.com/can1357/oh-my-pi/pull/13362) by [@jchanghong023](https://github.com/jchanghong023))
- Fixed plugin installation failing on Windows outside developer mode by linking the plugin through a directory junction, matching the marketplace link ([#13364](https://github.com/can1357/oh-my-pi/pull/13364) by [@jchanghong023](https://github.com/jchanghong023))
- Fixed the grep tool searching subdirectories for globs whose base path merely resolved to the cwd: only globs spelled without a directory prefix (like `*.ts`) now match at any depth, while `./*.ts` and absolute paths stay scoped to their directory ([#13360](https://github.com/can1357/oh-my-pi/pull/13360) by [@jchanghong023](https://github.com/jchanghong023))
- Fixed the `ask` tool's "Other (type your own)" prompt sending RPC and SDK clients a terminal-rendered title (options with icon glyphs, lines clipped to the terminal width) instead of the question text; the interactive TUI's own ask dialog is unaffected ([#13477](https://github.com/can1357/oh-my-pi/pull/13477) by [@andrebrait](https://github.com/andrebrait))
- Fixed prewalk targets registered by extensions resolving before their provider was loaded. The hand-off now retries after extension registration, preserves role fallback order, and refreshes a cold runtime provider when needed.
- Fixed saving settings on Windows through a symlinked `config.yml` whose target contains `..` writing a file other than the one the link reads, and `agent.db` staying open after its storage is closed ([#13351](https://github.com/can1357/oh-my-pi/pull/13351) by [@Vortex727](https://github.com/Vortex727))
- Fixed grep line ranges (`path:N-M`) returning out-of-range lines for absolute paths with `./` or `..` segments ([#13296](https://github.com/can1357/oh-my-pi/pull/13296) by [@pedropaulovc](https://github.com/pedropaulovc)).
- Fixed service requests the project's service broker cannot parse, such as commands added by a newer omp after an update, waiting 30 seconds to time out; the broker now rejects them immediately with the reason ([#13301](https://github.com/can1357/oh-my-pi/pull/13301) by [@eggpeat](https://github.com/eggpeat)).
- Fixed sessions stopping on "Anthropic stream stalled while waiting for the next event" (and other mid-stream stalls, HTTP/2 resets, premature closes, or sockets closed mid-response) when the connection died after the reply's text had already rendered. Replay was refused to avoid duplicating shown text and the tool-turn continuation needed a tool call, so text-only turns had no recovery; the partial turn is now kept and the model is asked to continue from where it stopped, up to 3 times per prompt when `retry.enabled` is on ([#13333](https://github.com/can1357/oh-my-pi/pull/13333) by [@jerryfane](https://github.com/jerryfane))
- Fixed editing one fallback chain in the model hub, or one agent in `/agents`, saving every chain or agent a `--config` overlay supplies into `config.yml` ([#13308](https://github.com/can1357/oh-my-pi/pull/13308) by [@Vortex727](https://github.com/Vortex727))
- Fixed `omp install --dry-run <local-path>` and `omp plugin link --dry-run` linking the plugin and writing the lockfile instead of only previewing ([#13241](https://github.com/can1357/oh-my-pi/pull/13241)).
- Sessions containing assistant messages with no recorded usage now open with that usage counted as zero, instead of crashing on load with `undefined is not an object (evaluating 'usage.cacheRead')` ([#13386](https://github.com/can1357/oh-my-pi/pull/13386) by [@ParadaCarleton](https://github.com/ParadaCarleton)).
- Fixed rules with an `astCondition` and `interruptMode: always` letting the matching `write` or `edit` run before the interrupt, so the file changed on disk even though the rule fired; the call is now blocked before it executes ([#13303](https://github.com/can1357/oh-my-pi/pull/13303) by [@JYeswak](https://github.com/JYeswak))
- Fixed rules not applying to tool calls made from inside `eval` (for example `tool.write(...)`), which ran without any rule check; they are now checked the same way as direct calls ([#13316](https://github.com/can1357/oh-my-pi/pull/13316) by [@JYeswak](https://github.com/JYeswak))
- Fixed bash calls whose optional fields arrive filled with empty values being rejected as service starts ([#13182](https://github.com/can1357/oh-my-pi/issues/13182)).
- Fixed keyless vLLM providers failing every request with "No API key found" ([#13246](https://github.com/can1357/oh-my-pi/issues/13246)).
- Fixed the Agent Hub usage gauge measuring a subagent against its startup model's context window after a fallback model swap ([#13061](https://github.com/can1357/oh-my-pi/pull/13061)).
- Fixed HTML session exports failing to render offline or under a strict script CSP; the viewer libraries are now inlined ([#12948](https://github.com/can1357/oh-my-pi/issues/12948)).
- Fixed hashline edits rejecting files whose names contain `#` (such as yadm alternate files) ([#13428](https://github.com/can1357/oh-my-pi/pull/13428)).
- Fixed a module created with `write` leaving the importing file stuck on TS2307 in typescript-language-server ([#12925](https://github.com/can1357/oh-my-pi/pull/12925)).
- Fixed startup waiting up to 10s on an unresponsive LM Studio loopback probe; the probe now gives up after 250ms like Ollama and llama.cpp ([#12945](https://github.com/can1357/oh-my-pi/issues/12945)).
- The interactive `/usage` dashboard keeps connected accounts visible when some or all usage lookups fail, showing unavailable usage instead of hiding accounts ([#13476](https://github.com/can1357/oh-my-pi/pull/13476) by [@aktanazat](https://github.com/aktanazat)).
- Fixed multiline pastes splitting into separate submissions after a terminal drops bracketed-paste mode, and text typed right after Enter being erased by the post-submit clear ([#13440](https://github.com/can1357/oh-my-pi/pull/13440) by [@Dante-dan](https://github.com/Dante-dan)).
- Fixed subagents never compacting when the parent sets `compaction.midTurnEnabled: false`; a subagent's run is a single turn, so subagents keep mid-run compaction on unless a spawn overrides it ([#13212](https://github.com/can1357/oh-my-pi/pull/13212)).
- Fixed the exit resume hint so the `omp --resume <id>` command prints on its own line, letting triple-click select just the command ([#12748](https://github.com/can1357/oh-my-pi/pull/12748) by [@F0Rextasy](https://github.com/F0Rextasy)).

## [18.4.0] - 2026-09-28

### Added

- Added the `telemetry.otlpExportEnabled` setting under Settings → Providers → Privacy to disable OTLP trace, log, and metric export even when `OTEL_*` endpoints are configured; exporting remains enabled by default.
- Added a first-launch warning when Python evaluation is enabled but no working Python interpreter is available, with guidance for configuring `python.interpreter` and checking the installation with `omp setup python --check`.

### Changed

- Updated `omp stats` and `/stats` to open the redesigned dashboard immediately while session data synchronizes in the background with live progress; `--json` and `--summary` continue to synchronize before producing output.
- Replaced the stats dashboard’s Behavior page with a Frustration page that can classify messages using the `judge` model role, showing an estimated cost before analysis and recording `/stats` spending in the current session.
- Clarified the `eval` tool documentation to explain that its kernel may be shared with the parent session and concurrent task subagents.

### Fixed

- Fixed `/tree` reopening saved Ask results instead of navigating past them when an optional preview was saved as `null`.
- Fixed the legacy `createGrepTool()` API when searching with both a file path and a `glob` filter.
- Improved task and subagent reliability: eligible saved usage resets are now redeemed automatically when polling is throttled or transient failures occur, concurrent tasks share confirmed resets, headless subagents retain assignments across session transitions, tagged `^model` agents are available to nested subagents, and `wait` returns promptly with information about still-running work when no owned jobs are available.
- Fixed SDK requests using `ApiKeyResolver` to wait for a nearby healthy credential when a drained account’s quota block is about to expire, instead of immediately failing with a multi-hour quota error.
- Fixed Anthropic requests failing after native compaction when experimental context notes were enabled.
- Fixed Windows path handling for 8.3 short paths, including project-directory detection and home-directory display in status, tool labels, and errors.
- Fixed `edit` `PUT >N` producing syntactically invalid code when inserting shallower constructs near closing braces.
- Fixed Windows one-shot commands, including `omp update`, incorrectly reporting successful completion as an error; also fixed this behavior when no user npm or Bun configuration file exists.
- Fixed missing judge token counts corrupting session usage totals and displaying `$NaN`.
- Fixed Cursor sessions under-reporting token usage and cost, compacting based on the wrong context measurement, and applying shell-command timeouts in the wrong units.
- Updated goal mode to wait for user input when all remaining todos are blocked instead of repeatedly requesting approval.
- Fixed `pi-background-tasks` 2.6.0 and later failing to load due to a missing legacy `pi-ai` compatibility export.
- Fixed blob broker requests when `PI_PROXY` is configured.
- Fixed `generate_image` reporting the catalog model instead of the image model actually used by the ChatGPT/Codex backend; saved image metadata now reflects the provider-returned size and quality.
- Fixed fast-model fallback selection so it no longer chooses Gemini or MiniMax models when no `smol` role is configured.
- Fixed extension tool renderers using upstream pi’s `renderCall(args, theme, context)` signature failing to render.
- Fixed Nix flake and NixOS module builds failing because the native package version stamp was not recognized.
- Fixed Nix dependency-lock checks failing after obsolete stats chart dependencies were removed.

## [18.3.5] - 2026-09-27

### Added

- Added API-key-billed OpenAI Responses web search (`openai/gpt-6-luna`, then `openai/gpt-5.6-luna`), tried after every Codex entry in the default search fallback chain so ChatGPT-subscription search is exhausted before any API usage is billed ([#13467](https://github.com/can1357/oh-my-pi/pull/13467) by [@anatoli-tsinovoy](https://github.com/anatoli-tsinovoy)).
- Added prompt-cache warming, ported from [earendil-works/pi](https://github.com/earendil-works/pi): shortly before a prompt-cache entry expires, the main agent loop replays its last request and cuts the replay off at the first generated token, so idle gaps no longer force a full-prefix cache re-write. A refresh fires only when the expected avoided-miss cost clears its cost by $0.05, and warming stops as soon as a refresh misses the cache. Controlled by `providers.cacheWarming` (`off` / `streaming` / `idle`, default `idle`); idle warming covers 5-minute entries only, and models without a declared `promptCache` lifetime are never warmed. Extensions can override each decision through the `cache_warming_decision` event ([#12699](https://github.com/can1357/oh-my-pi/pull/12699) by [@KamijoToma](https://github.com/KamijoToma)).

## [18.3.4] - 2026-09-27

### Breaking Changes

- Replaced the `task` tool's `complexity` field with `solutionSpace`, a description of how open-ended the subtask is; `auto` thinking for spawned subagents now picks effort from it alone

### Changed

- `auto` thinking now picks effort for every turn by how open-ended the problem is, so large volumes of mechanical work no longer raise it

### Fixed

- Fixed agents looping for hours when every turn spends the whole output limit on reasoning: length-stop retries now tell the model its reasoning was discarded and to act in smaller steps, and a subagent whose length-stop recovery gives up now fails with that error instead of being re-prompted into the same loop
- Fixed tagging a model with `^` mid-session dropping the provider prompt cache for every following turn: new `m<N>` pseudonyms now arrive as a hidden session notice instead of rewriting the `task` description, which only absorbs them at a base-prompt rebuild

Older entries are archived in [packages/coding-agent/CHANGELOG.md@3faa7ce5154a](https://github.com/can1357/oh-my-pi/blob/3faa7ce5154a0a1e29561772048dac6dcab1c5cf/packages/coding-agent/CHANGELOG.md).
## [18.3.3] - 2026-09-27

### Added

- Added a unified predictive text engine with N-gram, SmolLM2, and macOS native providers, including cross-engine blending, background model downloads, and a cross-process prediction daemon.
- Added the `omp predict` command for evaluating completion performance and support for ingesting existing Claude Code and Codex prompt histories to bootstrap predictions on new installations.
- Added `omp skill list [dir] [--json]` to report skills resolved for a session directory, including discovery warnings in JSON output.
- Added a centralized progress display for background tool and model downloads, including support for downloading the SmolLM2-135M word-completion model.
- Added dynamic evaluation guidance through hidden session notices.
- Added a required `complexity` rationale to the `task` tool to improve automatic thinking-depth selection.
- Agents using `task` or `bash` now receive the `wait` tool for background-process coordination, and subagents can receive it when explicitly requested.
- Added context-aware suggestions to empty composers based on agent activity and effort.
- Added optional global or per-project memory scopes to the `retain` and `learn` tools when Mnemopi scoping is enabled.
- Added `/btw` to focused subagent views for asking questions about that agent's transcript with separate side-conversation history.

### Changed

- Completion behavior now uses the N-gram engine for standard `auto` completion across platforms, with blended N-gram and SmolLM confidence scoring where applicable; the SmolLM2 model uses a 145 MB GGUF (Q8_0) download and is prefetched only when explicitly activated.
- Updated `spelling.autocomplete` to use an enum-based engine configuration.
- Completion ghost text is now preserved through manual keystrokes.
- Window input actions now default to background execution; set `takeover: true` to opt into foreground activation, with clarified cross-platform coordinate and activation behavior.
- `omp tiny-models download` can now download the word-completion model.
- Updated `/play` help, read-tool summaries, platform-aware shortcut labels, and other UI hints for clearer interaction guidance.
- Updated the empty-submit behavior to account for live-steered messages and surface pending live-steering status in the UI.
- `ps --all` now includes exited global services, while the default view shows live global services.
- Orchestrator task documentation now follows a Target/Change/Acceptance format.
- Slash-command and hint usage tracking is now persistent and namespaced.

### Fixed

- Preserved MCP `structuredContent` in live tool-result details so evaluation callers can consume server data without reparsing model-facing JSON; spilled results continue to retain an artifact reference without duplicating the payload in session history.
- Fixed Collab hosts becoming unable to reclaim a room after a brief network interruption; hosts now retry room recovery without losing guests or queued updates.
- Fixed one-shot commands that stopped before completing, such as `omp config set` on a fresh Windows profile, incorrectly exiting successfully without output; they now report failure with diagnostic guidance.

## [18.3.2] - 2026-09-25

### Added

- Added `ctx.agent` to the extension context, reporting whether the session is the top-level agent or a subagent, plus its registry id, agent definition name, task depth and parent id, so handlers rebound to subagent sessions can tell which agent they serve ([#13314](https://github.com/can1357/oh-my-pi/pull/13314) by [@andrebrait](https://github.com/andrebrait))
- Added tracking of Anthropic's usage-limit wrap-up allowance for Claude subscription accounts: after the 5-hour or weekly limit is reached, the status line and `/slow status` show `limit reached · wrapping up · resets HH:MM`, and the agent is told to wrap up when neither low priority nor extra usage will continue the work ([#13340](https://github.com/can1357/oh-my-pi/pull/13340) by [@H4vC](https://github.com/H4vC))

### Changed

- `providers.anthropic.slowMode` now controls only the low-priority lane; the usage-limit wrap-up allowance is tracked for every first-party Claude subscription account ([#13340](https://github.com/can1357/oh-my-pi/pull/13340) by [@H4vC](https://github.com/H4vC))
- Enter on the `/model` hub sidebar now moves focus to the model list (like →) instead of acting on the highlighted row ([#13347](https://github.com/can1357/oh-my-pi/pull/13347) by [@H4vC](https://github.com/H4vC))

### Fixed

- Fixed the Windows bash tool exporting `TEMP`, `TMP`, and `TMPDIR` with 8.3 short names such as `ADMINI~1`, so they now match the long-form `pwd`/`$PWD` after `cd "$TEMP"` ([#13265](https://github.com/can1357/oh-my-pi/pull/13265) by [@CoderTCY](https://github.com/CoderTCY))
- `edit` and `write` no longer refuse handwritten files named `generated.go`, `generated.ts`, `generated.js`, or `generated.py`; these are treated as auto-generated only when their header carries a generated-code marker ([#13138](https://github.com/can1357/oh-my-pi/issues/13138), [#13139](https://github.com/can1357/oh-my-pi/pull/13139) by [@radkawar](https://github.com/radkawar))
- Fixed the `edit` tool warning that valid Go 1.26 `new(expr)` calls (e.g. `new(f(x))`) introduced a syntax error, and `ast_grep`/`ast_edit` reporting parse errors on them ([#13148](https://github.com/can1357/oh-my-pi/issues/13148), [#13149](https://github.com/can1357/oh-my-pi/pull/13149) by [@radkawar](https://github.com/radkawar))
- Fixed hashline `PUT N*` / `CUT N*` on the first statement of a block (for example a Go or Python function that opens with an `if`) also replacing or deleting every statement after it ([#13153](https://github.com/can1357/oh-my-pi/issues/13153), [#13154](https://github.com/can1357/oh-my-pi/pull/13154) by [@radkawar](https://github.com/radkawar))
- Fixed the `Full output: artifact://` link on large background bash and eval results pointing at a truncated copy with `[…elided…]` gaps instead of the complete output ([#13142](https://github.com/can1357/oh-my-pi/issues/13142), [#13143](https://github.com/can1357/oh-my-pi/pull/13143) by [@radkawar](https://github.com/radkawar))
- Fixed `grep` paths like `dir/*.go` also matching files in subdirectories of `dir` ([#13146](https://github.com/can1357/oh-my-pi/issues/13146), [#13150](https://github.com/can1357/oh-my-pi/pull/13150) by [@radkawar](https://github.com/radkawar))
- Fixed auto-compaction re-sending a failed native (server-side) compaction on every turn, re-reading the full context each time; after a failure a retry would repeat, the next configured method runs instead until a compaction succeeds ([#13310](https://github.com/can1357/oh-my-pi/pull/13310) by [@alphastorm](https://github.com/alphastorm))
- Fixed a `/slow off` session resending requests indefinitely when another session had activated the shared Anthropic low-priority lane ([#13340](https://github.com/can1357/oh-my-pi/pull/13340) by [@H4vC](https://github.com/H4vC))

Older entries are archived in [packages/coding-agent/CHANGELOG.md@04d4ab14b45f](https://github.com/can1357/oh-my-pi/blob/04d4ab14b45f8dbd4055b675519f8815a1eb1841/packages/coding-agent/CHANGELOG.md).
## [18.3.1] - 2026-09-25

### Added

- Added a filter to the Esc Esc rewind selector: press `f` and type to show only items containing every word, then Enter to rewind ([#13295](https://github.com/can1357/oh-my-pi/pull/13295) by [@H4vC](https://github.com/H4vC))
- Added native filesystem support for `local://` and `omp://` URLs across file-search, content-search, AST, shell, and related tools, including support for virtual working directories.
- Added a native `cp` builtin for filesystem copy operations.
- Added IDA Pro integration for opening executables and IDA databases, browsing pseudocode, assembly, imports, exports, strings, and cross-references, and performing database-aware actions such as renaming, commenting, type editing, function creation, saving, and persistent Python execution.
- Added shared, project-scoped IDA database access with broker-managed host processes, configurable concurrency and idle cleanup via `ida.maxOpen` and `ida.idleCloseSec`, automatic autosaving, and universal Mach-O architecture selection with `:@<arch>` syntax and host-architecture detection. IDA features can be configured with `ida.enabled`, `ida.python`, and `ida.installDir`.
- Added the `/slow [on|off|status]` command for opting into lower-priority service tiers on OpenAI, Google, and Anthropic subscription sessions, including automatic continuation when Anthropic session limits are reached.
- Added the `providers.openaiLiveSteering` setting to control whether input can be delivered while a response is in progress.
- Added session-wide approval for configuration changes through an `Always for this session` option in `cfg://` prompts, with clear timeout handling for unanswered prompts.
- Added the `cfg://` protocol and a configuration registry for reading, modifying, unsetting, and reactively managing layered agent settings with approval and precedence feedback.
- Added paged reading for large files, with metadata that allows clients to recover and continue displaying results.
- Added per-agent compaction thresholds for task and evaluation subagents, configurable as percentages or fixed token limits without changing the main session threshold.
- Added trusted additional context for extension and hook tool results, including `ctx.addAdditionalContext()`, allowing instructions to reach the model without altering displayed tool results.
- Added dictation support to `/btw` follow-up input.
- Added support for multiple simultaneous browser instances, including concurrent Chrome and Edge connections.
- Added detailed benchmark phases for measuring single-user throughput, parallel scaling, and prefill performance, with automatic prefill sizing based on model context limits.
- Added opt-in CUDA support to the Nix package for tiny-model inference through ONNX Runtime.
- Added reliable RPC prompt lifecycle reporting with `prompt_result`, structured provider errors, session-settled state, prompt identifiers, event filtering, and `--no-ui` support for non-interactive hosts.
- Added RPC session management through `open_session`, plus corresponding TypeScript and Python client APIs including `openSession`, `setEventFilter`, `onPromptResult`, `onSessionSettled`, and `waitForSettled`.
- Added `attachment://` and `conflict://` resource URL handlers.
- Added a per-server MCP `instructions: false` option to keep a server's guidance out of the system prompt while retaining its tools.
- Added stale tool-result eviction for advisors: before each review, an advisor replaces its own `read`/`grep`/`glob` output from reviews older than the latest one with a short placeholder, so it stops re-sending that output on every request. The deltas it reviews, the notes it wrote, and other tool results such as `recall` are never touched. Turn it off with `advisor.evictStaleResults` ([#13238](https://github.com/can1357/oh-my-pi/pull/13238) by [@alnaggar-dev](https://github.com/alnaggar-dev))

### Changed

- Improved recovery from output-length and context-window limits so truncated but actionable turns can be retained and retries are handled more accurately.
- Shortened the default system prompt by approximately 150 tokens while preserving its guidance.
- Improved Anthropic fallback handling so credit tokens and signed thinking context are preserved across same-provider fallbacks.
- Improved filesystem safety and path consistency across virtual URL protocols, including symlink and containment validation and correct Windows long-path reporting.
- Improved IDA database resource management with project sharing, bounded concurrency, idle cleanup, autosave, and clearer database status in listings.
- Improved runtime configuration behavior with type-safe layered settings, live updates, and safe sequential saves.
- Improved authentication and credential management to support live broker and credential-store changes.

### Fixed

- Fixed concurrent project access by enforcing file locking across processes.
- Fixed Windows file reads with line selectors such as `:1-40`.
- Fixed `omp update` and startup update checks to honor configured npm registries, including scoped registries and authentication tokens.
- Fixed invalid auto-QA grievance reports blocking the rest of the upload queue; rejected reports are now surfaced with the server error while other reports continue.
- Fixed advisor reviews making unnecessary follow-up requests, losing context after pruning, using the wrong thinking effort, or sending excessively large edit diffs.
- Fixed `/login` crashes in source-link and development installs after extension loading.
- Fixed retry fallback loops that could continue indefinitely when the fallback resolved to the same effective request.
- Fixed setup wizard detection for Gemini web search when Antigravity OAuth is active.
- Fixed headless print mode failing to complete an advisor review when a configured fallback reviewer was available.
- Fixed embedded shell startup when the inherited working directory had been deleted.
- Fixed Codex usage displays showing stale subscription plans and corrected usage views that combined separate quota limits.
- Fixed explicit model and provider selections bypassing `disabledProviders`; disabled providers are now refused and skipped during fallback.
- Fixed memory storage errors so failed items and underlying storage failures are identified.
- Fixed malformed user-level `mcp.json` files preventing valid MCP sources from loading.
- Fixed Anthropic server-side fallback requests using invalid model names.
- Fixed large-output model requests failing near the context limit by adjusting the output allowance to the remaining context.
- Fixed tool references in system prompts for tools exposed only through `xd://` devices.
- Fixed dictation remaining active after a recording restart during transcription.
- Fixed automatic account sign-outs going unannounced; sessions now report the affected account and login action through interactive, print, JSON, and RPC output.
- Fixed duplicate MCP tool listings in the system prompt.
- Fixed supervised service exits being missed or repeatedly replayed instead of being delivered to the session that started the service.
- Fixed memory backend failures to identify the affected item and underlying storage error.
- Fixed `write xd://<tool>` validation behavior so devices can return precise schema-mismatch responses.

## [18.3.0] - 2026-09-24

### Breaking Changes

- The `hub` tool is deprecated; use `wait`, `write`, and the `proc://` protocols instead.
- The `irc.timeoutMs` configuration setting has been removed.
- The edit mode syntax now uses `*** Edit File:`, `*** Find`, and `*** Replace` headers instead of `SM:` headers.
- Cancelling a process through `write` now requires an explicit `proc://<id>/kill` target; other write targets validate content normally.

### Added

- Added `omp://` documentation scopes for `find` and `omp find`. Search all embedded harness documentation with `omp://` or a specific document with `omp://<file>.md`; results are returned as canonical URLs that `read` can open, including range selectors.
- Added extension support for ephemeral, `/btw`-style side turns through `ctx.runEphemeralTurn()`, with optional tool suppression and output/context limits without adding the turn to session history.
- Added background job and service management through the `wait` tool and `proc://` URLs, including supervised services in `bash` and direct agent messaging through `agent://` write targets.
- Added `*** Insert Before` and `*** Insert After` edit operations for adding lines without replacing existing code.
- Added the `toks` command for offline token counting, including support for Jev (TypeSafe Jev 1.13) encodings.
- Added automatic discovery of Apple Foundation Models on supported Apple silicon devices.
- Added `/changelog last [N]` for viewing the latest release or a selected number of recent releases.
- Added terminal-based OAuth authentication with `omp login`, including browser-assisted login, account and organization details, and automatic model discovery refresh. Added provider support for `org-scoped-identity`, `oauth-token-env`, and per-account OAuth priority/reserve policies through `auth.accountPolicies`, with policy state shown by `omp usage`.
- Added the `daybreak` badge to `omp usage` for enabled accounts.
- Added `/export` and `/usage` to focused subagent views for exporting a focused transcript and viewing account usage without returning to the main session.
- Pasted clipboard images are now saved in the session artifact directory, allowing agents to read, copy, or upload them by file path.
- Added `/annotate` for attaching notes to diffs, replies, session messages, files, or quoted text and inserting or sending those notes in prompts and reviews.
- Added configurable MCP startup behavior through `MCP_STARTUP_TIMEOUT_MS`/`mcp.startupTimeoutMs` and `OMP_MCP_REQUIRE_READY=1`, allowing headless runs to require MCP servers to become ready before the first turn.
- Added native judgment usage reporting, including error stop reasons and messages, and added `openrouter/~typesafe/jev-latest` as a native judge candidate.

### Changed

- Session compaction now supports native Anthropic snapshot branches and rewinds.
- The default `bash.autoBackground.strategy` is now `catalog`.
- The `Launch` configuration group has been renamed to `Services`.
- Terminal OAuth behavior is now consistent between `omp login` and `omp auth-broker login`.
- Judgment fallback now uses only native candidates, preventing prompted models from replacing failed native judges.
- Browser screenshot comparisons now tolerate minor rasterizer differences.

### Fixed

- Fixed credential-aware API key resolution during authentication rotation.
- Fixed comma-separated line selectors in `read`, `grep` paths, and `fetch`; selectors now read the requested range, while a bare number selects only that line.
- Fixed `write` reporting JavaScript character counts instead of UTF-8 byte counts.
- Fixed background job and service status reporting, including incorrect durations, reused job IDs, stale logs after named-service restarts, and foreground calls incorrectly appearing as background jobs.
- Fixed `wait` and agent messaging so completed subagent results and peer messages are delivered reliably, including when a wait is interrupted by an incoming message.
- Fixed headless print mode dropping or silently ignoring MCP servers that start slowly; it now waits within the configured timeout and warns when a server is not ready.
- Fixed reader-mode `fetch` sending inline SVG icons and base64 images as unreadable model input; alt text is retained instead.
- Fixed long non-Latin judged TTSR output exceeding token limits by applying token-aware truncation.

## [18.2.11] - 2026-09-23

### Fixed

- Fixed nested `eval` Todo updates not being reflected by the Todo tracker, including cases where a cell fails after committing an update.
- Fixed strict-mode structured-output validation for JSON Schemas without a root `type`, preserving their `items` and `required` keywords.
- Improved streamed TTSR whole-buffer matching to avoid repeated scans from the beginning of the buffer.
- Fixed plural browser queries when compiled binaries provide shallow stack traces.
- Fixed browser `tab.fill` timing out on pages whose animation frames stall.
- Fixed the first LSP diagnostics request returning no results while a newly started language server is still analyzing.
- `/shake thinking` now reports the number of tokens freed.

## [18.2.10] - 2026-09-22

### Added

- Added live benchmark results table with real-time model ranking and per-kind performance metrics
- Added dedicated prefill throughput reporting for prefill-focused benchmarks
- Added `/record` slash command to capture terminal sessions as replayable `.ompcast` files
- Added `omp play` CLI for terminal-based playback of session recordings
- Added intent descriptions to judgment batching
- Added live progress tracking for judgment batches in the TUI

### Changed

- Refined AI-assisted git staging verification to reduce false positives
- Updated `omp bench` default profile to `chat` and improved CLI flag documentation
- Coalesced judgment batch drain operations for better performance under high load

Older entries are archived in [packages/coding-agent/CHANGELOG.md@d48cee7db400](https://github.com/can1357/oh-my-pi/blob/d48cee7db400d4ac0bb468c1e027f9990ac6f7ea/packages/coding-agent/CHANGELOG.md).
## [18.2.9] - 2026-09-22

### Added

- Added Claude saved resets to usage views and `/usage reset`, with automatic blocked-limit recovery and expiring-reset redemption controlled by `claudeResets`.
- Added support for searching embedded harness documentation with `find` and `omp find` using `omp://` scopes, including file-specific searches and `:start-end` selectors; results open directly through canonical `omp://` URLs.

### Changed

- Updated server-side fallback documentation and logic to target claude-opus-5-5
- Added support for claude-opus-5-5 to model priority registry
- Updated the read tool guidance to decode images inline by default and require an explicit `:img` selector for SVG rendering.
- Improved model discovery and fallback behavior: authentication failures are surfaced in the `/models` hub, and models without a matching role-specific fallback now use the default fallback chain.
- Improved resilience for subagents by retrying provider stream failures that occur after partial output and preserving configured ordered model fallbacks at startup.
- MCP OAuth with Google issuers now requests offline access so refresh tokens can be issued; repeated auth-broker token rotations also preserve the required refresh and client metadata.
- MCP servers from omp-plugins now expand `${CLAUDE_PLUGIN_ROOT}` and `${OMP_PLUGIN_ROOT}` in commands, arguments, and working directories.
- `/review` now uses the session's current working directory after `/move` or `/wt`.
- Pasted and dragged image files now retain their original filesystem paths so the agent can act on the source files directly.
- Custom sessions can now be moved across filesystems without losing transcripts or artifacts.
- `hub jobs` now returns a compact, non-consuming status summary instead of replaying completed output or consuming pending auto-delivery.
- The display-reset shortcut now works while the ask dialog has keyboard focus, and `tab.press()` provides a clear error for the legacy argument order.
- Wayland keyboard input now follows the compositor's active XKB layout instead of assuming a US layout.
- LSP diagnostics now refresh when watched files are created or deleted and after a server reload.
- Compiled bytecode binaries now start correctly when bundled dependencies use `import.meta.resolve`.

### Fixed

- Fixed JavaScript `eval` assignments in cells containing top-level `await` so they persist into subsequent cells.
- Fixed skill hints becoming out of sync with the active prompt after discarded rebuilds and in advisor sessions.
- Restored `pi.pi.askToolRenderer` for extensions that replace the built-in ask tool, preserving native rendering.
- Fixed npm plugin upgrades and reinstalls leaving stale or duplicate manifest entries that could break `bun install`.
- Fixed `eval` waits longer than approximately 24.8 days returning immediately because of native timer overflow.
- Fixed deleted sessions being resurrected from stale rewrite backups.
- Fixed `/collab` relay connections honoring `HTTPS_PROXY` and `NO_PROXY`.
- Fixed sessions remaining blocked by queued turns or Hindsight auto-recall after disposal or cancellation.
- Fixed edits to auto-generated files aborting the entire turn; they now return a tool-scoped error.
- Fixed Edit handling of invalid overlapping selections in multibyte text so the worker reports a match error instead of panicking.
- Fixed local memory consolidation on case-insensitive filesystems when project path casing changes between launches.
- Fixed first-time Xcode MCP connections on macOS by allowing the signed `omp` binary to request Apple Events permission.
- Fixed stale or duplicated TTSR trigger events during streaming.
- Fixed MCP OAuth credentials retaining their refresh endpoint and client metadata across repeated token rotations.
- Fixed local model and provider retry behavior for streamed and partially buffered failures.
- Fixed memory and session cleanup issues that could leave stale artifacts or inconsistent state.
- `lsp.formatOnWrite` now prefers a dedicated `isLinter` formatter server when a type-checker also claims the file ([#12847](https://github.com/can1357/oh-my-pi/pull/12847) by [@roboomp](https://github.com/roboomp)).
- `/extensions` no longer shows OMP-installed marketplace capabilities as disabled behind the foreign-plugin opt-in gate ([#12849](https://github.com/can1357/oh-my-pi/pull/12849) by [@roboomp](https://github.com/roboomp)).

### Removed

- Removed support for image query parameters (`?q=`) and bare image paths in the read tool.
- Custom models now honor provider-level `transport: pi-native` and send requests to the native gateway ([#12845](https://github.com/can1357/oh-my-pi/pull/12845) by [@joshrzemien](https://github.com/joshrzemien)).
- Fixed live models that match no `retry.fallbackChains` role primary (e.g. Fable after `/model`) resolving no chain, so a wait longer than `retry.maxDelayMs` aborted the session instead of walking `default` ([#12421](https://github.com/can1357/oh-my-pi/issues/12421)).
- Fixed skill hints drifting from the active prompt after discarded rebuilds or in advisor sessions ([#12148](https://github.com/can1357/oh-my-pi/pull/12148) by [@jerome-benoit](https://github.com/jerome-benoit)).
- Restored `askToolRenderer` on the extension namespace (`pi.pi.askToolRenderer`) after the pi-tui renderer migration dropped it, so extensions that shadow the built-in ask tool can keep the native rendering again. ([#12694](https://github.com/can1357/oh-my-pi/pull/12694) by [@xiechimon](https://github.com/xiechimon))
- Model discovery rejected with 401/403 now surfaces an authentication error in the /models hub instead of a silently empty model list. ([#12436](https://github.com/can1357/oh-my-pi/pull/12436) by [@xiechimon](https://github.com/xiechimon))
- Pasted or dragged image files now reach the agent with their original filesystem path, so it can read and act on the source file directly; clipboard screenshots keep working unchanged. ([#12404](https://github.com/can1357/oh-my-pi/pull/12404) by [@xiechimon](https://github.com/xiechimon))
- `/review` now runs VCS operations against the live session cwd after `/move` or `/wt` instead of the session-start checkout ([#12712](https://github.com/can1357/oh-my-pi/pull/12712) by [@F0Rextasy](https://github.com/F0Rextasy)).
- Reinstalling or upgrading an npm plugin no longer leaves stale or duplicate manifest edges that broke `bun install` ([#12727](https://github.com/can1357/oh-my-pi/pull/12727) by [@F0Rextasy](https://github.com/F0Rextasy)).
- TTSR now emits one `ttsr_triggered` event per streamed violation instead of one per evaluation pass ([#12729](https://github.com/can1357/oh-my-pi/pull/12729) by [@F0Rextasy](https://github.com/F0Rextasy)).
- Eval `wait()` timeouts above ~24.8 days no longer overflow the native timer and return immediately ([#12731](https://github.com/can1357/oh-my-pi/pull/12731) by [@F0Rextasy](https://github.com/F0Rextasy)).
- MCP OAuth against Google issuers now requests `access_type=offline` so refresh tokens are issued ([#12737](https://github.com/can1357/oh-my-pi/pull/12737) by [@F0Rextasy](https://github.com/F0Rextasy)).
- Deleting a session now also removes its stale `.bak` rewrite backups so the picker cannot resurrect it ([#12746](https://github.com/can1357/oh-my-pi/pull/12746) by [@F0Rextasy](https://github.com/F0Rextasy)).
- `/collab` relay WebSockets now honor `HTTPS_PROXY`/`NO_PROXY` like other transports ([#12762](https://github.com/can1357/oh-my-pi/pull/12762) by [@jacobcolyvan](https://github.com/jacobcolyvan)).
- `tab.press()` now rejects the inverted `press(selector, key)` call with a hint naming the corrected `(key, { selector })` form, instead of the key parser's opaque `Unknown key: <selector>` ([#12136](https://github.com/can1357/oh-my-pi/issues/12136)) ([#12266](https://github.com/can1357/oh-my-pi/pull/12266) by [@danilouchoa](https://github.com/danilouchoa)).
- The display-reset shortcut (`app.display.reset`, `alt+l` by default) now fires while the ask dialog holds keyboard focus, instead of being dropped silently; the #11215 global-listener promotion covered the other four editor display actions but missed this one ([#12217](https://github.com/can1357/oh-my-pi/issues/12217)) ([#12262](https://github.com/can1357/oh-my-pi/pull/12262) by [@danilouchoa](https://github.com/danilouchoa)).
- Custom sessions can move across filesystems without losing their transcript or artifacts ([#12360](https://github.com/can1357/oh-my-pi/issues/12360), [#12378](https://github.com/can1357/oh-my-pi/pull/12378) by [@Dante-dan](https://github.com/Dante-dan)).
- Fixed `hub jobs` replaying full output for every settled job and consuming pending auto-delivery; it now returns a compact non-consuming status summary ([#12547](https://github.com/can1357/oh-my-pi/pull/12547) by [@pedropaulovc](https://github.com/pedropaulovc)).
- Compiled bytecode binaries now start correctly when bundled dependencies use `import.meta.resolve` ([#12133](https://github.com/can1357/oh-my-pi/pull/12133) by [@andrebrait](https://github.com/andrebrait)).
- Subagents now retry provider stream errors that arrive after buffered partial output, and such failures are reported as transport errors instead of schema-invalid results ([#12752](https://github.com/can1357/oh-my-pi/pull/12752) by [@bse-ai](https://github.com/bse-ai)).
- Edits targeting auto-generated files now return a tool-scoped rejection instead of aborting the whole turn ([#12499](https://github.com/can1357/oh-my-pi/pull/12499) by [@Dante-dan](https://github.com/Dante-dan)).
- Subagents with an ordered model fallback keep it reachable on startup when the parent default role shares the same primary model ([#12377](https://github.com/can1357/oh-my-pi/pull/12377) by [@Dante-dan](https://github.com/Dante-dan)).
- omp-plugins MCP servers now substitute `${CLAUDE_PLUGIN_ROOT}`/`${OMP_PLUGIN_ROOT}` in `command`, `args`, and `cwd` ([#12801](https://github.com/can1357/oh-my-pi/pull/12801) by [@holny](https://github.com/holny)).

## [18.2.8] - 2026-09-21

### Added

- Added comprehensive browser automation tools for accessibility auditing, React inspection, console and network monitoring, performance tracing, semantic DOM queries, tab management, screen recording with cursor overlays, downloads, custom initialization scripts, persistent storage, and WebMCP cross-frame tool discovery.
- Added support for buffered cloud transcription with OpenAI-compatible models.
- Added visual change detection for video processing, including FFMPEG analysis and SVG overlays.
- Added support for declaring native judges through custom providers using the `typesafe` and `openrouter-decisions` API values, with configurable base URLs, API keys, and headers.

### Changed

- Expanded browser security and resilience controls with configurable HTTPS error handling, domain allow-listing, and automatic tab recycling when security-sensitive state changes.
- Updated background job notifications to deliver output as follow-up messages and discourage unnecessary polling.
- Expanded the bash tool's documented auxiliary utilities and removed its truncation footer notice.

### Fixed

- Improved responsiveness in long sessions by significantly reducing the time required to scan provider context for credential patterns.
- Fixed native judges failing to honor configured request headers, enabling authenticated and header-routed judge providers to work as configured.
- Fixed LSP requests hanging when aborted while waiting for an earlier write to complete.

## [18.2.7] - 2026-09-21

### Breaking Changes

- Image-generation overrides now use model selectors, and web-search CLI overrides use --model instead of --provider.
- Removed the bash tool's env parameter.
- Eval judge(state, questions) is now awaited and returns answers directly; JudgmentHandle and judgment support in wait() have been removed.

### Added

- Added `find` tool for semantic workspace searching, allowing agents to locate behaviors and symbols using natural language
- Added `find` CLI command for performing semantic workspace searches
- Added batch evaluation with judge_batch(states, questions) / judgeBatch(...), including bounded background execution, incremental result and status access, per-item failure reporting, and the ability to wait for or reattach to jobs across turns or after a reset.
- Added the jevify magic keyword to have the agent establish an evaluation rubric before classifying bulk items and inspect only items flagged by the judge.
- Added omp web-search as an alias for omp search.
- Added tui.titleSpinner configuration to select the terminal-title working-state spinner (braille, dots, or line).
- Added Handlebars-based system prompt templates through SYSTEM_TEMPLATE.md, --system-prompt-template, and the SDK, with access to live settings and tool data.
- Added configurable image, web, speech, dictation, judge, and memory model roles with ordered fallbacks, legacy backend-setting migration, and omp models --kind filtering.
- Added native OpenRouter image generation, model-selected web-plugin search, and live discovery of TypeSafe judge models.

### Changed

- Updated agent system prompts to prioritize the `find` tool over `grep` and `glob` for behavioral lookups
- Refined system prompt instructions for XML tag handling and agent persona
- Updated sloppy edit tool syntax to use plain text headers instead of XML tags
- Improved startup performance by validating provider-qualified model selectors against only the relevant provider catalog.
- Reduced launch time for npm and compiled builds by embedding the model catalog more efficiently.

### Fixed

- Fixed system prompt configuration validation so systemPromptTemplate and customSystemPrompt cannot conflict with a full systemPrompt replacement, including when values are empty.
- Added browser-relay support for listing eligible pages without attaching to or claiming them.
- Fixed Codex compatibility with the sloppy edit tool.
- Capped concurrent eval judge and completion requests to prevent large fan-outs from overwhelming judge and fallback models.
- Temporarily avoids retrying judgment requests with credentials that recently failed due to authorization or billing errors.
- Fixed image and speech fallback models disappearing after discovery and eliminated incorrect incompatibility warnings for providers without credentials.
- Fixed resume and continue flows to hide empty sessions.
- Fixed edit operations that could loop after empty insertions or fail on Unicode no-op and overlapping duplicate matches.
- Fixed live subagent messages being delayed by agent discovery and roster discovery looping on dot-named transcripts.
- Fixed llama.cpp discovery and routing for PrismML Bonsai 2 27B GGUF models, including support for cached models and the Qwen 3.8 thinking-level ladder.

## [18.2.6] - 2026-09-18

### Fixed

- Fixed clipboard paste stalling on an empty clipboard; image and text clipboard reads now run concurrently so the empty-clipboard status surfaces after the slower read instead of the sum of both.
- Fixed memory recall blocks carrying a minute-resolution `Current time` stamp that dirtied the cached system prompt on every refresh; recall rows already carry dates, so the stamp is removed.
- Fixed `omp auth-broker token` and `omp auth-gateway token` exiting silently without creating a token on Windows when no token file exists yet; token and config reads now use `node:fs` instead of `Bun.file`.

## [18.2.5] - 2026-09-17

### Breaking Changes

- Moved terminal UI modules—including themes, tool renderers, chat, overlay, status-line, composer, setup wizard, and Git/PS/debug apps—to `@oh-my-pi/pi-tui`. The corresponding `@oh-my-pi/pi-coding-agent` subpaths no longer exist; names re-exported from the package root remain unchanged.

### Added

- Added `omp stream` for livestreaming terminal sessions at `live.omp.sh/<your Stencil username>`, with viewer chat, pane-per-session display for sessions in the same directory, screen redaction, and configurable `stream.serverUrl` and `stream.redactPatterns` settings. Use `--server` to override the stream server, `--title` to set a title, and `--no-tui` to retain the line-based log interface.
- Added Stencil account support to `/login`. `omp stream` uses a signed-in Stencil account or `STENCIL_API_KEY` for channel ownership and authentication. Sensitive environment, dotenv, `secrets.yml`, credential-shaped, and configured pattern-matching values are redacted before screen data is transmitted.
- Added faster keyless web search fallback by prioritizing the default keyless Parallel provider ahead of Perplexity.

### Changed

- Improved parent IRC message prompts to make interruption handling more reliable.
- Improved subagent task labels and plan filenames to use concise, action-oriented descriptions.
- Updated CLI byte sizes to use decimal KB units and made duration displays coarser and easier to read.

### Fixed

- Fixed `edit` auto-repair waiting up to 60 seconds when the `smol` model does not respond; it now times out after 20 seconds and reports repair start and timeout details.
- Fixed subagents leaving queued parent messages behind after tool interruptions.
- Fixed a subagent burning its whole run on `yield` calls that never finish it: an incremental-only `yield` turn no longer bypasses the request budget, and the forced final `yield` ends the run ([#12351](https://github.com/can1357/oh-my-pi/pull/12351) by [@pedropaulovc](https://github.com/pedropaulovc)).
- Fixed `browser.open({ app: { relay: true } })` waiting for the full tool timeout when no relay extension is installed or reachable; it now fails promptly with an actionable error while preserving the wait for a connected extension to recover.
- Fixed `edit` handling of ellipsis markers, inline closing tags, copy-ready corrections, and retries, including cases that could insert literal markers, misreport matches, omit the file target, or panic.
- Enabled `edit.enforceSeenLines` by default to reject hashline edits anchored to content that was not displayed, and prevented stale-tag recovery from applying edits to a structurally different duplicate construct ([#12369](https://github.com/can1357/oh-my-pi/pull/12369) by [@pedropaulovc](https://github.com/pedropaulovc)).
- Fixed startup failures when the plugins directory or its manifest cannot be read; inaccessible plugin roots are now skipped with a warning.
- Fixed generation token-rate displays for subagents and restored the main session's reading after switching focus.
- Fixed subagent HUD labels and plan filenames being populated with example prompt text on smaller models.
- Improved shell, file, session, and persistence operations to avoid unnecessary repeated work, improving responsiveness and resource usage.

## [18.2.4] - 2026-09-17

### Added

- Added an optional live generation speed readout via `composer.tokenRate`, showing smoothed tokens-per-second output in the working row and keeping the rate visible between turns.
- Added TypeSafe provider support through `/login typesafe` or `TYPESAFE_API_KEY`. TypeSafe can power thinking-level detection, unexpected-stop detection, and AI-assisted git staging with calibrated judgment probabilities; configure `providers.judgmentProvider` as `auto`, `typesafe`, or `llm` to select the judgment backend.
- Added the `judge(state, questions)` evaluation helper for Python and JavaScript cell code, supporting typed choice, boolean, and score judgments. It returns a handle whose `.wait()` method provides answers and probabilities, using TypeSafe when configured and available or a fallback chat model otherwise.

### Changed

- Unified thinking-level detection, unexpected-stop detection, and AI-assisted staging around a shared judgment system with automatic fallback across configured models when TypeSafe is unavailable or cannot complete a request. AI-assisted staging now evaluates files as a single batched judgment while preserving one yes/no decision per file.

## [18.2.3] - 2026-09-17

### Breaking Changes

- Config-backed headers now resolve asynchronously through `ModelRegistry.getProviderHeaders()` or `resolveModelHeaders()`; removed the synchronous `config/model-config-values` module.
- Removed the unused `ConfigFile.getMtimeMsAsync()`, `tryLoadAsync()`, `loadAsync()`, and `loadOrDefaultAsync()` methods.
- Custom SQL session clients must support transactions for atomic renames.

### Added

- Type `^` to tag a model for delegation, with atomic display-name chips and session-persisted `m1`, `m2`, … agents available to task and eval.
- Provider login and setup support masked secret prompts; RPC rejects secret prompts rather than requesting ordinary input.

### Changed

- Shell-backed API keys and headers resolve asynchronously without freezing terminal input or running during catalog construction.

### Fixed

- macOS process discovery now retains the complete PID list when locating executables and descendants. ([#12290](https://github.com/can1357/oh-my-pi/pull/12290) by [@iliaal](https://github.com/iliaal))
- Reduced snapshot-recording stalls when a session retains large file histories. ([#12279](https://github.com/can1357/oh-my-pi/pull/12279) by [@iliaal](https://github.com/iliaal))
- Cancelled background jobs remain tracked until execution finishes, so cleanup cannot report completion prematurely after retention expires. ([#12278](https://github.com/can1357/oh-my-pi/pull/12278) by [@iliaal](https://github.com/iliaal))
- Fixed localized edits rewriting unrelated bytes in files with invalid UTF-8; these edits now fail without modifying the file. ([#12277](https://github.com/can1357/oh-my-pi/pull/12277) by [@iliaal](https://github.com/iliaal))
- Fixed sloppy edits crashing with a char-boundary panic instead of reporting a match error when the file contains multibyte (e.g. CJK) text.
- Fixed retry timing reliability in agent sessions by ensuring sleep durations are monotonic
- Fixed data stability issues when processing streamed lines
- Resolved same-path move failures in indexed session storage
- Restricted and revived subagents retain parent-loaded extension hooks without enabling extension-contributed tools.
- Revived subagents honor the owning session's extension-discovery restrictions.
- Secret login answers stay hidden in later prompts and cannot be recovered through undo or yank.
- SQL session renames preserve data on same-path moves, missing sources, and failed overwrites.
- MySQL session writes no longer use deprecated upsert value references.
- MCP SSE requests honor one response deadline and report timeouts correctly without replaying accepted tool calls.
- Legacy extension package-import patterns follow native prefix precedence.
- Bundled extensions observe theme initialization and changes through the existing live `theme` export.
- Configured discovery models retain request-time credentials after offline cache reloads and failed refreshes.
- Runtime API-key overrides retain precedence over configured credentials.
- Element handles returned by `tab.waitForSelector`, `tab.$`, and related selector helpers can now be passed as arguments to `tab.evaluate` inside `tab.run` instead of failing with "JSHandles can be evaluated only in the context they were created".

## [18.2.2] - 2026-09-16

### Added

- Expanded built-in secret obfuscation to detect credentials in connection URLs regardless of environment-variable name, including PostgreSQL, MongoDB, MySQL, Redis, AMQP, and other supported schemes.
- Expanded built-in secret obfuscation to cover AWS access keys, Google API keys, Slack, npm, Stripe secret/restricted keys and webhook secrets, Hugging Face and SendGrid tokens, JWTs, Bearer tokens, and PEM private keys.
- Added the `tui.titleSpinner` setting to choose the terminal-title working-state animation (`braille`, `dots`, `line`, or `pulse`), alongside the existing `tui.titleState` toggle.

### Changed

- Session-stop hooks that block with a reason now keep the session running until they allow it or the user interrupts; explicit aborts are no longer restarted by a stop hook.
- Corrupt agent and prompt-history databases are now backed up before fresh stores are created, allowing startup to continue; credentials may need to be entered again.
- Agent and history database startup errors now identify the affected database file.
- Terminal-title spinner animations now work on native Windows; WSL retains the static separator to avoid unnecessary CPU usage.
- Explicit model refreshes now re-evaluate command-backed API keys and headers, allowing rotated credentials to take effect without restarting.
- Background job entries are removed shortly after their results are consumed or recovered, while unconsumed jobs remain available for inspection.

### Fixed

- Fixed the transcript collapsing into a compact no-spacing layout whenever the prompt, todo HUD, or other below-transcript chrome grew a few rows; the live tail now scrolls off the top instead.
- Fixed transcript layout and rebuilding issues that could collapse blank rows, leave tool calls displayed on one line, or show stale fragments after navigation, display changes, or compaction ([#12177](https://github.com/can1357/oh-my-pi/pull/12177) by [@shivamklr](https://github.com/shivamklr)).
- Fixed the `security-reviewer` agent so valid findings with anchors and remediation details are accepted.
- Stopping a subagent from Agent Hub now settles and reports its parent background job instead of leaving `hub wait` blocked indefinitely.
- Fixed prewalk handoff detection after edits or writes dispatched through Code Mode eval cells.
- Reduced main-thread stalls while streaming large edits by deferring AST-based matching until the edit is complete.
- Corrected the `/handoff` description so it accurately reflects that the command creates a handoff document and compacts the current session.
- Deferred misleading cold-cache `retry.fallbackChains` warnings until provider discovery completes.
- Fixed `--prewalk-into @default` so an explicitly selected startup model does not replace the configured default role, including ordered fallbacks and discovery-backed candidates.
- A corrupted or externally modified session file no longer leaves the session impossible to close; a subsequent Ctrl+C exits without rewriting the session log.
- Fixed silent MCP requests being terminated by an undeclared idle timeout; closing a legacy SSE connection now also cancels pending requests and notifications.
- Fixed browser reuse for Chromium installed behind Linux wrapper scripts and prevented duplicate launches when a profile is locked ([#12236](https://github.com/can1357/oh-my-pi/pull/12236) by [@shivamklr](https://github.com/shivamklr)).

Older entries are archived in [packages/coding-agent/CHANGELOG.md@1e3cc3ab94d0](https://github.com/can1357/oh-my-pi/blob/1e3cc3ab94d05617e79fb12d95711d58161747d3/packages/coding-agent/CHANGELOG.md).
## [18.2.1] - 2026-09-15

### Breaking Changes

- Renamed the `/drop` slash command to `/delete` so that "drop" is no longer overloaded between deleting the session and dropping a goal (`/goal drop`).
- Read tool results no longer duplicate the body in `details.truncation.content`; use result `content` or `details.displayContent` instead. ([#11255](https://github.com/can1357/oh-my-pi/pull/11255) by [@jiwangyihao](https://github.com/jiwangyihao))
- Removed the `DEL`, `DEL.BLK`, `COPY`, and `COPY.BLK` hashline edit operations. Use `CUT` / `CUT.BLK` for deletion; removed content remains available to `PASTE`.
- Changed tab.screenshot() to no longer accept a per-call save path; it now saves screenshots under browser.screenshotDir (or the OS temp directory if unset) and returns the saved path.

### Added

- Added keyless Parallel web search when the provider is explicitly selected ([#9770](https://github.com/can1357/oh-my-pi/pull/9770) by [@georgeatparallel](https://github.com/georgeatparallel)).
- Sloppy edits support `<SM:AFTER>` to insert new lines after an anchor without repeating or replacing it.
- Fixed eligible full OpenAI Responses request-body timeouts by retrying once after conservative local tool-result elision, while preserving assistant/user history, unsafe partial output, and existing stateful retries ([#11878](https://github.com/can1357/oh-my-pi/pull/11878) by [@hellofrommorgan](https://github.com/hellofrommorgan)).
- User append instructions (`APPEND_SYSTEM.md`, `--append-system-prompt`) now render under their own `## User Instructions` heading whenever generated blocks precede them, instead of trailing the `## MCP Server Instructions` section and reading as server-supplied, unverified content ([#11832](https://github.com/can1357/oh-my-pi/pull/11832) by [@iacore](https://github.com/iacore)).
- Prewalk now arms for a hand-off target served by a `models.yml` `discovery:` provider (e.g. `openai-models-list`): `buildSessionOptions` runs a cache-aware refresh for the provider named by the selector and retries, instead of disabling prewalk with a `Model "…" not found` warning for ids `omp models` lists ([#11820](https://github.com/can1357/oh-my-pi/issues/11820)).
- Non-throwing tool failures now retain their error status through extension result rewrites and eval-defined subagent tools ([#11585](https://github.com/can1357/oh-my-pi/issues/11585)).
- Session rewrites now refuse to replace a file changed by another process, preserving durable turns from concurrent terminals ([#11496](https://github.com/can1357/oh-my-pi/issues/11496)).
- Goal mode now idles after repeated continuations return identical tool evidence instead of re-waking indefinitely ([#11819](https://github.com/can1357/oh-my-pi/issues/11819)).
- Cycling models with Ctrl+P no longer injects a spurious tool-roster notice that made the model believe still-callable tools had been removed; a prompt rebuild now discards the queued delta it already reflects ([#11824](https://github.com/can1357/oh-my-pi/issues/11824)).
- Subagent `yield` no longer fails a run with `SYSTEM WARNING: Subagent called yield with null data.` when a data-less `useLastTurn` finalize (e.g. `{type:"result"}`) lands on a thinking-only turn with no text; the tool now rejects it at the boundary so the child is reminded to resubmit with `data` ([#11150](https://github.com/can1357/oh-my-pi/issues/11150)).
- `--continue` no longer treats a merely-missing breadcrumb cwd as a project move. Re-root now requires the continue directory to be the same device+inode the breadcrumb recorded (`git worktree move` / same-filesystem `mv`). A cross-filesystem `mv` (copy+unlink, new inode) is intentionally not re-rooted: the session stays in the original bucket, `header.cwd` is not rewritten, and a warn is logged ([#11565](https://github.com/can1357/oh-my-pi/issues/11565)).
- Cold-revived persisted subagents now anchor wake-turn artifacts to their own transcript directory rather than the live root session's, so nested-depth and post-`/new` revivals no longer write `<id>.md` outside the revived agent's tree ([#11563](https://github.com/can1357/oh-my-pi/issues/11563)).
- Legacy `settings.json` → `config.yml` migration now writes the YAML first and only then archives the JSON, surfaces failures instead of swallowing them, and recovers from an orphaned `settings.json.bak` when `config.yml` is missing ([#11569](https://github.com/can1357/oh-my-pi/issues/11569)).
- Legacy `settings.json` → `config.yml` migration now writes the YAML first and only then archives the JSON, and surfaces failures instead of swallowing them ([#11569](https://github.com/can1357/oh-my-pi/issues/11569)).
- MCP server names may now contain spaces, so human-friendly display labels like `MaaS Slack` survive `/mcp reauth` write-back instead of being rejected by the config writer ([#11731](https://github.com/can1357/oh-my-pi/issues/11731)).
- File paths in the compact grouped `Read (N)` tree are now clickable OSC 8 hyperlinks, matching standalone Read rows; delimited reads carry a resolved link target per row so both live output and rebuilt transcripts link correctly ([#11732](https://github.com/can1357/oh-my-pi/issues/11732)).
- Added server-name autocomplete for `/mcp` commands (`enable`, `disable`, `test`, `remove`, `reconnect`, `reauth`, `unauth`) using configured and runtime-discovered MCP servers.
- Added `CUT` and `PASTE` ops to the hashline edit tool for moving code without retyping it: `CUT N.=M` (and `.BLK` block forms) capture lines into a clipboard register, and `PASTE` operations insert them. The register flows across sections within a patch (cross-file moves) and persists across edit calls per session.
- Added `--from-claude` and `--from-codex` session imports (including compaction state for Codex), also available from `/resume @claude` and `/resume @codex`.
- Added interactive Exa API-key onboarding through `/login exa`, opening the official key dashboard and saving pasted keys for authenticated web search while preserving `EXA_API_KEY` and explicit-selection public MCP fallback behavior ([#1798](https://github.com/can1357/oh-my-pi/issues/1798)).
- Added `ExtensionContext.getAsyncJobSnapshot()` so extensions can read the owning session's async-job state without relying on process-global job-manager identity
- Added opt-in `tui.codexResetFireworks` celebrations for unscheduled Codex weekly usage resets and newly banked saved resets, shown in a theme-aware top-third modal until Escape ([#6858](https://github.com/can1357/oh-my-pi/pull/6858) by [@joshrzemien](https://github.com/joshrzemien)).
- The Cursor exec bridge serves the seven modern Pi tool frames, mapping each to its local equivalent: `pi_read`/`pi_ls` → `read`, `pi_bash` → `bash`, `pi_edit` → `edit`, `pi_write` → `write`, `pi_grep` → `grep`, and `pi_find` → `glob`. The frames are a separate wire family from the legacy args, not aliases, so each mapping is a real translation — `pi_grep`'s `ignore_case` is the inverse of the local tool's case-sensitivity flag, `pi_find` searches filenames rather than contents, and `pi_edit`'s replacements are renamed to the local snake_case pairs.
- `providers.autoThinkingMaxEffort` (`xhigh` | `max`, default `xhigh`) raises the ceiling of the `auto` thinking classifier. `max` became a first-class effort tier after the classifier prompt was written, so `auto` could never reach it on models that expose the tier — only the `ultrathink` keyword could. Opting in adds `max` to the classifier's vocabulary, gated on the target model actually supporting it; the default keeps today's prompt byte-for-byte. The ceiling is enforced inside the effort clamp rather than on the classifier's answer, so a sparse ladder cannot snap an excluded request back up, and the Low floor is still resolved against the model's own ladder. The on-device 3-bucket classifier stays capped at `xhigh` regardless of the setting. The ceiling governs what `auto` resolves: a ladder with nothing underneath it yields no auto level, and a `thinking.requiresEffort` model still gets its lowest supported effort from the transport.
- Added omp cleanse, a new command that automatically detects language-ecosystem checkers, parses diagnostics (such as Cargo Clippy JSON), distributes repair workloads across concurrent subagents, and runs verification checks with a live progress bar.
- Added the bundled `ts-no-local-is-record` TTSR rule, which catches local `isRecord` function and lambda definitions and directs agents to shared guards plus explicit shape validation.
- A `tool_call` handler (extension or hook) can now return `input` to revise the arguments a tool executes with, not just `block` it. The returned object is the raw execution input passed to the tool (ignored when `block` is set, and not applied to `computer` tool calls), enabling wrappers that normalize or rewrite a built-in's arguments without reimplementing the tool. For model-issued calls the event fires at arg-prep time in the agent loop, so a revision is revalidated against the tool schema and is what concurrency scheduling, `tool_execution_start`/transcripts, the persisted assistant message, and the approval gate all observe — the user approves exactly what runs, and a revision that changes a tool's functional concurrency (e.g. bash `pty`) schedules correctly. A revised nested `write xd://` device dispatch forfeits the outer write gate's approval and faces the full prompt again ([#6681](https://github.com/can1357/oh-my-pi/pull/6681) by [@psyrendust](https://github.com/psyrendust)).
- Added a parser for macOS `sample`(1) call-tree reports to the read tool: `*.sample.txt` reads now return a compact bottleneck summary — per-thread hot paths with on-CPU sample counts (blocked syscall time excluded), demangled Rust v0/legacy symbols, flattened direct recursion, merged call-site siblings, idle-thread classification, and a process-wide top-functions-by-self-samples table. `:raw` still reads the original report, and files that merely carry the extension fall back to plain text.
- Added V8 `.cpuprofile` support to the read tool (Node/Bun `--cpu-prof`, Chrome DevTools, CDP `Profiler.stop` output): reads now return a compact bottleneck summary — hot-path call tree with on-CPU milliseconds (`(idle)` time excluded), collapsed pass-through chains, flattened direct recursion, shortened file URLs, and a top-functions-by-self-time table. `:raw` still reads the original JSON, and files that merely carry the extension fall back to plain text.
- Added separate Advisor cost visibility to the status line, rendering primary and Advisor spend as `$2.67 (sub) + $0.41 (adv)` while keeping already-incurred Advisor cost across runtime disablement and same-session history rewrites.
- Added a configurable per-request timeout for the `inspect_image` tool (`inspect_image.timeoutMs`, default 5 minutes; set to 0 to disable) so a stalled vision-model provider fails fast with a clear error instead of blocking until manual abort ([#4165](https://github.com/can1357/oh-my-pi/issues/4165)).

### Changed

- Eval status rows for `browser`/`computer` calls now say what happened (`open main https://…`, `main.id(5).click()`, `close all`) with a globe/computer icon instead of a bare `browser` label; preludes with nothing to show record no row, while failures still surface.
- Codex Spark, all MiniMax models, and GLM-5.3-Flash now default to replace edits instead of hashline; explicit edit-mode overrides remain honored.
- Storage maintenance streams large session journals and gzip archives instead of loading complete files into memory.
- Long sessions spend less time checking retired transcript blocks on each frame.
- An extension-originated message that starts no agent turn (e.g. an idle steer superseded by a concurrent turn) no longer crashes a headless `--mode rpc` session with an unhandled rejection ([#11654](https://github.com/can1357/oh-my-pi/pull/11654) by [@sjawhar](https://github.com/sjawhar)).
- Fixed reconnecting to a collab session while a tool was still running sometimes leaving its spinner animation active for the rest of the process ([#9377](https://github.com/can1357/oh-my-pi/pull/9377) by [@sjawhar](https://github.com/sjawhar)).
- Reduced startup memory and latency when initializing memory with large session histories by reading only session header metadata instead of loading entire transcripts into memory.
- A revived subagent whose wake turn fails, is cancelled, or produces no output now relays a distinct notice (with the attributed `[provider/model]` error and a `history://<id>` pointer) to whoever woke it, so a `hub send await:true` waiter learns why there is no answer instead of a generic "stopped without replying" ([#11290](https://github.com/can1357/oh-my-pi/issues/11290)).
- Orchestrators now verify with project-appropriate checks instead of Bun-specific commands, so non-Bun projects are no longer told to run a checker they do not have ([#10985](https://github.com/can1357/oh-my-pi/issues/10985)).
- Fixed long streamed replies being clipped to the live viewport until the turn ended; finished lines now retire into terminal scrollback while the response is still streaming. Models whose wire can revise text it has already streamed (`stream-revision`) keep the old behaviour ([#11276](https://github.com/can1357/oh-my-pi/issues/11276)).
- Prevent undeclared process-executing `hub` tool injection into read-only subagents ([#11044](https://github.com/can1357/oh-my-pi/pull/11044), closes [#10257](https://github.com/can1357/oh-my-pi/issues/10257)).
- Reduced resume memory use by resolving persisted snapcompact frames only when they are included in the rebuilt context ([#10227](https://github.com/can1357/oh-my-pi/pull/10227) by [@lemonleks](https://github.com/lemonleks)).
- Improved grouped read-call layout by nesting each request's usage metrics beneath its final path.
- Improved turn recovery to prevent duplicate output streaming during credential rotation or model fallback when visible text has already been streamed.
- Optimized tool guidance for bash, grep, and glob to be more concise while clarifying shell boundaries and search timeouts.
- Optimized models configuration resource probing to run in a single child process, reducing startup contention.
- Startup release notes now default to a compact change-count summary. Use `startup.changelogMode` (`summary` | `expanded` | `hidden`) to control them; legacy `collapseChangelog` choices migrate automatically ([#6771](https://github.com/can1357/oh-my-pi/issues/6771)).
- Reworked the /guided-goal command from a modal-based popup flow into a natural, conversational chat interface where the agent asks follow-up questions directly in the session.
- Reduced startup memory usage by lazy-loading HTML session export assets only on their first use.
- Direct and `xd://` dispatch now share one canonical tool map: `write xd://<tool>` executes any enabled top-level or mounted tool, and `read xd://<tool>` returns its docs, instead of failing when the name was exposed through the other layer. Mounted names are presentation metadata only, so tool replacement and disconnection cannot leave stale device instances; disabled tools remain unreachable, and both `xd://` and Cursor/top-level fallback execution retain the tool's approval and ACP permission gates.
- Session listing now caches parsed headers keyed on file stat identity (mtime + size), so repeated resume-picker opens and startup scans re-read only changed session files
- Reduced per-keystroke editor dispatch overhead: keybinding resolution happens once per input chunk and the per-action interception chain is gated behind a single canonical-key set probe
- `xd://` device docs now render the parameter schema as a comment-annotated TypeScript type (via `jsonSchemaToTypeScript`, the same renderer the in-band tool inventory uses) instead of a raw JSON Schema dump, shrinking system-prompt device sections while keeping descriptions inline.
- Added a `/vision [on|off|auto|status]` slash command for session-scoped control of the `inspect_image` vision-delegation tool, modeled on `/computer`: `on`/`off` force the tool for the current session only, `auto` returns to the persisted setting, and `status` reports the effective mode, session override, tool state, and active-model image capability.
- Replaced the `inspect_image.enabled` boolean with the tri-state `inspect_image.mode` (`auto`|`on`|`off`, default `auto`). In `auto` the tool is registered only when the active model lacks native image input, so vision-capable models (e.g. `kimi-code/k3`) read images inline with their own capabilities instead of delegating to a separate vision model; the tool set is re-evaluated on every model switch with a status notice when it flips. The `read` tool now follows the effective state dynamically rather than the raw setting, so it returns decoded image blocks again whenever `inspect_image` is hidden. Existing `inspect_image.enabled: true/false` configs migrate to `inspect_image.mode: on/off`.
- Made the task tool's per-spawn `effort` parameter opt-in through `task.enableEffort`, which defaults to false and omits the field from flat and batch schemas and tool guidance until enabled.
- Reduced terminal-title update overhead by deduplicating unchanged titles on every platform and using `SetConsoleTitleW` through `bun:ffi` instead of OSC writes on Windows. Windows working titles now keep a static `:` separator instead of scheduling spinner updates; other platforms retain the animated separator.
- Added `task.maxEffort` to cap the task tool's optional per-spawn effort hint after model-specific resolution, so operators can enable effort hints without allowing them to exceed a configured ceiling; the ceiling now also rides into the spawned session so retry-fallback model swaps re-clamp to it instead of escalating past the cap ([#6580](https://github.com/can1357/oh-my-pi/issues/6580), [#6794](https://github.com/can1357/oh-my-pi/pull/6794) by [@wolfiesch](https://github.com/wolfiesch)).
- Restructured the steering/interjection envelope sent to the model: the injected `<user_interjection>...<message>...</message>...` wrapper around user text is now a `<system-notice>` explaining the interjection followed by the user's raw message unwrapped, matching the existing `<system-notice>`/`<system-directive>` convention instead of nesting the literal message inside its own tag pair, which some models found confusing.
- Reduced default startup resident memory by constructing the default-off ComputerTool ArkType schema only on first parameter access, then reusing it across tool instances without changing validation or tool behavior ([#6742](https://github.com/can1357/oh-my-pi/pull/6742) by [@usr-bin-roygbiv](https://github.com/usr-bin-roygbiv)).
- Reduced startup CPU and memory by loading the bundled changelog only when needed, while preserving source, npm bundle, standalone binary, and native absolute-path fallback resolution.
- Moved PTY log replay into the shared project launch broker, so normal CLI and Hub startup no longer load the xterm runtime while launch logs return validated rendered terminal rows.

### Fixed

- Late non-blocking advisor notes arriving while a terminal primary turn unwinds now stay visible as advisor cards instead of starting an extra primary request ([#12154](https://github.com/can1357/oh-my-pi/pull/12154) by [@korri123](https://github.com/korri123)).
- Fixed Perplexity sign-in for SSO-only accounts in `/login` and the setup wizard with isolated browser sign-in and automatic session capture, supporting both secure-prefixed and unprefixed session cookies without manual cookie copying. ([#12064](https://github.com/can1357/oh-my-pi/pull/12064) by [@lance0](https://github.com/lance0))
- Mid-run compaction no longer sends the pre-compaction history to the next provider call when the live message array is rewritten in place.
- Collab guests now receive the host's goodbye even when the relay closes the room right behind it, and a fully sent snapshot no longer holds later frames behind transport backpressure.
- Fixed standalone `omp read skill://<name>` failing with `Unknown skill` by discovering configured skills before resolving the URI ([#10961](https://github.com/can1357/oh-my-pi/issues/10961)).
- Subagents no longer remain `running` after their final result is accepted; a finished run reaches a terminal state without the parent having to send a status message ([#11079](https://github.com/can1357/oh-my-pi/issues/11079)).
- Fixed `/loop` never resubmitting after a `/skill:<name>` prompt: the loop prompt is now captured for skill invocations, and resubmitted skill prompts are dispatched the same way the composer sends them instead of as literal text.
- `/force:<tool>` now reports that the current model cannot force a tool on hosts that only accept automatic tool selection (Meta Model API, Muse Code), instead of announcing a forced turn that the request silently drops ([#11635](https://github.com/can1357/oh-my-pi/pull/11635) by [@quantmind-br](https://github.com/quantmind-br)).
- Fixed isolated subagent spawns exhausting host memory when the checkout's staged or unstaged diff is huge (for example a jj conflict commit exported to git); the spawn now fails with the isolation-budget error instead ([#11454](https://github.com/can1357/oh-my-pi/pull/11454) by [@sjawhar](https://github.com/sjawhar)).
- Moving a session (`/move`, or re-rooting on resume when its directory is gone) into a project it lived in before no longer fails with `ENOTEMPTY`; the two artifact directories are merged instead ([#12035](https://github.com/can1357/oh-my-pi/pull/12035) by [@sjawhar](https://github.com/sjawhar)).
- Inbound user messages delivered by an extension (e.g. HCOM `sendUserMessage`) no longer clear the composer draft; in-progress text and pasted images are preserved.
- zsh completions for `--resume`, `--model` and the other dynamic value flags work again. ([#12113](https://github.com/can1357/oh-my-pi/pull/12113) by [@Huang-404-Q](https://github.com/Huang-404-Q))
- Leftover child `.git` directories and broken gitfiles no longer appear as the active project in the status line or agent instructions ([#12105](https://github.com/can1357/oh-my-pi/pull/12105) by [@bobbyhuang-dev](https://github.com/bobbyhuang-dev)).
- Clicking a file path in the VS Code terminal opens the file at the requested line instead of a blank tab, and no longer breaks JVM language servers. ([#12123](https://github.com/can1357/oh-my-pi/pull/12123) by [@Huang-404-Q](https://github.com/Huang-404-Q))
- An `http`/`sse` MCP server that drops while the session is idle (a restart, a redeploy, a laptop waking) now reconnects on its own with a backoff instead of staying disconnected until the next tool call or `/mcp reconnect`, so its resource subscriptions and notifications come back with it ([#11803](https://github.com/can1357/oh-my-pi/pull/11803) by [@sjawhar](https://github.com/sjawhar)).
- Fixed pending-task reminders restarting the model after empty-response retries were exhausted ([#11879](https://github.com/can1357/oh-my-pi/pull/11879) by [@moodiness](https://github.com/moodiness)).
- `/tan` now waits for descendant results before returning its final answer and remains cancellable while waiting ([#12090](https://github.com/can1357/oh-my-pi/pull/12090) by [@ryxli](https://github.com/ryxli)).
- Ollama web search results now collapse tabs and embedded newlines in titles and snippets so they render on single lines.
- Pre-execution extensions that rewrite a streamed edit now execute the rewritten edit instead of the original input.
- Fixed sessions with skills disabled still advertising unavailable `skill://` resources ([#10215](https://github.com/can1357/oh-my-pi/issues/10215)).
- Singular and plural now work on both plugin surfaces: `/plugin` in the TUI and `omp plugins` on the CLI ([#12092](https://github.com/can1357/oh-my-pi/pull/12092) by [@XL-Lewis](https://github.com/XL-Lewis)).
- ACP no longer advertises a custom or file slash command whose name collides with a builtin alias (e.g. `models`, `status`, `rewind`), which previously offered a command that ran the builtin instead of the configured handler ([#12092](https://github.com/can1357/oh-my-pi/pull/12092) by [@XL-Lewis](https://github.com/XL-Lewis)).
- A manual `/compact` (slash command, RPC `compact`, extension `ctx.compact()`) issued while a turn is in flight now resumes that turn once the summary is committed, or immediately when there was nothing to compact — a queued steer/follow-up drives the resume, otherwise the same auto-continue nudge context-full compaction uses — instead of leaving the agent idle on a half-finished tool loop until the user types "continue". A prompt or extension-triggered turn that lands first takes the session instead. `compaction.autoContinue: false` still disables the resume; plan-mode "Approve and compact context" keeps dispatching its own execution turn ([#11873](https://github.com/can1357/oh-my-pi/pull/11873) by [@brndnmtthws](https://github.com/brndnmtthws)).
- Model-browser prices now preserve integer trailing zeros and positive sub-cent rates, and identify invalid individual rates ([#11624](https://github.com/can1357/oh-my-pi/pull/11624) by [@cyriusweng](https://github.com/cyriusweng)).
- Fixed the composer stranding blank rows below the input after a confirmation dialog or tall multi-line editor collapses; the editor now stays pinned to the bottom instead of drifting up until a resize ([#11007](https://github.com/can1357/oh-my-pi/issues/11007)).
- Subagent transcripts now identify their parent session and attribute host or parent-agent steering to the agent instead of the user ([#12077](https://github.com/can1357/oh-my-pi/issues/12077)).
- User-shell `!` commands now keep their transcript block mutable until queued PTY replay finishes, preventing successful and nonzero stdout/stderr from disappearing into immutable terminal history ([#12062](https://github.com/can1357/oh-my-pi/issues/12062); [#12080](https://github.com/can1357/oh-my-pi/pull/12080) by [@Dante-dan](https://github.com/Dante-dan)).
- Headless print mode now stays alive while first-turn mnemopi recall waits for its embedding worker ([#12067](https://github.com/can1357/oh-my-pi/issues/12067)).
- Deferred TTSR reminders no longer repeat before the configured `repeatGap` has elapsed ([#12065](https://github.com/can1357/oh-my-pi/pull/12065) by [@Dante-dan](https://github.com/Dante-dan)).
- Queued user steering and follow-up messages now refresh extension policy at delivery, including the first steering turn in a new session; returned overrides stay current when hooks change tools, and repeated policy changes pause automatic draining until an explicit retry ([#11835](https://github.com/can1357/oh-my-pi/pull/11835) by [@andrebrait](https://github.com/andrebrait)).
- Fixed the TODO HUD auto-dismiss lifecycle: completed plans now persist their hidden state, survive session reopen, and can be explicitly revealed without stale timers hiding replacement plans.
- Agents shipped by omp-installed marketplace plugins now honor their `model:` frontmatter instead of always inheriting `@default`; only Claude Code-format plugins (declaring `.claude-plugin/plugin.json`) keep dropping their provider-specific aliases ([#12028](https://github.com/can1357/oh-my-pi/issues/12028)).
- `--resume`/`--continue` combined with `--no-session` now fail with `--resume requires session persistence` instead of silently starting a fresh empty session and discarding the resumed history ([#12008](https://github.com/can1357/oh-my-pi/issues/12008)).
- Session search now keeps exact and partial title matches above prompt-history matches, so a session found by name stays at the top after typing pauses ([#11990](https://github.com/can1357/oh-my-pi/pull/11990) by [@lemonleks](https://github.com/lemonleks)).
- Collab replication now enforces its 1 MiB frame ceiling: an entry too large to shrink ships as a "too large to replicate" entry instead of an oversized frame, a deeply nested entry no longer aborts a guest's join, and the ceiling is measured in bytes rather than UTF-16 code units ([#11433](https://github.com/can1357/oh-my-pi/issues/11433); [#11999](https://github.com/can1357/oh-my-pi/pull/11999) by [@MertSoylu](https://github.com/MertSoylu)).
- Model Hub now waits for default-role assignment to finish before accepting more input, preventing stale UI state and duplicate model changes that made a selection appear to require a second attempt ([#10982](https://github.com/can1357/oh-my-pi/pull/10982) by [@lemonleks](https://github.com/lemonleks)).
- Fixed macOS copies showing pasteboard warnings, mangling non-ASCII text, reinterpreting PDF/EPS/RTF text, or leaving stale text after rapid copies ([#9015](https://github.com/can1357/oh-my-pi/pull/9015) by [@lemonleks](https://github.com/lemonleks)).
- Fixed the coding-agent binary bundle failing with `Could not resolve: "chalk"` in hermetic installs (e.g. `nix run`) by importing chalk from the in-repo `@oh-my-pi/pi-utils/chalk` reimplementation instead of the undeclared npm `chalk` package ([#12001](https://github.com/can1357/oh-my-pi/issues/12001)).
- Fixed `edit.modelVariants` and other model-dependent system-prompt policy going stale after an automatic retry or usage-aware fallback swapped the model, so a session that fell back to a variant-pinned model now rebuilds its prompt for the model actually serving the turn ([#11983](https://github.com/can1357/oh-my-pi/issues/11983)).
- `omp auth-gateway serve` now picks up credential logins and logouts made by another process within ~10s instead of serving its boot-time credential set until restart: broker-backed clients implement `pollExternalChanges()`, and the gateway polls it to reload credentials and rebuild its served catalog so a newly-logged-in provider becomes routable and a logged-out one stops being advertised and used ([#11781](https://github.com/can1357/oh-my-pi/issues/11781)).
- Fixed `omp bench` and `omp if-bench` rejecting models that `omp models` lists (e.g. llama.cpp, Ollama, LM Studio, `models.yml` servers) by retrying model resolution through a live discovery pass when the local cache can't restore their credentials ([#11598](https://github.com/can1357/oh-my-pi/pull/11598) by [@yomgui1](https://github.com/yomgui1)).
- `omp --fork` with a missing session path now fails with `Session "<path>" not found.` instead of silently opening an empty parentless session ([#11944](https://github.com/can1357/oh-my-pi/pull/11944) by [@onlyysaurabh](https://github.com/onlyysaurabh)).
- `omp read <mcp-resource>` now waits for a still-handshaking MCP server to finish connecting instead of reporting `No MCP server has resource` when the connect outlasts the startup race ([#11950](https://github.com/can1357/oh-my-pi/issues/11950)).
- `memory://root` is now advertised in URL completion only on `memory.backend=local`, and reading it on `hindsight`/`mnemopi` reports the file-backed root as local-only (pointing at `recall`/`reflect`) instead of telling you to enable memories that are already enabled; the memory glob validator now names the expected form (`memory://root/**`) instead of echoing the rejected input ([#11909](https://github.com/can1357/oh-my-pi/issues/11909)).
- Advisors no longer brick themselves permanently on a transient rate limit: a usage-limit error whose credential is only temporarily blocked is now waited out and retried (bounded by `retry.maxDelayMs` / `retry.maxRetries`), latching the quota-exhausted state only when the block is a genuine long quota window ([#11947](https://github.com/can1357/oh-my-pi/issues/11947)).
- Large eval `display()` values now stay bounded in session history while remaining available through output artifacts, preventing slow `--resume` startup ([#11920](https://github.com/can1357/oh-my-pi/issues/11920)).
- Hindsight mental-model refresh no longer rewrites the active session's cached system-prompt prefix: the rendered `<mental_models>` block is frozen for the session lifetime (a background reflect applies to the next session; `/memory mm reload` remains the explicit in-session refresh), and volatile `last_refreshed_at` metadata no longer enters the model-facing prompt ([#11961](https://github.com/can1357/oh-my-pi/issues/11961)).
- Fixed Ctrl+D quitting the prompt even with draft text; it now deletes the character at the cursor like Delete, and only exits on an empty draft.
- Task subagents now honor the parent session's pinned OAuth account, including parallel and nested tasks ([#11939](https://github.com/can1357/oh-my-pi/issues/11939)).
- Advisor acknowledgments distinguish acceptance, deferral, and suppression; higher-priority findings replace only pending notes from the same review ([#11881](https://github.com/can1357/oh-my-pi/pull/11881) by [@olegpulatov](https://github.com/olegpulatov)).
- `/extensions` now shows an enabled context file as active when its higher-priority competitor is disabled ([#11870](https://github.com/can1357/oh-my-pi/issues/11870)).
- Anthropic prompt caching now keeps rolling breakpoints on persisted history when multiple `context` extension handlers append per-call messages ([#11897](https://github.com/can1357/oh-my-pi/issues/11897)).
- Collab guests now automatically rejoin when a transient host network drop recreates the relay room ([#11858](https://github.com/can1357/oh-my-pi/issues/11858)).
- Yield now resets the schema-validation retry budget after each valid section and recovers double-encoded JSON values instead of spending retries ([#11890](https://github.com/can1357/oh-my-pi/pull/11890) by [@lucamaia9](https://github.com/lucamaia9)).
- Bash commands whose `cwd` is a secondary Git worktree no longer inherit the agent's own `GIT_DIR`/`GIT_WORK_TREE` and related repo-location overrides, so a failed cherry-pick stays in the worktree where it ran instead of contaminating the primary one ([#11082](https://github.com/can1357/oh-my-pi/issues/11082)).
- Fixed `hub start` failing with a raw `connect ENOENT …/broker.sock` when the project daemon broker's lease was stale: the lease is now a process-owned lock the OS releases however the broker dies, a stale lease no longer blocks startup, and a broker that still cannot start reports its scope path plus recovery commands ([#11080](https://github.com/can1357/oh-my-pi/issues/11080)).
- Fixed concurrent `/pin` toggles from multiple omp instances silently dropping each other's pins, and crashes mid-write corrupting the pins file.
- LSP and debugger connections reject oversized or invalid frames instead of accumulating stdout indefinitely; fragmented headers decode without rescanning previous bytes.
- Read-only transcripts skip image blobs from hidden history, and session blob loading limits concurrent reads.
- Ctrl+C during an in-flight extension/hook load now exits cleanly instead of raising an `ExtensionExitError` unhandled-rejection storm ([#11789](https://github.com/can1357/oh-my-pi/issues/11789)).
- The legacy `@earendil-works/pi-coding-agent` shim now exports `findCutPoint` (adapted to upstream Pi's tokenizer-less 4-arg signature) and `sessionEntryToContextMessages`, so extensions targeting upstream Pi 0.84.2's compaction/session APIs (e.g. NVlabs/SoL-Pi) install instead of failing validation ([#11796](https://github.com/can1357/oh-my-pi/issues/11796)).
- `write` now rejects exact incomplete read projections before they can replace and truncate an existing file ([#11792](https://github.com/can1357/oh-my-pi/issues/11792)).
- Long reasoning streams retain less memory while preserving scrollback and terminal-width replay.
- `omp read <image>?q=<question>` no longer fails with "Model registry is unavailable for image questions."; the read CLI now wires a model registry so image questions resolve `modelRoles.vision`/`@default` like the agent ([#11338](https://github.com/can1357/oh-my-pi/issues/11338)).
- Shared sessions stay connected when a guest sends a corrupted frame or uses the wrong room key.
- Fixed turns dying with `undefined is not an object (evaluating 'e.identity.class')` as soon as the model started thinking when an extension provider projects its own catalog through `oauth.modifyModels` (`pi-provider-kiro` and friends); projected models are now materialized like every other catalog source.
- Legacy `agent.db` settings rows are deleted after a successful `config.yml` migration write, so deleting `config.yml` no longer silently resurrects stale values ([#11568](https://github.com/can1357/oh-my-pi/issues/11568)).
- Subagents (including `/vibe` workers) that write their report in one turn and then finalize with a data-less `yield` in the next no longer come back as `SYSTEM WARNING: Subagent called yield with null data` stapled to accumulated narration. The finalize now harvests the last turn that actually reported — prose with no further work started — so mid-run narration can never surface as a final result either ([#11746](https://github.com/can1357/oh-my-pi/pull/11746) by [@oldschoola](https://github.com/oldschoola)).
- Fixed `/force` and other forced tool choices refusing every OpenRouter model: `buildNamedToolChoice` did not recognise the `openrouter` api. Models whose compat disables tool choice or forced tool choice now report forcing as unsupported instead of queueing a choice the transport discards ([#11658](https://github.com/can1357/oh-my-pi/pull/11658) by [@datrixlab](https://github.com/datrixlab)).
- Provider `baseUrl` overrides now scope by API: custom models inheriting the provider URL define which APIs it covers (a provider-level `api` covers override-only providers), `transport: pi-native` keeps its gateway `baseUrl` provider-wide, and a bundled model no longer routes to another API's endpoint ([#11608](https://github.com/can1357/oh-my-pi/pull/11608) by [@danilouchoa](https://github.com/danilouchoa)).
- Invalidated stale background speculative compaction results when post-snapshot branch growth prevents recovery headroom or causes net context expansion, preventing dead-end progress pauses and provider context overflows ([#11637](https://github.com/can1357/oh-my-pi/pull/11637) by [@alvins82](https://github.com/alvins82)).
- Fixed `AgentSession.waitForIdle()` returning before successful retry recovery events and persistence had settled.
- Reviving a parked subagent whose session file vanished, or whose transcript lost its message history, now fails loudly instead of resurrecting a zero-history agent that runs, answers peers, and writes attributed work ([#11500](https://github.com/can1357/oh-my-pi/issues/11500)).
- Native compaction preserves prior local summaries and messages arriving while a speculative compaction is in flight. ([#11525](https://github.com/can1357/oh-my-pi/pull/11525) by [@rpie9](https://github.com/rpie9))
- Advisor maintenance preserves compaction summaries and native replay payloads in later requests without duplicating native-covered retained messages. ([#11525](https://github.com/can1357/oh-my-pi/pull/11525) by [@rpie9](https://github.com/rpie9))
- Advisor maintenance uses portable summaries for incompatible native targets and prevents automatic model switches or recovery re-primes from stranding native history. ([#11525](https://github.com/can1357/oh-my-pi/pull/11525) by [@rpie9](https://github.com/rpie9))
- Advisor fallback, cooldown restoration, and context promotion can replay compatible native history when new native compaction is disabled; creating native results still requires the remote method to be enabled. ([#11525](https://github.com/can1357/oh-my-pi/pull/11525) by [@rpie9](https://github.com/rpie9))
- Secret obfuscation covers native message, tool/search text, and dynamic discovery descriptions and schema annotations in replay and preserved compaction history, including search/discovery-only collisions and snapshots committed after a later secret is discovered, while preserving tool schema constraints. ([#11525](https://github.com/can1357/oh-my-pi/pull/11525) by [@rpie9](https://github.com/rpie9))
- A session store that stops accepting writes (full disk, locked file, removed drive) now reports the failure on stderr in print mode and as an error notice in RPC mode, and a run whose transcript never became durable exits nonzero instead of reporting success ([#11493](https://github.com/can1357/oh-my-pi/issues/11493)).
- Online auto-thinking classification and session titles now walk `retry.fallbackChains` when the tiny/smol primary returns a provider error, instead of failing the background task while the main turn still has a fallback chain.
- Online tiny tasks now use canonical model-keyed, wildcard, and role fallback resolution, and stop at the first resolvable model when `retry.modelFallback` is disabled.
- Session title generation now expands the appended active session model's own `retry.fallbackChains` after that model fails, without merging tiny/commit/smol role defaults onto it ([#10938](https://github.com/can1357/oh-my-pi/pull/10938)).
- `/export` HTML now renders bold inline code inside ordered-list items followed by fenced code blocks instead of displaying literal `<strong>` and `<code>` tags ([#11690](https://github.com/can1357/oh-my-pi/issues/11690)).
- Disabled providers are no longer selected as pinned subagent models; ordered agent model lists now skip them ([#11709](https://github.com/can1357/oh-my-pi/issues/11709)).
- Entering goal or vibe mode while a plan session is paused now warns `Plan mode is paused — run /plan again to fully exit.` instead of the stale `Exit plan mode first.` ([#11692](https://github.com/can1357/oh-my-pi/issues/11692)).
- `omp plugin install <name>` for npm packages now bypasses bun's manifest cache, so a reinstall picks up a newly published version instead of a stale one, and installing an explicit `<name>@<version>` no longer fails to resolve a version that exists on the registry ([#11634](https://github.com/can1357/oh-my-pi/issues/11634)).
- File slash commands now surface their `argument-hint` frontmatter as inline autocomplete ghost text and ACP `input.hint`, not only in the `/extensions` inspector ([#11647](https://github.com/can1357/oh-my-pi/issues/11647)).
- Extensions authored against upstream Pi (e.g. pi-fabric) no longer crash every session at startup: registered tools now carry the upstream-shaped `sourceInfo` provenance that `getAllRegisteredTools()` consumers read ([#11661](https://github.com/can1357/oh-my-pi/issues/11661)).
- Custom `openai-responses` / `openai-codex-responses` providers can now set `compat.supportsConfigurationUpdate: false` in `models.yml` so auto-thinking effort changes on `gpt-6-astra` are sent as the top-level `reasoning.effort` instead of a `configuration_update` input item the endpoint rejects with HTTP 400; the key is validated as a boolean and documented ([#11121](https://github.com/can1357/oh-my-pi/issues/11121)).
- Missing execute-time tool context now fails closed to `always-ask` with an empty policy map (no user grant) instead of silently resolving as `yolo` with empty policies. The former copies (`ExtensionToolWrapper.execute`, Cursor `refuseByWritePolicy`, `mcpApprovalPreflight`, and eval prelude host calls) share one helper so they cannot drift. A session-bound wrapper that is invoked without context still inherits that session's settings ([#10362](https://github.com/can1357/oh-my-pi/issues/10362)).
- Advisors that repeatedly emit unsafe tool calls now pause their optional review until reset or their model/tool capability basis changes.
- Stop eval from advertising `agent()` after the session reaches its subagent recursion-depth limit.
- Background job snapshots preserve complete sibling results when a capture fails and show each capture warning only once.
- Failed raw-output captures now show a warning without failing the command or advertising an incomplete artifact as full output.
- Unknown custom status-line segment ids now produce a config warning and are rejected by `omp config set` instead of silently disappearing ([#11579](https://github.com/can1357/oh-my-pi/issues/11579)).
- `ast_edit`, `search`, and `ast_grep` no longer fan out into overlapping scans when `paths` mixes a directory with a file inside it and the directory is spelled as an absolute path; `ast_edit` previously applied each rewrite twice to the nested file (corrupting it, e.g. `wrap(wrap(log(1)))`) or reported a spurious stale-preview error ([#11584](https://github.com/can1357/oh-my-pi/issues/11584)).
- Selecting the Custom status line preset now starts from its built-in segment layout when no segment lists are configured, while explicit empty lists still hide either side ([#11577](https://github.com/can1357/oh-my-pi/issues/11577)).
- Snapcompact frame-overflow rescue now replaces its superseded divider instead of rendering two contradictory before→after badges ([#11607](https://github.com/can1357/oh-my-pi/issues/11607)).
- Windows home launches and in-process shell paths (builtins, `ls`, and redirections) now resolve `/tmp` to the system temporary directory instead of a drive-root `tmp` directory ([#11603](https://github.com/can1357/oh-my-pi/issues/11603)).
- Shared-session guests can no longer fetch private advisor transcripts by agent ID.
- Fixed `/restart` and worker spawning failing with ENOENT after package managers prune the unlinked previous version directory during an upgrade ([#10873](https://github.com/can1357/oh-my-pi/pull/10873)).
- xAI web search omits relay narration even when responses include aggregate text or blank citation URLs, while preserving substantive answers.
- xAI web search no longer rejects valid aggregate answers because of non-message relay metadata.
- Advisor calls to tools it was not granted are answered in-band with the loop's `Tool <name> not found` result instead of discarding the whole turn; only hazardous output is still quarantined, and the repeated-quarantine latch is gone.
- macOS self-updates preserve executable backups still used by running sessions, preventing lost privacy-permission attribution.
- Startup and daemon commands no longer crash when project-directory canonicalization encounters EPERM or EACCES.
- `omp plugin install --dry-run` now previews marketplace installs without mutating plugin state.
- In colocated jj-git workspaces, the status line and footer now show the JJ label (bookmark or short change ID) instead of a detached git HEAD. Git-backed automation still resolves these directories to Git ([#11071](https://github.com/can1357/oh-my-pi/issues/11071), [#11325](https://github.com/can1357/oh-my-pi/pull/11325) by [@boazy](https://github.com/boazy)).
- Command output from native Windows tools on Chinese (and other non-UTF-8) locales is decoded using the system ANSI code page instead of turning into replacement characters.
- `omp share` now reports missing session paths instead of creating and publishing empty sessions ([#11483](https://github.com/can1357/oh-my-pi/issues/11483)).
- `omp gc --blobs` no longer deletes image blobs still referenced by a session stored via `--session-dir`/`--session`, including exact paths without a `.jsonl` suffix; relocated transcript files are now recorded in a persistent registry the blob reachability scan reads (issue [#11551](https://github.com/can1357/oh-my-pi/issues/11551)).
- `--export` now reports missing input files instead of creating empty sessions and successful transcript-less exports ([#11481](https://github.com/can1357/oh-my-pi/issues/11481)).
- `AgentLifecycleManager.global()` now rebinds to the current global registry after a lone `AgentRegistry` reset, so a test that resets only the registry can no longer strand the lifecycle manager on a dead instance and hang the collab kill path ([#11432](https://github.com/can1357/oh-my-pi/issues/11432)).
- Unset `advisor` model roles now honor the configured `@slow` fallback without inheriting an unconfigured primary model ([#11428](https://github.com/can1357/oh-my-pi/issues/11428)).
- Unknown-context-window providers (e.g. a custom/self-hosted OpenAI-compatible profile the model registry has no metadata for) no longer permanently dead-end on a non-media payload-rejection 413 when a usable compaction method is configured; the session now gets the same promotion/compaction attempt a known-window overflow would ([#11479](https://github.com/can1357/oh-my-pi/issues/11479)).
- The `set_auto_compaction` and `set_auto_retry` RPC commands are now session-scoped like `set_thinking_level`, so a short-lived RPC client no longer silently writes `compaction.enabled`/`retry.enabled` to the machine-global `config.yml` ([#11431](https://github.com/can1357/oh-my-pi/issues/11431)).
- Closing an idle terminal whose draft was resumed and materialized into a real conversation by another terminal no longer deletes that conversation; the close-time draft GC now re-reads the session file before dropping it ([#11497](https://github.com/can1357/oh-my-pi/issues/11497)).
- RPC output spills to temporary disk storage for slow readers instead of retaining an unbounded memory queue, and drains final responses before shutdown.
- Large session records load faster without repeatedly copying unfinished JSONL rows.
- `omp update` now bypasses mise's `minimum_release_age` gate when updating via mise, so a fresh release published within the freshness window (24h by default) installs instead of being silently skipped ([#11316](https://github.com/can1357/oh-my-pi/issues/11316)).
- Bounded reads of large files no longer report a partial scan count as the exact file line total ([#11417](https://github.com/can1357/oh-my-pi/issues/11417)).
- Alt+Up (dequeue) now pops only the last queued message back into the composer instead of draining the entire queue, so pressing it no longer destroys composer work ([#11402](https://github.com/can1357/oh-my-pi/issues/11402)).
- Large collab snapshots now stream in order through slow connections; an overloaded live queue ends sharing explicitly instead of silently losing updates or commands.
- A collab guest that disconnects mid-snapshot, or a host that reconnects into a recreated room, no longer leaves stale snapshot frames at the head of the shared send queue delaying every other guest's welcome.
- Fixed a collab authorization bypass: after a host reconnect the relay reissues guest ids from 1, and the host kept the previous ids' write permissions, so a client holding only the read-only view link could take a reissued id and run prompts, interrupts, agent commands or answer host prompts without ever joining.
- A host prompt awaiting a collab guest's answer no longer hangs when the host reconnects: the relay closes everyone who could answer, so the request now resolves as unavailable instead of waiting forever or being re-posed to whoever joins next.
- LSP semantic queries (references, definition, rename, hover) now reconcile an already-open document with disk before running, so an external edit that shifts lines no longer resolves the query against the server's stale document and returns a different symbol ([#11416](https://github.com/can1357/oh-my-pi/issues/11416)).
- Antigravity usage views now show the shared Claude/GPT five-hour and weekly quotas once per account instead of duplicating Anthropic and OpenAI rows ([#11268](https://github.com/can1357/oh-my-pi/issues/11268)).
- Fixed spelling typo underlines painting solid black bars over composer text in Apple Terminal, which does not implement colon-subparameter styled underlines. Terminals without that capability now use a flat underline. kitty, Ghostty, WezTerm, and iTerm2 version 3.5 or later keep the red curly underline.
- Fixed a `/move` or cross-project resume completing before memory was rebound, so the next prompt could recall and retain against the previous project's Hindsight bank, the destination project's `memory.backend` and Hindsight server were ignored, and a failed rebind was reported as a successful move. Cwd rebinding drains Mnemopi extractions without auto-retaining the transcript during move or rollback, and rejects moves when destination Mnemopi startup fails.
- Hide unavailable Hindsight memory tools after moving to a project without an effective Hindsight URL.
- Keep memory disabled in restricted SDK sessions after `/move` and `/wt`.
- Clear source-bank recall and mental-model context before Hindsight cwd rebinding completes.
- Fixed effort-specific retry fallback chains selecting the wrong chain by object/YAML order: a `model:low` selector no longer matches a configured `model:max` key (or vice versa), so a 429 retry stays on the same effort instead of escalating to an unrelated chain ([#11192](https://github.com/can1357/oh-my-pi/issues/11192)).
- Fixed `computer.capabilities()` returning `undefined` when called before any `computer.run`; the direct helper now fetches fresh backend and permission state from the desktop worker instead of a run-populated cache ([#11169](https://github.com/can1357/oh-my-pi/issues/11169)).
- Editor shortcuts for thinking visibility, history search, external editing, and tool activity now work while the Ask dialog has focus ([#11213](https://github.com/can1357/oh-my-pi/issues/11213)).
- Uninstalling a locally linked plugin now removes its `node_modules` symlink, so a later registry install cannot continue running the linked checkout ([#11172](https://github.com/can1357/oh-my-pi/issues/11172)).
- Fixed a user-invoked `/skill:` submission rendering two identical skill cards when the optimistic row retired into scrollback before the canonical message arrived during a slow preflight ([#11217](https://github.com/can1357/oh-my-pi/issues/11217)).
- Fixed `.astro` files rendering without syntax highlighting in write/edit previews and diffs: a vendored Astro grammar now highlights the `---` frontmatter and `{…}` template expressions as TypeScript and the template as HTML, instead of treating the whole file as HTML text ([#11164](https://github.com/can1357/oh-my-pi/pull/11164) by [@byigitt](https://github.com/byigitt)).
- Credential-shaped tokens are now redacted before the `mnemopi` backend persists a memory, covering the `retain`/`learn` tools, the automatic transcript retention path, and `memory_edit update`. Previously only the `local` and `sharpshooter` backends redacted, so a token pasted into a session could be stored verbatim and handed to any provider by a later `recall`.
- Fixed `/tan` forking a mid-turn parent leaving the clone showing the parent's in-flight tool call as its own unresolved work: the fork now pairs the parent's unresolved tool call with a synthetic aborted result so the clone inherits a terminal, well-formed transcript ([#11118](https://github.com/can1357/oh-my-pi/issues/11118)).
- Antigravity image generation now uses the image model advertised for the connected account instead of silently falling back after a stale-model 404 ([#11106](https://github.com/can1357/oh-my-pi/issues/11106)).
- `/tan` keeps its assigned request after automatic compaction instead of returning an empty-request question ([#11119](https://github.com/can1357/oh-my-pi/issues/11119)).
- `plugin doctor` now flags a plugin whose `omp-plugins.lock.json` version differs from the version installed in `node_modules`, instead of reporting the stale copy healthy; `--fix` reconciles it by reinstalling ([#11090](https://github.com/can1357/oh-my-pi/issues/11090)).
- `plugin upgrade` on an npm-installed plugin (e.g. a scoped `@scope/pkg`) now points to `omp plugin install <pkg> --force` instead of the opaque "Expected name@marketplace" parse error ([#11090](https://github.com/can1357/oh-my-pi/issues/11090)).
- `plugin install --force` now forwards the force request to Bun so stale cached package contents are actually replaced ([#11090](https://github.com/can1357/oh-my-pi/issues/11090)).
- Fixed `retry.waitForUsageReset` scheduling Z.AI and Zhipu resets eight hours late when provider responses omit the reset timestamp timezone ([#11014](https://github.com/can1357/oh-my-pi/issues/11014)).
- Claude Code sessions without history metadata use the working directory recorded by their transcript before falling back to the encoded project folder name.
- Reassigning a reserved JS Eval global (e.g. `var fs = await import("node:fs/promises")`) now persists across cells instead of silently reverting to the injected value on the next cell ([#10988](https://github.com/can1357/oh-my-pi/issues/10988)).
- Extension provider reloads no longer remove cached models from unrelated credential-scoped providers ([#10973](https://github.com/can1357/oh-my-pi/issues/10973)).
- Fixed the transcript pane rendering blank under the wmux terminal multiplexer on Windows; wmux panes are now detected as a multiplexer and repaint in place instead of emitting history the pane discards ([#11012](https://github.com/can1357/oh-my-pi/issues/11012)).
- Cursor sessions now preserve interrupted headless turns when SIGINT or SIGTERM stops print mode ([#10965](https://github.com/can1357/oh-my-pi/issues/10965)).
- Codex saved resets now auto-redeem when the exhausted weekly chat window is reported in the primary limit slot ([#10929](https://github.com/can1357/oh-my-pi/issues/10929)).
- Fixed ACP `always-ask`/`write` approval modes leaving a granted tool call stuck `pending`: an approved permission now runs the tool instead of re-prompting through the interactive gate that ACP clients cannot answer ([#10850](https://github.com/can1357/oh-my-pi/issues/10850)).
- Allowed marketplace and plugin names to contain uppercase letters while rejecting case-equivalent names that would collide in caches, so Claude-compatible marketplaces like `HexRaysSA/claude-marketplace` install and update instead of failing with `Missing or invalid field "name"` ([#10827](https://github.com/can1357/oh-my-pi/issues/10827)).
- Eval `agent()` wait no longer re-emits the same settled progress snapshot as duplicate status events.
- Configured LiteLLM discovery no longer exposes known task-specific models, including embedding, media, moderation, reranking, and search models, in model selectors.
- Fixed MCP tool names dropping digits, which renamed servers such as `context7` (`mcp__context_query_docs` → `mcp__context7_query_docs`) and collapsed servers differing only by a digit onto the same tool names, costing one of them a tool ([#10179](https://github.com/can1357/oh-my-pi/pull/10179) by [@bitboxx](https://github.com/bitboxx)). User `tools.approval` `deny`/`prompt` policies written against the old digit-stripped names keep applying to the renamed tools; `allow` entries and exact (non-glob) `tools.xdevInlineDevices` patterns need updating to the new names.
- Fixed one-shot CLI runs (`omp --help | head`, `omp --version | true`, `omp <command> | grep -m1`) crashing with a fatal `EPIPE: broken pipe, write` when the stdout consumer closed early; a vanished stdout peer now exits cleanly like any other Unix tool ([#10930](https://github.com/can1357/oh-my-pi/issues/10930)).
- Sticky `RULES.md` and other discovered rules are now re-read from disk on `/clear` and `/new`, so rules created or edited while omp is running take effect on the next session reset instead of only after a restart ([#10940](https://github.com/can1357/oh-my-pi/issues/10940)).
- The per-line column-cap truncation notice now points to the full-output artifact (`Read artifact://<id> for full output`) when the raw stream was mirrored, matching the tail-truncation notice ([#10877](https://github.com/can1357/oh-my-pi/issues/10877)).
- The per-line column-truncation notice now names the unit it enforces — `bytes` for streamed bash/eval output, `chars` for `read`/`grep` — instead of always claiming `chars`, which overstated visible content for multibyte text ([#10888](https://github.com/can1357/oh-my-pi/issues/10888)).
- The per-line column-truncation notice now names the unit it enforces — `bytes` for streamed bash/eval and grep output, `chars` for `read` — instead of always claiming `chars`, which overstated visible content for multibyte text ([#10888](https://github.com/can1357/oh-my-pi/issues/10888)).
- A custom `modelRoles` entry that references another role (e.g. `fast_worker: "@task"`) now resolves to the referenced role's model even when `retry.modelFallback` is disabled ([#10853](https://github.com/can1357/oh-my-pi/issues/10853)).
- Isolated task worktrees now survive agent yields and retain committed checkpoints until the agent is released ([#10913](https://github.com/can1357/oh-my-pi/issues/10913)).
- Fixed Ctrl+O (`app.tools.expand`) in the `ask` dialog only expanding a truncated question header: it now also expands truncated option descriptions in place.
- GitHub failures now retain structured API diagnostics, identify failed file reads, and clarify Boolean search syntax.
- Fixed `--continue` resuming a session stored outside an explicit `--session-dir`, and a breadcrumb recorded for a different session directory suppressing session lookup inside the requested one.
- Clarifying questions entered through Ask's `Other` option are answered before the original choice is shown again ([#10672](https://github.com/can1357/oh-my-pi/pull/10672) by [@Giardi77](https://github.com/Giardi77)).
- Fixed `/collab` hiding the join URL when the QR code is clipped: the one-line fallback now includes the browser link, and the status heading keeps that URL on its first row so transcript pressure cannot drop it.
- Fixed Anthropic prompt-cache cold misses on session resume with multiple OAuth accounts: the account that served a session is now recorded in the session file (as a `credential_pin` sha-256 of the account + org/project scope, so exports carry no plaintext identity) and re-pinned on resume with the session's effective last-use time, so a fresh process no longer re-ranks accounts by usage headroom — which systematically routed away from the just-used account and cold-missed the entire account-scoped cache prefix. Sticky routing was previously stored only in the auth store's KV cache, which is in-memory when a remote auth broker is configured.
- Fixed Anthropic prompt-cache cold misses on session resume with multiple OAuth accounts: the account that served a session is now recorded in the session file (as a PII-free `credential_pin` hash) and re-pinned on resume, so a fresh process no longer re-ranks accounts by usage headroom — which systematically routed away from the just-used account and cold-missed the entire account-scoped cache prefix. Sticky routing was previously stored only in the auth store's KV cache, which is in-memory when a remote auth broker is configured.
- Fixed concurrent `createAgentSession` calls with the default agent id failing initialization with `Agent "Main" was replaced during session initialization` — each in-process embedder (e.g. the edit benchmark runner) can now pass a private registry via the newly exported `AgentRegistry`, keeping every top-level session's "Main" out of the process-global roster race.
- Fixed task tool blocks duplicating their per-agent progress rows into terminal scrollback on every update: live task frames now pin the transcript live region so mid-run rows are never recorded as frozen snapshots, and a detached background task freezes its progress the moment any of its rows commit to scrollback instead of mutating committed history.
- Fixed Codex reset fireworks comparing different quota tiers or plans, preventing false celebrations when usage reports switch between Spark and base weekly limits.
- Fixed Cursor ranged-read results losing the full file byte size after applying the requested window.
- Fixed empty Codex final-stop recovery discarding an earlier commentary message when both messages shared response metadata.
- Fixed Advisor availability with providers that refuse echoed reasoning by retrying once with primary thinking stripped and surfacing persistent refusals immediately.
- Fixed `/tan` agents being unable to read parent-session `local://` attachments by correctly resolving local protocol options against the parent session's artifacts.
- Fixed Codex web search silently returning plain completions when the hosted web search tool was skipped.
- Fixed TUI collaboration guest loader not starting when joining or reconnecting mid-turn.
- Fixed multi-second TUI freezes in reftable-format repositories by moving branch resolution off the render path and adding a timeout to synchronous git spawns.
- Fixed `xd://` device summaries containing control characters and exceeding size budgets by stripping control characters and bounding summaries by UTF-8 bytes.
- Fixed `task.softRequestBudget` configuration having no effect on bundled scout and sonic subagents.
- Fixed quick LSP server exits being misreported as reader failures and resolved an issue where explicit reloads were blocked by initialization backoff.
- Forced Git subprocesses to use the stable `C` locale to ensure predictable, non-interactive command output.
- Fixed compatibility replay issues for pre-upgrade launch brokers evaluating xterm inside the client process.
- Fixed Advisor cost tracking in the status line across conversation boundaries, ensuring session transitions, forks, and resumes correctly restore or isolate conversation spend.
- Fixed validation failures for legacy extensions importing from the package root, which previously blocked installations.
- Fixed ACP clients (such as Zed), TUI status lines, and collaboration guests not updating when model changes occur dynamically within the agent loop.
- Fixed assistant-facing resource summaries omitting parameterized MCP resource templates, ensuring failed reads list templates alongside concrete resources.
- Fixed redundant `xd://` mount notices and prompt-cache invalidation when resuming sessions or reconnecting devices.
- Fixed the model picker displaying placeholder model lists instead of the actual credential-aware catalog resolved at registration.
- Fixed file corruption and snapshot mismatches when writing files through the ACP client bridge by verifying the final on-disk content after client-side post-save formatting.
- Fixed `omp ttsr test` silently evaluating source files as prose when their extensions were missing from the allowlist, and expanded the allowlist to support .NET, Shell, SQL, Zig, Dart, Scala, Elixir, and Protobuf files.
- Fixed automatic light/dark theme switching in direct WezTerm sessions on macOS when DEC Mode 2031 is unsupported, and improved theme-change color responsiveness.
- Fixed configured `retry.maxDelayMs` not being forwarded into Anthropic retry handling, so over-budget server retry delays fail fast.
- Added tokens-per-second throughput to RPC `get_state` responses for non-TUI clients.
- Added the RPC `set_fast_mode` command and typed TypeScript/Python client methods for live fast-mode control.
- Added `fastModeEnabled` and `fastModeActive` to RPC `get_state` responses.
- Fixed RPC fast-mode state reporting after direct Anthropic rejects `speed: "fast"`, while allowing explicit re-enable requests to retry priority service.
- Added opt-in subagent access to `checkpoint`, `rewind`, `learn`, and `manage_skill` when explicitly listed in an agent definition's `tools:` frontmatter. Listing one of `checkpoint`/`rewind` auto-includes the other. Settings (`checkpoint.enabled`, `autolearn.enabled`) remain master toggles.
- Added a `browser.cdpUrl` setting that points browser automation at an already-running CDP endpoint by default, so `app.cdp_url` no longer has to be repeated on every call. Explicit `app` options still take precedence.
- Native compaction preserves provider-native success and non-authentication failure semantics while retaining authenticated cross-provider fallback when the native provider rejects credentials.
- Fixed the Cursor Pi exec bridge silently dropping frame arguments. `pi_read`'s `offset`/`limit` were ignored, so a ranged read returned the whole file; `pi_grep`'s `literal` was ignored, so a fixed-string search ran as a regex and matched the wrong lines; and the path/glob join produced a `./`-prefixed spec. Ranges are now composed onto `read`'s `:N+K` inline selector, literal patterns are escaped, and the join uses `node:path`. These are `optional int32` fields, so a present `0` is honored rather than folded into a default: `pi_read` with `limit: 0` answers with empty output instead of the entire file, and `pi_find` with `limit: 0` clamps to 1 the way the reference client does.
- `pi_grep`'s `context` and `limit` are honored. Neither is expressible in the model-facing `grep` schema — context width comes from `grep.contextBefore`/`grep.contextAfter` fixed at tool construction — so the bridge builds a per-call `grep` for frames that supply them. `GrepTool` accepts these as constructor options; the model-facing schema is unchanged, and a frame that supplies neither keeps the shared instance and the session's defaults.
- `pi_ls`'s `limit` is still not mapped, now deliberately: it caps directory _entries_, while the local `read` tool renders a depth-2 tree with per-directory caps and elision rows and applies a selector as a _rendered line_ slice. Mapping it to `:1+K` would cap a different unit while appearing honored.
- The legacy pi shim's regex-literal escaper and path/glob join were verbatim copies of the modern bridge's. Both paths now call the shared helpers, so the two Pi translations cannot drift.
- Fixed every Cursor `pi_edit` frame failing instead of editing. Two independent causes: the session drops `edit` from the tool registry for Cursor so the model uses full-file `write`, but that registry is also the exec bridge's tool source, so the native frame — which the server sends regardless of the advertised catalog — found no tool; and the retained instance followed the session's configured edit mode, while `PiEditExecArgs` carries `old_text`/`new_text` pairs that only `replace` accepts (the default `hashline` takes a single `input` string). The bridge now resolves a `replace`-mode instance through its fallback resolver, still wrapped for approval.
- Fixed a `pi_grep` frame carrying `context` or `limit` escaping the approval gate. Honoring those fields needs a per-call `grep`, and the per-call instance was built raw while every registry tool is wrapped, so such calls bypassed `tools.approval.grep` and the exec-tier check for SSH-targeted paths. Both bridge callsites now build it through one shared factory that applies the same wrapper.
- Fixed Cursor advisors ignoring `pi_grep`'s `context` and `limit`. Only the primary session supplied the per-call `grep` factory, so advisor frames silently fell back to session defaults. Advisors now receive the same factory, gated on the advisor actually having been granted `grep`.
- Fixed Cursor advisors failing every `pi_edit`. The advisor roster handed the bridge the `edit` instance built for the advisor's own loop, which follows the configured `edit.mode` (`hashline` by default) and rejects the frame's `old_text`/`new_text` pairs — the same mode mismatch the primary bridge already fixed, on the path it missed. The exec map now substitutes a `replace`-mode instance, gated on the advisor actually having been granted `edit`, while the advisor's own loop keeps the tool it was given.
- Fixed `pi_bash` killing commands that explicitly asked for no deadline. `timeout` is `optional int32` and `bash` documents `0` as "disables the command deadline", but a truthiness check folded a supplied `0` into unset, applying the 300s default instead. A present `0` now passes through; negatives, which have no local meaning and would otherwise clamp to the 1s floor, still fall back to the default.
- Fixed the Cursor exec bridge granting `edit` and `grep` to sessions that withheld them. Both bridge-only tools are constructed rather than looked up, and `executeTool` prefers a constructed override over the registry, so a restricted tool set (`toolNames` without them, or `restrictToolNames`) still got a working `pi_edit`/`pi_grep` — native frames arrive regardless of the advertised catalog. Both are now gated on the session having actually granted the tool, matching the `delete` frame's existing check (issue #5680).
- Fixed Cursor advisor bridge tools bypassing approval settings. The advisor's `pi_edit`/`pi_grep` instances are approval-wrapped, but the wrapper reads `tools.approvalMode`, per-tool `tools.approval.<tool>` policies and `autoApprove` only from the execute-time tool context — which the advisor bridge never supplied, so every native advisor frame resolved as `yolo` with empty policies and ran past a configured `ask` or `deny`. Advisors now receive the same context store as the primary bridge.
- Fixed Cursor's `list_mcp_resources`/`read_mcp_resource` frames answering as though the client hosted no MCP servers. The bridge hardcoded an empty catalog and `not_found`, so resources from servers the session held live connections to were invisible to the model even while the same session read them through `mcp://`. Both frames now answer from the session's `MCPManager` — awaiting a server's background resource discovery rather than reading the not-yet-populated cache and reporting "advertises nothing" — and a lookup failure surfaces as an error rather than an empty catalog, which would read as "asked, none exist". A read carrying `download_path` writes the resource to that path and answers with the path alone, per the wire contract, instead of putting the payload back in the model's context. That path arrives from the server while the general-purpose resolver deliberately honors absolute paths and `..`, so downloads are confined to the workspace: the resolved target and its deepest existing ancestor must stay inside it, and a target that is itself a symlink is refused. The write then opens `O_NOFOLLOW` and refuses a non-regular or hard-linked file before truncating, so the final component cannot be swapped for a link or an inode shared outside after the check. A parent directory replaced by a symlink mid-write is still followed; closing that needs `openat`/dirfd walking, which this does not attempt.
- Fixed the Cursor native `delete` frame bypassing approval settings. Unlike every other frame it removes the file directly instead of running a registry tool, so no approval wrapper sat in front of it — the bridge's `allowDirectFileMutation` grant answers whether a mutating tool was granted, which is a different question from whether the user's policy allows the call. A configured `tools.approval.delete: deny`, or an `always-ask` session that this channel cannot prompt in, now refuses the frame and keeps the file.
- Fixed Cursor download-mode resource reads bypassing the session's mutation restrictions. A `read_mcp_resource` frame carrying `download_path` creates and overwrites workspace files without running a registry tool — the same hole the native `delete` frame had — so a session that withheld `write`/`edit`, or one whose `write` tier is `deny`/`always-ask`, still had files written. Both frames now share one grant (`allowDirectFileMutation`, renamed from `allowNativeDelete` now that it gates more than deletion) and one `write`-tier policy check, and the download refuses before the read so a blocked call does not fetch the resource either. The primary session derives that grant before it rewrites its registry: Cursor moves `edit` out of the tool map and `write` may be auto-registered later, so reading the map at bridge-construction time would have misjudged both.
- Fixed `pi_ls` never reporting that a listing was clipped. The bridge read the entry cap from a flat `details.resultLimitReached`, which `glob` sets but `read` — the tool serving `pi_ls` — does not: it records the cap through `OutputMeta` at `details.meta.limits.resultLimit.reached`. Every capped listing therefore reached Cursor with `entry_limit_reached` unset, reading as complete. Both shapes are now checked, the same way the truncation translation already handles its two producers.
- Fixed a mixed-content MCP resource read reaching Cursor mislabelled. The mime type was taken from the first content item while the payload came from whichever item supplied it, so an image blob followed by a text note sent the text as `image/png`. Each branch now reports the type of the part it actually sends.
- Fixed `pi_read`'s `offset`/`limit` returning more lines than the frame asked for. The range is composed onto the local `read` tool's inline selector, and a plain `:N+K` deliberately pads with one leading and three trailing context lines — helpful when a human reads a snippet, wrong for a caller that named an exact range: offset 5/limit 20 handed Cursor lines 4-27. Ranged Pi reads now compose `:raw:N+K`, which slices exactly the requested lines.
- Fixed `pi_grep` returning fewer matches than it asked for when they spread across many files. The local `grep` windows results to the first 20 files and tells the caller to paginate with `skip`, but `PiGrepExecArgs` has no `skip` field — so a frame asking for 100 matches over 25 one-match files got 20, `match_limit_reached` unset, and advice it could not act on: output silently short and labelled complete. A search carrying a total match cap now reads enough files to satisfy it (cap+1, so a result landing exactly on the cap is distinguishable from a clipped one) and reports the cap when it actually bites.
- Fixed every native `pi_edit` failing after a session switched onto Cursor. The replace-mode `edit` instance the frame needs was built only for sessions _created_ on Cursor, and the tool roster is not rebuilt on a model switch — so a session that started elsewhere kept its configured-mode `edit` in the registry, which the bridge resolves before its fallback, and the frame's `old_text`/`new_text` pairs failed validation against a `hashline` schema. The instance is now built from the `edit` grant regardless of the session's initial provider (lazily, so a session that never reaches Cursor never constructs one) and `pi_edit` asks for it explicitly through a dedicated accessor. A session that was never granted `edit` is still refused.
- Fixed the Cursor bridge's tool resolver being able to execute an unadvertised `edit`. That resolver doubles as the agent loop's fallback for any call outside the advertised set, so serving `edit` from it meant a hallucinated call — or one naming a tool the session deselected after startup — could run a replace-mode edit the model was never offered. It is device-only again; `pi_edit` uses its own accessor.
- Fixed the legacy Cursor `read` frame ignoring the `offset`/`limit` modern builds paginate with. Only the Pi variant composed a range, so every page of a legacy read returned the whole file (or its own truncation) and a model walking a large file never advanced past the first window. Both frames now translate a range through the same helper, and the answer sets `range_applied` to describe whether a window was actually composed.
- Fixed the legacy Cursor `grep` frame ignoring its pagination `offset`. The local `grep` paginates by file through `skip` and advertises exactly that in its own "use skip=N" advice, so an unforwarded offset re-ran the identical search and answered page one for every page. The answer now reports the offset it applied in `offset_applied`.
- Fixed a paginated Cursor `read` or `grep` frame being recorded as an unpaginated one. The executed call and the transcript block are built separately, so forwarding the frame's range and page fixed only the execution: the block still showed a bare path and an unskipped search, which is what a reloaded session replays and what the next turn reasons from — a slice of a file presented as the whole thing, and results from a later window presented as page one. Both are now synthesized from the same translation that runs them, including a `limit: 0` read, which is recorded as the zero lines it returns rather than a whole-file read.
- Fixed Cursor advisors answering every MCP resource frame as though the client hosted no servers. Only the primary bridge received the `MCPManager`-backed resource adapter, so an advisor's `list_mcp_resources` reported an empty catalog and its `read_mcp_resource` a `not_found` even though the advisor shares the session's live connections. Advisors now receive the same adapter; it is not gated on a tool grant, since reading what a server advertises is a different permission from calling one of its tools.
- Fixed advisor tools bypassing the approval gate. They are built straight from the builtin table, outside the loop that wraps every registry tool, and both the advisor's own agent loop and its Cursor exec bridge (`pi_write`, `pi_bash`) run those instances directly — so an advisor granted `write` or `bash` executed them regardless of a configured `ask` or `deny`. They now carry the same `ExtensionToolWrapper` as every other tool.
- Added `mcp_notification` extension event and multi-listener `MCPManager.addNotificationListener` API. The runtime already received MCP server-initiated JSON-RPC notifications at the transport layer but had no path to forward them to extensions; every notification (including server-custom methods) is now delivered as `{ server, method, params }` after the manager's own list/update handling. For known list-change methods (`notifications/tools/list_changed`, `notifications/resources/list_changed`, `notifications/prompts/list_changed`) the internal refresh promise is awaited before fanout, so a listener acting on `tools/list_changed` sees fresh `getTools()`. Notifications received before any listener attaches are buffered (bounded FIFO, cap 100, drop-oldest — matches `IrcBus`'s `MAILBOX_CAP`) and drained into the first subscriber, so startup-time frames aren't lost even if the extension binds after MCP discovery. Extensions can use this to bridge push-capable MCP servers (e.g. peer messaging) into session behavior by injecting a mid-turn steer via `pi.sendMessage` / `pi.sendUserMessage`.
- Fixed Advisor notes appending stale-review-window warnings when newer primary turns are queued during a review.
- Fixed layout padding alignment issues in bordered output blocks and web-search result panels.
- Fixed excluded web search providers remaining visible in the Web Search Provider Order settings list.
- Fixed internal Hub peer messages being exposed as ordinary tool-call updates in clients like Paseo.
- Fixed compatibility issues when installing legacy pi extensions by updating the legacy shim to correctly bridge missing runtime symbols and exports (such as isContextOverflow, isRetryableAssistantError, and JSON parsing utilities).
- Fixed an issue where routine daemon operations (like list, logs, stop, or describe) could inadvertently trigger a restart loop for detached daemons in a backoff window.
- Fixed marketplace plugin MCP discovery to correctly honor the mcpServers manifest field in plugin configuration files.
- Fixed user-initiated shell executions (! and $) being misattributed as agent actions in advisor transcripts.
- Fixed unnecessary prompt-cache invalidations by preserving the active auto-thinking effort level when per-turn classification fails.
- Fixed the omp process name showing up as bun in Linux process managers (like ps and top).
- Fixed agent shell commands inheriting environment variables from the launch directory's .env file, ensuring they only receive the parent environment and explicit tool overrides.
- Fixed the /new command retaining completed or failed async jobs from the previous session.
- Improved error handling in omp update to display a friendly timeout message if the download times out while streaming the binary.
- Fixed the write tool incorrectly treating semicolon-joined read selectors as filesystem paths and creating unintended directory structures.
- Fixed omp worktree clear prematurely deleting active task-isolation sandboxes owned by running subagents.
- Fixed /vibe mode preventing the director from completing parent tasks after verifying worker results by keeping the built-in todo tool active.
- Fixed numeric GitHub issue and pull request autocomplete being suppressed inside skill slash-command arguments.
- Restoring a prompt with image attachments via esc-esc branch or `/tree` now re-attaches the images to the composer draft: previously only the text (with its `[Image #N]` markers) was restored, so resubmitting sent the literal marker with no image.
- Fixed large bash/eval/ssh output citing two different artifact ids in one result — the truncation notice said `Read artifact://N for full output` while the footer said `Artifact: N+1`. The streaming sink's head and tail windows each had a full budget, so a middle-elided inline body could reach `headBytes + spillThreshold` and always re-tripped the final-defense inline byte cap, which truncated a second time (two elision markers), saved a duplicate already-truncated artifact, and left the notice's line ranges stale. The head and tail windows now share the spill-threshold budget (head clamped to half), the cap budget derives from the configured threshold plus notice slack, and when the cap does fire on a sink-spilled result it references the existing raw artifact instead of saving a copy.
- Fixed a disabled higher-priority MCP server no longer disabling a same-named lower-priority one: disabled servers are now suppressed after key-level dedupe instead of dropped before it, so a project `foo` with `enabled: false` keeps the user-level `foo` off while still not starving a differently-named equivalent connection.
- Fixed the MCP tool-name collision winner flipping when the current owner reconnects: the winner is now chosen by a stable server+tool key instead of tool-array insertion order, which reconnects reorder.
- Fixed MCP resources with custom URI schemes being treated as missing filesystem paths. `read` and `omp read` now resolve server-advertised native resource URIs such as `ags://capabilities/current-host`, while preserving the existing `mcp://<resource-uri>` form.
- Fixed three gaps in native MCP resource URI resolution: server-advertised URIs whose path is exactly `/` (e.g. `catalog://root/`) are now preserved byte-for-byte instead of losing the trailing slash to reconstruction; opaque resource URIs (`urn:example:document`, `custom:item`) are recognized by the `read` and `omp read` resolver gates instead of falling through to filesystem handling; and a failing `resources/templates/list` no longer discards a successful `resources/list`, which previously produced a false missing-resource error.
- Fixed custom LSP servers sending `languageId: "plaintext"` for extensions outside the built-in language map by honoring an optional per-server `languageId` in `lsp.json` for disk and in-memory document opens ([#6800](https://github.com/can1357/oh-my-pi/issues/6800)).
- Fixed interactive extension confirmations ignoring `dialogOptions`, and cancelled handler-owned dialogs when the extension watchdog times out so stale approval UI cannot outlive a blocked tool call ([#6805](https://github.com/can1357/oh-my-pi/issues/6805)).
- Fixed the per-handler extension context snapshotting the live `ctx.model` getter, so a handler calling `pi.setModel()` and then reading `ctx.model` saw the stale model; the scoped context now delegates to the base context instead of spreading it.
- Fixed Python cell errors (`$` commands and the eval tool) leaking runner-internal traceback frames. Cell syntax errors now render as the bare caret display with a `<cell>` filename instead of a `_handle_request_async`/`ast.parse` stack dump, and runtime tracebacks start at user code, matching the Ruby runner's user-frame filtering.
- Dropped unavailable forced tool choices through the queue rejection lifecycle and discarded their remaining sequence yields so a skipped force cannot disable tools on the next request ([#6543](https://github.com/can1357/oh-my-pi/pull/6543) by [@paralin](https://github.com/paralin)).
- Fixed identical MCP server connections discovered under direct and marketplace-plugin names spawning twice and duplicating mounted tool routes; distinct tools whose server names sanitize to the same route now keep the first registration and log both origins ([#6786](https://github.com/can1357/oh-my-pi/issues/6786)).
- Fixed `/usage` and the other large transcript command panels (`/session`, `/advisor status`, `/jobs`, `/changelog`, `/context`, `/memory view`) duplicating in native scrollback when invoked while an agent turn is streaming. These callsites mounted their finalized panel immediately via `present()` instead of deferring it until the turn ends via `presentCommandOutput()` (the path added in #5427 for `/tools`/`/mcp`), so the panel landed above a still-growing live block and was recommitted lower down ([#6767](https://github.com/can1357/oh-my-pi/issues/6767)).
- Fixed plan-mode task subagents unregistering extension-provided models, credentials, managers, and custom APIs from the shared parent `ModelRegistry` when restricted sessions intentionally skip extension loading ([#6783](https://github.com/can1357/oh-my-pi/issues/6783)).
- Fixed `/live` sideband WebSockets ignoring standard proxy environment variables and `NO_PROXY`, which left proxied sessions stuck while the rest of the Codex connection succeeded ([#6770](https://github.com/can1357/oh-my-pi/issues/6770)).
- Fixed the bash tool's `kill` builtin rejecting numeric signals and multiple process operands, stopping after the first failed target, and defaulting to `SIGKILL` instead of the standard `SIGTERM`. Negative PID operands (process groups per `kill(2)`) and the `--` end-of-options marker are now handled instead of being misparsed as signals ([#6779](https://github.com/can1357/oh-my-pi/issues/6779)).
- Fixed `learned.md` saves growing a blank line on every write (trailing-newline split artifact) and hoisting all headings/prose above all bullets, which re-scoped lessons under the wrong heading in hand-organized files. Saves are now byte-idempotent and preserve mixed Markdown ordering: non-list lines keep their positions, new lessons insert newest-first at the head of the first bullet run, and dedupe/cap operate on bullet lines in place.
- Fixed DeepSeek V4 Flash and Step 3.7 Flash models using hashline edit mode by default despite repeatedly misreading its range grammar; both now use the simpler replace-mode fallback unless explicitly overridden ([#6671](https://github.com/can1357/oh-my-pi/issues/6671)).
- Fixed an Ask form appearing while the main prompt contains a draft hiding that text and consuming the next in-flight keystroke. The draft now remains visible and keeps receiving input until it is submitted or cleared; only then do form controls activate ([#6737](https://github.com/can1357/oh-my-pi/issues/6737)).
- Fixed `glob` rejecting safe `memory://root/<directory>/**` patterns. Memory globs now resolve their directory prefix inside the project memory root while rejecting traversal and percent-encoded path separators across the complete glob path.
- Fixed `omp --resume <id>` prompting to fork sessions from another existing directory instead of switching the process and cwd-scoped settings into the resumed session's recorded directory ([#6752](https://github.com/can1357/oh-my-pi/issues/6752)).
- Fixed deferred CLI model roles resolving ambiguous bare model IDs to a preferred but unauthenticated provider instead of the authenticated provider selected by the eager path ([#6727](https://github.com/can1357/oh-my-pi/issues/6727)).
- Fixed Windows sessions crashing with an unhandled `EPIPE: broken pipe, write` when an LSP server closed its stdin between filesystem mutations; LSP writes now observe asynchronous `FileSink.write()` failures and route them through the existing request/notification failure path.
- Fixed the bash tool's `stat` builtin failing on native Windows with `stat: unsupported on this platform` (exit 1) for every invocation. The vendored `uu-stat` now ships a Windows-native backend that maps the GNU format directives onto `std::fs::Metadata`, the `windows_by_handle` metadata extensions (inode, hard-link count, and device via `GetFileInformationByHandle`), and the Win32 volume APIs for `--file-system` mode; Unix behavior is unchanged ([#6723](https://github.com/can1357/oh-my-pi/issues/6723)).
- Fixed auto-retry wedging the session after an assistant-tail removal miss: when a context rebuild recreated the failed turn's message object, the identity-keyed cleanup logged `assistant removal missed` but the retry still scheduled `continue()`, which rejected the terminal assistant error message locally (`Cannot continue from message role: assistant`) before any provider request — `auto_retry_end` never fired, the TUI kept showing retry progress, and the in-flight `prompt()` hung until a manual follow-up. The retry path now strips a still-failed assistant tail positionally after the backoff, and a continuation that still fails locally closes the retry saga with a failed `auto_retry_end` ([#5382](https://github.com/can1357/oh-my-pi/issues/5382)).
- Fixed native Anthropic web-search history being recursively truncated during session persistence or retained under a different user turn, preserving opaque replay bytes across reload and stripping them on reparent ([#6703](https://github.com/can1357/oh-my-pi/issues/6703)).
- Fixed malformed or temporarily unreadable `config.yml` files being treated as empty settings and then overwritten by the next setting change, which could permanently erase broker tokens, model roles, and provider configuration. Invalid YAML is now moved to a timestamped `.broken-*` backup, read failures abort without touching the source, pending changes remain retryable with the last successfully loaded settings, atomic writes preserve symlink targets and handle Windows `EPERM` replacement, concurrent startup failures are fully observed and quarantine races fail closed, and `omp config set/reset` waits for persistence before reporting success.
- Fixed mounted MCP tools being hard to invoke when server or plugin guidance names their original calls: sessions now include one bounded, exact original-name-to-`xd://` route map for every live mounted MCP tool—including servers without initialize instructions—and refresh it as catalogs change without disabling schema virtualization.
- Fixed `inspect_image` blocking indefinitely when the vision-model API stalls by combining the caller's abort signal with an `AbortSignal.timeout()` and surfacing a distinct timeout `ToolError` (separate from user-triggered abort) ([#4165](https://github.com/can1357/oh-my-pi/issues/4165)).
- Fixed MiMo models using hashline edit mode by default despite needing the same replace-mode fallback as Kimi. ([#3772](https://github.com/can1357/oh-my-pi/issues/3772))
- Fixed `omp` refusing to start on Windows when no `bash.exe` is discoverable — most visibly with scoop-installed Git, whose manifest shims `sh.exe`/`git.exe` but never `bash.exe`, so PATH lookup missed it. Startup threw `No bash shell found` while merely building the bash tool description, even though bash tool commands always execute in the embedded brush-core shell and need no host bash. Shell discovery now also checks `GIT_INSTALL_ROOT`, scoop and per-user Git for Windows install roots, and `sh.exe` on PATH, then falls back to `cmd.exe` for the spawn-only paths (interactive PTY, ACP client terminals) instead of failing; the cmd fallback is never used to wrap user-shell commands — brush runs the POSIX line directly.
- Added a selectable voice setting for `/live` realtime sessions ([#6566](https://github.com/can1357/oh-my-pi/issues/6566)).
- Fixed pre-initialization and cross-module render crashes in magic-keyword highlights, user and assistant messages, tool execution cards, and the usage dashboard ([#10864](https://github.com/can1357/oh-my-pi/issues/10864)).
- Retired local title models pinned before the LFM2.5 refresh (`lfm2-350m`, `lfm2-700m`, `qwen3-0.6b`, `qwen2.5-0.5b`, `gemma-270m`) now migrate to their closest current models instead of silently skipping session titles.

### Removed

- Removed the dangling `MCPManager.setOnNotification` single-slot setter, which had no callers in the runtime. Replaced by `MCPManager.addNotificationListener` — multi-listener, per-listener error isolation, returns an unsubscribe function.

## [18.2.0] - 2026-09-15

### Breaking Changes

- `Settings.getGroup()` now returns shallow-frozen snapshots, reused until effective settings change.
- Removed `parseSSE`, `MCPToolsResponse`, and `MCPCallResponse`; `callMCP()` now returns the shared `JsonRpcResponse` with an `unknown` result instead of an unchecked generic payload.

### Added

- Added `ollama` web search provider using Ollama's hosted web search API (`POST https://ollama.com/api/web_search`), authenticated via `OLLAMA_CLOUD_API_KEY` ([#3791](https://github.com/can1357/oh-my-pi/issues/3791)).
- Added `readUrl` support for Ollama model pages (`ollama.com/<model>` and `ollama.com/library/<model>`), extracting descriptions, tags, and architecture metadata.
- `@upstream` routing selectors accept tiered OpenRouter slugs (`openrouter/google/gemini-3.8-flash@google-ai-studio/priority`), and `omp bench` labels each routed model with its upstream.
- `/skill:<name>` in the composer becomes an atomic skill chip (icon + name, linked to its SKILL.md) once you finish typing it or accept it from autocomplete — it deletes as one unit and survives draft restores, like image chips.
- The transcript now flags a gateway serving a different Claude model than requested: a `⚠ served claude-haiku-4-5-20251001 · requested claude-opus-5 · via openrouter/Amazon Bedrock` divider under the first affected turn, shown once per substitution per session.

### Changed

- Compiled binaries ship precompiled bytecode: `omp` boots in ~30 ms instead of ~250 ms and the interactive prompt accepts input ~300 ms sooner, at the cost of a larger binary.
- Welcome recents refresh after first paint, and attachment bands reuse cached chip state until the draft changes.
- Interactive startup paints its speculative frame before loading the session runtime; model/auth dialogs and browser/computer preludes load on first use.
- Status-line redraws reuse unchanged segment output, settings groups, and tool token estimates while preserving live invalidation.
- Skill invocations render as a normal user turn: a mid-prompt skill shows as an inline chip in the user bubble; a leading skill shows as a railed callout with the chip and prompt size, with the rest of your message rendered as full multi-line Markdown instead of a single collapsed header.

### Fixed

- `hub wait` on a process now reports what it was actually blocked on when it times out (process exit, the `pattern`, or readiness) instead of always citing the start readiness log pattern.
- Isolated settings no longer share mutable array and record defaults.
- Ask timeouts above 1,000 seconds now retain their configured duration.
- Configured extension directories no longer load fallback index files when declared entries are missing.
- Telemetry no longer sends OTLP when only a non-OTLP exporter is selected.
- Browser response-body failures now preserve their original protocol errors.
- Auto-retry waits past the signed 32-bit timer ceiling (e.g. a month-scale OpenCode Go reset with `retry.waitForUsageReset`) now elapse in full instead of overflowing the timer and retrying immediately.
- JavaScript eval now reports startup failure if both isolated runtimes fail, instead of executing uncancellable code on the host thread.
- CommonJS extensions now expose computed and non-enumerable named exports while preserving `require`/import identity and reloads.
- Exa MCP calls now select matching responses after notifications, accept valid SSE framing, and preserve cancellation.
- Esc-Esc rewind, `/copy`, and `/tree`'s user-only filter now treat user-invoked skill and collab prompts as user turns: they are selectable, `←`/`→` jumps land on them, and rewinding past one restores the text you typed (with its chips) into the editor.
- `/skill:<name>` followed by a newline now invokes the skill instead of sending the draft as plain text.
- `openrouter/<vendor>/<model>@upstream` now resolves when the first-party provider bundles the same id (e.g. `google/gemini-*`), instead of failing with "model not found".
- Kept the subagent `yield` tool as a direct function call instead of mounting it through `xd://`.
- Git TUI staging now honors `.gitattributes` `text`/`eol` and clean filters, so "Stage All" no longer leaves `eol=crlf` files (e.g. `*.cmd`) dirty with no visible diff.
- Browsers spawned via `app.path` into an omp-owned profile no longer trigger the macOS "wants to use your confidential information in Safe Storage" keychain dialog.
- Reading Hugging Face file URLs (`/raw/...`, `/resolve/...`, `/blob/...`, `/tree/...`) now returns the file instead of the repo's model/dataset card.
- Directory reads no longer append a bogus `[1 results limit reached. Use limit=2 for more]` notice (`read` has no `limit`); capped child directories show only their inline `… N more` marker, and the prompt documents paging with `:N-M`/`:-N`.

## [18.1.22] - 2026-09-14

### Breaking Changes

- Hub message/job waits now always use the adaptive window (5s, lengthening to 5m across back-to-back waits); removed the `timeoutMs` argument and `async.pollWaitDuration` setting.

### Added

- Added a privacy warning to memory reports reminding users to review data for secrets before sharing
- `omp git` / `/git`: `delete` discards the selected file's changes (press twice to confirm) — in the sidebar on a file or whole directory, in the diff pane on the shown file; untracked files are removed, staged files reset to HEAD

### Changed

- Pressing `c` on a `/btw` answer now shows a green "✓ Copied to clipboard" confirmation in the panel and history detail, and BTW history accepts `Ctrl+/` to switch panes ([#12052](https://github.com/can1357/oh-my-pi/pull/12052) by [@H4vC](https://github.com/H4vC)).

### Fixed

- Automatic session titles no longer draw from canned prompt examples.
- Sessions titled by a local Ollama model (e.g. LFM2.5) no longer stay unnamed when the model's chat template spends the whole output budget on reasoning.
- `/debug` memory reports now include numeric memory statistics instead of raw heap snapshots that could expose provider and MCP credentials.
- Multi-step logins (e.g. Perplexity email → code) now move the input field under the latest prompt instead of leaving it stuck beneath the first one.
- Todo updates made through Eval's `tool.todo(...)` now persist to the session, so they survive resume/rewind/fork and no longer trigger false incomplete-todo reminders.
- Native background security scans now accept provider-owned AWS authentication for Amazon Bedrock and Bedrock Mantle without requiring a stored OAuth account ([#12013](https://github.com/can1357/oh-my-pi/issues/12013)).

## [18.1.21] - 2026-09-14

### Fixed

- Fixed Flatpak Chromium launcher executables (including `com.google.Chrome`, `org.chromium.Chromium`, and `io.github.ungoogled_software.ungoogled_chromium`) so `app.path` is treated as a browser and gets managed Chromium profile handling
- Fixed Chromium `--user-data-dir` handling by normalizing `--user-data-dir <dir>` and relative profile paths to absolute `--user-data-dir=...` values before launch
- Browser automation now works alongside an already-running Chrome using an isolated profile, keeps requested profiles separate, and never kills reused browser processes.
- First-use Chromium installation and browser operations no longer consume Eval's runtime timeout or reset its kernel while waiting.
- Browser startup reuses a successful system-Chrome fallback instead of retrying an unavailable download during the same open.
- Browser clicks and other interactions no longer stall when OMP-owned tabs are in the background, including after worker timeout recovery.

## [18.1.20] - 2026-09-13

### Added

- Added `collab.autoStart` (`off` | `view` | `control`): every local interactive session hosts itself as it starts and rotates its room on `/new`, `/resume`, fork, or branch, so a phone or dashboard can reach any running session without running `/collab` first ([#11908](https://github.com/can1357/oh-my-pi/pull/11908) by [@alphastorm](https://github.com/alphastorm) and [@sorphwer](https://github.com/sorphwer)).
- Added `omp collab list [--json]` and `/collab list` to enumerate every live local Collab host (instance, generation, session, cwd, model, participants, relay/attention state, access) without exposing links, plus `omp collab link <instanceId|pid> [--view]` to fetch one generation-bound browser URL from a private per-room Unix socket/named pipe registry; room keys, write tokens, and URLs never touch disk ([#6099](https://github.com/can1357/oh-my-pi/issues/6099); [#11908](https://github.com/can1357/oh-my-pi/pull/11908) by [@alphastorm](https://github.com/alphastorm) and [@sorphwer](https://github.com/sorphwer)).

### Changed

- Documented that native JS/TS hook factories must live in `.omp/hooks/pre/` or `.omp/hooks/post/` (not directly in `.omp/hooks/`), and cross-linked the hooks and extension-loading docs ([#11942](https://github.com/can1357/oh-my-pi/issues/11942)).

### Fixed

- The hidden notice announcing a mid-session tool-availability change now states that it lists only what changed, so an additions-only notice no longer reads as the complete tool set and the model keeps using tools that are still callable ([#11824](https://github.com/can1357/oh-my-pi/issues/11824) by [@camjac251](https://github.com/camjac251)).
- TTSR stream buffers now reset at every assistant message boundary, not only at turn start, so a `scope: text` or tool-argument rule can no longer fire on a later message because of text streamed by an earlier response in the same turn ([#11957](https://github.com/can1357/oh-my-pi/pull/11957) by [@srobroek](https://github.com/srobroek)).
- Eval `completion()` calls now use configured retry fallback chains when their role model fails ([#11989](https://github.com/can1357/oh-my-pi/issues/11989)).
- Eval `completion()` fallback chains now also apply to unqualified role models, walk into a failed fallback's own model chain, stop at `retry.maxRetries`, and resolve session-sticky credentials with the session id ([#11989](https://github.com/can1357/oh-my-pi/issues/11989)).
- Eval `completion()` fallbacks now keep depth-first chain order, inherit the failed candidate's effort for bare nested entries, and skip keyless candidates without spending `retry.maxRetries` budget ([#11989](https://github.com/can1357/oh-my-pi/issues/11989)).
- Eval `completion()` fallbacks reached at different efforts now each walk their shared descendants instead of truncating the later effort's path ([#11989](https://github.com/can1357/oh-my-pi/issues/11989)).
- Fixed ranged grep rejecting existing files with glob characters in their names ([#11977](https://github.com/can1357/oh-my-pi/issues/11977)).
- Notified Collab guests when admitted prompts are discarded, including room retirement during a session change ([#11908](https://github.com/can1357/oh-my-pi/pull/11908) by [@alphastorm](https://github.com/alphastorm)).
- Preserved pending Collab dialog answers across session-switch rollback without accepting them after commit, stop, or writer departure ([#11908](https://github.com/can1357/oh-my-pi/pull/11908) by [@alphastorm](https://github.com/alphastorm)).
- Fixed prompts awaiting setup crossing a fork, branch, or tree-navigation commit, multi-question extension dialogs moving later questions to a replacement Collab room, and stale rooms blocking `/collab` or `/join` after a failed session change ([#11908](https://github.com/can1357/oh-my-pi/pull/11908) by [@alphastorm](https://github.com/alphastorm)).
- Fixed background task cards missing their final completion or failure after an early result or live-session focus replay.
- Ranged reads on Windows no longer intermittently open the selector-suffixed path when filesystem probes return transient errors ([#11284](https://github.com/can1357/oh-my-pi/issues/11284)).

## [18.1.19] - 2026-09-12

- Fixed `--mode json` returning exit 0 on a turn-fatal provider/auth/network error ([#11498](https://github.com/can1357/oh-my-pi/issues/11498)).

### Added

- Added default-off speculative execution for validated local reads, including reads projected from nested JavaScript and Python eval cells.
- `/usage` now shows prepaid credit balances (e.g. Charm Hyper's `100 credits left`) on the provider cards and account summaries instead of `no data` ([#11656](https://github.com/can1357/oh-my-pi/pull/11656) by [@oldschoola](https://github.com/oldschoola)).
- Retry fallback chains now support per-model reasoning efforts: a fallback entry may carry an explicit thinking suffix (`"default": ["openai/gpt-5-mini:low"]`), and pressing `t` on a fallback row in `/models` sets or clears it. Bare entries keep inheriting the failing turn's effort. ([#11842](https://github.com/can1357/oh-my-pi/pull/11842) by [@H4vC](https://github.com/H4vC)).
- Added `task.agentServiceTierOverrides` for sparse exact-name service-tier overrides on task/eval agents, so selected agents can use priority/Fast mode without accelerating every subagent ([#9668](https://github.com/can1357/oh-my-pi/pull/9668) by [@alphastorm](https://github.com/alphastorm)).
- Added session-local `/btw` history with persistent answers and follow-ups; bare `/btw` reopens history, Escape cancels running answers before closing, and new questions no longer replace an in-progress answer.
- Added `f follow up` in BTW history to continue a selected side conversation with an English input prompt, persistent multi-turn history, and no changes to the main conversation.
- Completed inline BTW answers now support `f follow up` directly; history uses `Tab` for pane navigation and `Enter` or `f` to start a follow-up.
- Codex web search now accepts valid email-only OAuth credentials without requiring or fabricating a `ChatGPT-Account-Id` header ([#11847](https://github.com/can1357/oh-my-pi/pull/11847) by [@nguyennguyenit](https://github.com/nguyennguyenit)).
- Sessions now stay alive when their working directory is removed instead of crashing while preparing shell tools ([#11828](https://github.com/can1357/oh-my-pi/issues/11828)).
- MCP tool calls spelled with the Claude Code doubled separator (`mcp__server__tool`) now reach their registered tool ([#11516](https://github.com/can1357/oh-my-pi/issues/11516) by [@oldschoola](https://github.com/oldschoola)).
- MCP HTTP reconnects now release obsolete tool generations instead of growing session memory on every reconnect ([#11784](https://github.com/can1357/oh-my-pi/issues/11784)).
- `/debug` memory reports now keep large heap snapshots out of JavaScript strings and reject empty snapshots instead of saving zero-byte files ([#11785](https://github.com/can1357/oh-my-pi/issues/11785)).
- Sloppy-mode edits now drop a copied `[N more lines in ...]` read notice the same way they already drop the other read-metadata rows, so a pasted projection can no longer leak into the matched pattern or the written text ([#11797](https://github.com/can1357/oh-my-pi/pull/11797) by [@vasyza](https://github.com/vasyza)).
- `/usage` now honors a provider's configured `baseUrl` when checking credentials before any model has been discovered, so a proxy-scoped API key is no longer sent to the provider's canonical host ([#11656](https://github.com/can1357/oh-my-pi/pull/11656) by [@oldschoola](https://github.com/oldschoola)).

### Fixed

- Fixed automatic custom-tool loading trying to execute package metadata and declarative files, including metadata shadowing an executable tool with the same name ([#11864](https://github.com/can1357/oh-my-pi/pull/11864) by [@moodiness](https://github.com/moodiness)).
- Fixed successful Python kernel shutdowns being reported as unconfirmed and leaving spawned child processes running ([#11865](https://github.com/can1357/oh-my-pi/pull/11865) by [@moodiness](https://github.com/moodiness)).
- Fixed completed tool cards reverting to pending after refocusing live sessions, and tool output collapsing behind finished reasoning segments ([#11868](https://github.com/can1357/oh-my-pi/pull/11868) by [@serverinspector](https://github.com/serverinspector)).
- Invalid `WATCHDOG.yml` entries now produce startup/editor warnings while healthy advisors remain available ([#11882](https://github.com/can1357/oh-my-pi/pull/11882) by [@olegpulatov](https://github.com/olegpulatov)).
- Claude Code session imports now preserve typed user text stored alongside tool results ([#11854](https://github.com/can1357/oh-my-pi/issues/11854)).
- Extension commands now settle BTW writes before creating, switching, or branching sessions, preventing side requests from outliving their source session ([#11335](https://github.com/can1357/oh-my-pi/pull/11335) by [@Ant39140](https://github.com/Ant39140)).
- Session selection and active-session deletion now settle BTW writes before switching or removing history, preventing stale saves from blocking the next session ([#11335](https://github.com/can1357/oh-my-pi/pull/11335) by [@Ant39140](https://github.com/Ant39140)).
- Escape now cancels BTW follow-ups that are still waiting for startup writes, without launching a model request ([#11335](https://github.com/can1357/oh-my-pi/pull/11335) by [@Ant39140](https://github.com/Ant39140)).
- BTW history now rejects out-of-range timestamps instead of failing during display ([#11335](https://github.com/can1357/oh-my-pi/pull/11335) by [@Ant39140](https://github.com/Ant39140)).
- BTW follow-ups now preserve separate user/assistant messages and reuse an isolated topic-specific provider session for prompt caching; cancellation or failure starts a fresh transport generation.
- Restored Escape cancellation for running BTW answers and removed the separate `x` shortcut; cancelled output stays visible, and closing another history entry returns to any still-running BTW panel instead of hiding it.
- BTW history now rejects stale cross-process writes and protects running topics with an OS-backed lease, preventing one instance from erasing another instance's follow-ups.
- Copying a BTW topic now falls back to its most recent nonempty answer after an empty failed or cancelled follow-up.
- Invalid or cancelled `/move` operations no longer cancel BTW requests; busy side conversations block relocation, and stalled history writes stop session operations with a bounded error instead of hanging indefinitely.
- Session shutdown now shows closing progress before waiting for live commands or BTW history writes, and stops progress updates when cleanup completes or fails.
- Failed BTW terminal saves now block session operations while retaining the answer for copying and safe retry, instead of being treated as a successful flush.
- Standalone `!cd` now shares the BTW relocation guard with `/move` and `/wt`, refusing before shell execution when a side conversation is active or unsaved.
- `/wt` now checks BTW migration availability before creating a branch or checkout, preventing unused worktrees when a side conversation is busy.
- `/move` now checks BTW migration availability before confirming or creating a missing target directory, preventing leftover directories after a refused move.
- BTW errors now shorten embedded home paths and sanitize control characters and oversized text before display, while retaining original diagnostic errors.
- Speculative reads now open the authorized resolved target while rendering the requested path, so enabling speculation no longer changes read output for symlinks; video targets are declined at authorization ([#11892](https://github.com/can1357/oh-my-pi/pull/11892) by [@h4vc](https://github.com/h4vc)).
- JavaScript speculation now verifies the retained tool-bridge dispatcher and string-coercion intrinsic identities before projecting reads ([#11892](https://github.com/can1357/oh-my-pi/pull/11892) by [@h4vc](https://github.com/h4vc)).
- Speculative eval sessions are now discarded at reconciliation when a hook or transform appends source the stream never verified, instead of releasing reads planned from the original code ([#11892](https://github.com/can1357/oh-my-pi/pull/11892) by [@h4vc](https://github.com/h4vc)).
- Speculative reads now classify format and rendering by the requested path while opening the resolved target, so symlinks with a different extension read exactly like ordinary reads ([#11892](https://github.com/can1357/oh-my-pi/pull/11892) by [@h4vc](https://github.com/h4vc)).
- JavaScript speculation now validates coercion intrinsics used by `String()` and `.join()` inputs, not just template and `+` operands ([#11892](https://github.com/can1357/oh-my-pi/pull/11892) by [@h4vc](https://github.com/h4vc)).
- Speculative reads now infer the summary language from the requested path while reading the resolved target, so cross-language symlinks summarize exactly like ordinary reads (by [@h4vc](https://github.com/h4vc)).
- The structural summary cache now keys on the parser language path, so one file read through different extensions no longer reuses a stale summary (by [@h4vc](https://github.com/h4vc)).
- Fixed the Windows installer failing on Windows PowerShell 5.1: OS architecture detection no longer depends on the .NET `RuntimeInformation` type that only resolves reliably on PowerShell 7, and the script now requires PowerShell 5.1+ with a clear upgrade message instead of failing cryptically ([#11905](https://github.com/can1357/oh-my-pi/pull/11905) by [@h4vc](https://github.com/h4vc)).
- Speculative reads now infer the summary language from the requested path while reading the resolved target, so cross-language symlinks summarize exactly like ordinary reads ([#11892](https://github.com/can1357/oh-my-pi/pull/11892) by [@h4vc](https://github.com/h4vc)).
- The structural summary cache now keys on the parser language path, so one file read through different extensions no longer reuses a stale summary ([#11892](https://github.com/can1357/oh-my-pi/pull/11892) by [@h4vc](https://github.com/h4vc)).

## [18.1.18] - 2026-09-11

### Added

- Enable `tui.mouse` to focus live subagent cards and jump-list rows by clicking them, with a hover highlight on the target; native selection becomes Shift+drag while on ([#11737](https://github.com/can1357/oh-my-pi/pull/11737) by [@H4vC](https://github.com/H4vC)).
- The pinned `Subagents` block now lists every live agent, collapsed to a few rows with a click expander by default; `display.pinnedAgents` switches it to `full` or `off` ([#11737](https://github.com/can1357/oh-my-pi/pull/11737) by [@H4vC](https://github.com/H4vC)).
- The `remote` compaction method now covers Claude: Anthropic server-side compaction (`compact-2026-01-12` beta) runs behind the existing `compaction.methodOrder` / `compaction.remoteEnabled` gates for first-party Anthropic models, persists its plain-text summary with a native replay payload that later Anthropic turns send back as a `compaction` block, and falls through to the next configured method on failure like OpenAI server compaction.

### Changed

- The `providers.cacheRetention` `auto` setting now keeps Anthropic OAuth subscriber sessions on 1h prompt-cache retention and API keys on 5m, instead of 5m for both ([#11667](https://github.com/can1357/oh-my-pi/pull/11667) by [@camjac251](https://github.com/camjac251)).

### Fixed

- Provider-native compaction (OpenAI Responses compact, Anthropic server-side compaction) re-issues the system prompt the live turn actually sent — a per-turn `before_agent_start` override included — instead of the rebuilt base prompt, and advisor compaction sends the advisor's own prompt instead of the generic summarizer prompt, so the request reads the live request's cached prefix.
- The `set_steering_mode`, `set_follow_up_mode`, and `set_interrupt_mode` RPC commands are now session-scoped, so a short-lived RPC client no longer silently writes queue-mode fields to the machine-global `config.yml`. The setters still persist by default, so the settings panel and existing callers are unaffected ([#11555](https://github.com/can1357/oh-my-pi/issues/11555)).
- Hand-authored `*.openapi.json` files can now be edited without disabling generated-file protection globally ([#11674](https://github.com/can1357/oh-my-pi/issues/11674)).
- `models.yml` now validates the per-model `compat.stripImageInput` opt-out, so a wrong-typed value is rejected like every other declared compat key instead of being silently accepted ([#11697](https://github.com/can1357/oh-my-pi/issues/11697)).
- `/mcp reload` now distinguishes servers still connecting after the bounded reload window instead of reporting a healthy asynchronous reload as zero active servers ([#11639](https://github.com/can1357/oh-my-pi/issues/11639)).
- Fixed isolated tasks dropping nested-repo work: nested diffs persist as `<agent>.nested-*.patch` before cleanup, `apply=false` lists each file, isolated agents report as non-resumable, and runs needing manual recovery report failed ([#11343](https://github.com/can1357/oh-my-pi/pull/11343) by [@grapexy](https://github.com/grapexy)).
- Fixed the Windows PowerShell installer (`install.ps1`) aborting on Windows PowerShell 5.1 when bun or git wrote normal progress to stderr: native commands now run with `$ErrorActionPreference` scoped to `Continue` and success is gated on the process exit code, so `$ErrorActionPreference = "Stop"`'s stderr-as-terminating-error behavior no longer kills the install ([#11675](https://github.com/can1357/oh-my-pi/issues/11675)).
- Eval cell timeouts no longer fatally terminate the session when a browser tab worker is being recycled ([#11707](https://github.com/can1357/oh-my-pi/issues/11707)).
- Models whose images are stripped on the wire (`compat.stripImageInput`) now trigger the `describeForTextModels` vision fallback and are skipped when resolving the vision model, instead of silently dropping images ([#9697](https://github.com/can1357/oh-my-pi/issues/9697)).
- Hiding tool activity (its shortcut or `display.hideToolActivity` in `/settings`) now replays native history, so blocks already retired to the terminal hide on the same keypress instead of waiting for another display toggle ([#11734](https://github.com/can1357/oh-my-pi/pull/11734) by [@notnotype](https://github.com/notnotype)).
- `#readProjectSettings` now logs capability warnings when a project `.claude/settings.json` fails to parse, instead of silently dropping them ([#11570](https://github.com/can1357/oh-my-pi/issues/11570)).
- A malformed project `.claude/settings.json` now produces a warning instead of being silently ignored ([#11570](https://github.com/can1357/oh-my-pi/issues/11570)).
- Reduced memory usage during long responses while thinking is hidden ([#11632](https://github.com/can1357/oh-my-pi/pull/11632) by [@redsolver](https://github.com/redsolver)).

Older entries are archived in [packages/coding-agent/CHANGELOG.md@bac7e83b5b0e](https://github.com/can1357/oh-my-pi/blob/bac7e83b5b0eb86c909c17830a6666efc359578b/packages/coding-agent/CHANGELOG.md).
## [18.1.17] - 2026-09-10

### Added

- Unsent prompts cleared with Ctrl+C can now be recalled with Up, including pastes and images; disable Recall Cleared Drafts in settings to discard future clears instead ([#11524](https://github.com/can1357/oh-my-pi/pull/11524) by [@camjac251](https://github.com/camjac251)).
- Added `tui.vimMode`, an opt-in modal editing layer for the prompt, off by default ([#3299](https://github.com/can1357/oh-my-pi/issues/3299)). Escape leaves Insert; Normal mode has `hjkl`, `0`, `^`, `$`, `w`, `b`, `e`, `gg`, `G`, count prefixes, `x`/`D`/`C`, `dd`/`yy`, `p`/`P` and `u`; `v`/`V` start a Visual selection that `y` copies and `d` deletes.
- Added a `vim` status-line segment showing the current Vim mode (`NORMAL`/`INSERT`/`VISUAL`/`V-LINE`), the half-typed command beside it (Vim's `showcmd`, e.g. `2d`), and the Visual selection height (`V-LINE 4L`). Included in every built-in preset and hidden entirely unless `tui.vimMode` is on; `custom` preset users can add `"vim"` to `statusLine.leftSegments`.
- The cursor now changes shape with the Vim mode: block in Normal/Visual, thin/underline in Insert. Applies to the software cursor, and to the real terminal cursor (DECSCUSR) when `PI_HARDWARE_CURSOR` is set.
- Added the `tui.vimModeDisplay` setting (`text` / `icon` / `none`) controlling how the Vim mode appears in the status line: the full mode name, a single glyph per mode, or nothing. Shown in `/settings` only while Vim mode is on.
- Added `icon.vimNormal`, `icon.vimInsert`, `icon.vimVisual`, and `icon.vimVisualLine` symbols, so the Vim mode icons follow the active symbol preset like every other status-line icon — Nerd Font (fa-square / fa-pencil / fa-eye / fa-bars), Unicode (`■` `▎` `◉` `≡`), or ascii (`N`/`I`/`V`/`L`) — and can be overridden per theme via the `symbols` map.
- Added peak `↑` / off-peak `↓` indicators to the cost display for models with scheduled pricing (DeepSeek), refreshed automatically when the tariff changes.
- Added plan autosave: enable `plan.autosave` to automatically save approved plans to `<project>/.omp/plans/` when plan mode completes (customize with `plan.autosaveDir`, which accepts `~`, absolute, and cwd-relative paths) ([#11599](https://github.com/can1357/oh-my-pi/pull/11599) by [@H4vC](https://github.com/H4vC)).

### Changed

- Toggling `tui.vimMode` or `tui.vimModeDisplay` in `/settings` now takes effect immediately instead of requiring a restart; the editor, prompt border, status-line segment, and cursor shape all switch in place.
- The prompt border now colors Insert mode too (green), instead of falling through to the session accent. Normal and Visual were already colored, so Insert was the one mode the border could not distinguish — on themes whose accent matches the session accent it was indistinguishable from Normal. Borders outside Vim mode are unchanged.

### Fixed

- Marketplace plugins that share a repository root now load only their declared skills instead of every skill in the repository ([#11513](https://github.com/can1357/oh-my-pi/issues/11513)).
- Fixed collab host UI requests raised before a writable guest joins being lost; up to 64 pending asks now replay only to writable guests, and already-aborted asks no longer consume request IDs ([#9031](https://github.com/can1357/oh-my-pi/pull/9031) by [@alphastorm](https://github.com/alphastorm)).
- Collab hosts now acknowledge a writable guest's `ui-response` for an already-settled request with a targeted `ui-request-end`, so a guest that reconnected after the broadcast and resent its answer no longer waits forever ([#11561](https://github.com/can1357/oh-my-pi/pull/11561) by [@alphastorm](https://github.com/alphastorm)).
- Streaming edit guard (`edit.streamingAbort`) no longer aborts on no-op preview results when replacement content produces no file changes, and carries the native patch diagnostic through the abort reason on genuine preview failures.
- Repeated soft compaction now includes messages retained by the previous pass instead of silently dropping them from model context.
- Fixed the ask dialog splattering option descriptions and previews one word per row when a model injects `\r` runs into tool-call string values (observed with GLM via OpenRouter); stray carriage returns are now sanitized in ask params, the live dialog, and ask transcript rendering ([#11167](https://github.com/can1357/oh-my-pi/pull/11167) by [@Giardi77](https://github.com/Giardi77)).
- `omp models` now reports whether a model's images actually reach the provider, so an id stripped by a text-only catalog rule no longer shows `images: yes` ([#9697](https://github.com/can1357/oh-my-pi/issues/9697)).
- Custom `Other` answers are now applied before the Ask dialog becomes interactive again, so the next Enter is no longer discarded ([#11558](https://github.com/can1357/oh-my-pi/pull/11558) by [@schickling-assistant](https://github.com/schickling-assistant)).
- Explicit per-model price overrides retain their configured flat rates instead of inheriting time-based pricing.
- Fixed wrong-typed `compat.stripImageInput` in `models.yml` being silently accepted, so the documented vision opt-out is now validated like its neighbours ([#11697](https://github.com/can1357/oh-my-pi/issues/11697)).

## [18.1.16] - 2026-09-09

### Added

- `/rename` without a title now generates a session name from recent conversation using the configured tiny model.
- Added opt-in experimental notes-backed context windows with persistent branch-local notes, searchable original session history, retained latest user requests, and a model-callable rollover tool, including in Code Mode.
- The `/resume` picker (Ctrl+L when bound to `app.session.resume`) marks the live session with a `current` label on its metadata line and focuses that row on open. ([#11381](https://github.com/can1357/oh-my-pi/pull/11381) by [@tkossak](https://github.com/tkossak))
- `/loop` accepts `--until '<cmd>'` / `--while '<cmd>'` to gate each iteration on a shell command's exit status, so a loop can stop on real project state instead of only a count or duration. ([#10858](https://github.com/can1357/oh-my-pi/pull/10858) by [@andyhite](https://github.com/andyhite))

### Fixed

- Fixed automatic recovery from proxied Python HTTP/2 stream resets and HTTP/1.1 chunked response interruptions, including continuation after completed tool calls ([#11160](https://github.com/can1357/oh-my-pi/pull/11160) by [@cyriusweng](https://github.com/cyriusweng)).
- Read error and preview rendering now sanitizes tabs and Windows-style CRLF (e.g. ssh host-key failures, tab-indented fetched content) so raw output can no longer tear the result frame.
- Unset `tiny` model roles now honor the configured `@smol` fallback in direct execution and the `/models` Roles view ([#11311](https://github.com/can1357/oh-my-pi/issues/11311)).
- Extension Control Center (`/extensions`) search now accepts `j` and `k`, so extensions like `jira`/`json` are searchable; bare `j`/`k` no longer move the list selection (use arrow keys or the configured `tui.select.up`/`down`) ([#11350](https://github.com/can1357/oh-my-pi/issues/11350)).
- Codex turns interrupted before terminal completion now auto-continue after resolved tool calls instead of stopping ([#11349](https://github.com/can1357/oh-my-pi/issues/11349)).
- Fixed the status line's `pi` brand/working segment double-padding the first separator, so every gap around a separator is a single space ([#11103](https://github.com/can1357/oh-my-pi/issues/11103)).
- `/handoff` no longer leaves the TUI in a running state when completion races with delayed session events ([#11263](https://github.com/can1357/oh-my-pi/issues/11263)).
- Fixed legacy Pi extensions failing to load when calling `ctx.isProjectTrusted()` in an event handler; the extension context now exposes it (always `true`, since OMP applies no project-trust gating) ([#7955](https://github.com/can1357/oh-my-pi/issues/7955)).
- Fixed Ctrl+Z jobs exiting successfully after `fg` instead of restarting the TUI because terminal teardown left Bun without a referenced event-loop handle while waiting for `SIGCONT` ([#8585](https://github.com/can1357/oh-my-pi/issues/8585)).
- Extensions loaded by the npm CLI now apply settings overrides to the active session, so generated agents and model choices remain isolated between sessions ([#11047](https://github.com/can1357/oh-my-pi/pull/11047) by [@mgpai22](https://github.com/mgpai22)).
- Live task dispatch now reloads added, changed, removed, and deleted project task and retry settings before resolving subagents ([#11191](https://github.com/can1357/oh-my-pi/issues/11191)).
- Reset `/loop` iterations combined with `--while` / `--until` no longer keep submitting without resetting when vibe mode is enabled while the condition command is still running; the loop now disables itself instead ([#10858](https://github.com/can1357/oh-my-pi/pull/10858)).
- Returning from a focused agent (Agent Hub) now re-renders the main session's queued steering/follow-up block instead of leaving it blank until the next repaint ([#11379](https://github.com/can1357/oh-my-pi/issues/11379)).

## [18.1.15] - 2026-09-08

### Added

- Added the `retry.waitForUsageReset` setting: when a provider reports usage-limit exhaustion with a reset time (5-hour or weekly quota windows on any provider), the session sleeps until the reset instead of failing fast past `retry.maxDelayMs`.
- Added `advisor.maxNotesPerUpdate` setting and `WATCHDOG.yml` configuration (default `4`): allows reasoning verifiers to batch findings in a single review update without being rate-limited.
- Headless browser tabs now freeze when a turn settles so idle animated/WebGL pages stop burning CPU/GPU, resuming automatically on next use; tabs idle past `browser.idleCloseSec` (default 30 minutes) are closed. `persist: true` on `browser.open` opts a tab out of both ([#8246](https://github.com/can1357/oh-my-pi/issues/8246) by [@H4vC](https://github.com/H4vC)).

### Changed

- When enabled (`task.showResolvedModelBadge`), subagent model badges show the thinking-level icon, model name, and attached-advisor eye before the agent name in task, eval, job, and HUD rows.

### Fixed

- Task descriptions containing tabs no longer misalign or overflow task rows; tabs are expanded before measuring and rendering.
- GitHub Copilot model-policy 403s (plan, model policy, org restriction) no longer delete stored credentials, so the provider stays listed in `/model` after a per-model access denial instead of disappearing until the next `/login` ([#11280](https://github.com/can1357/oh-my-pi/pull/11280) by [@H4vC](https://github.com/H4vC)).
- Bash results no longer replace a failing command's output with the shell minimizer's lossy summary when the original capture cannot be persisted as an artifact; the raw diagnostics are kept so a failure stays actionable ([#11081](https://github.com/can1357/oh-my-pi/issues/11081)).
- Fixed worker subprocesses failing to declare themselves as worker hosts before dispatching selectors, which prevented nested thread worker spawns during `/usage` stats sync on multi-core systems.
- Fixed `/usage` displaying a misleading generic database read failure when activity loading fails; the error detail is now sanitized, collapsed to a single line with shortened paths, and surfaced in the dashboard.
- Advisor notes now report rate limiting accurately, blockers always interrupt even after a lower-severity note in the same update, and deferred notes flush when the primary run completes, including after advisor quota exhaustion ([#11062](https://github.com/can1357/oh-my-pi/issues/11062)).
- Fixed the built-in clangd registration omitting CUDA source and header files (`.cu` and `.cuh`) ([#10782](https://github.com/can1357/oh-my-pi/pull/10782) by [@alphastorm](https://github.com/alphastorm)).
- Fixed `ast_grep` skipping CUDA headers and ignoring an explicit `lang` override for ambiguous file extensions ([#10782](https://github.com/can1357/oh-my-pi/pull/10782) by [@alphastorm](https://github.com/alphastorm)).
- Python cells are no longer replayed automatically after a kernel crash, preventing duplicate side effects; the next call starts a fresh kernel.
- Session rewrites preserve open-reader snapshots and replacement identity when a rename needs an EPERM fallback.
- Fixed WorkPool children retaining a stale Gemini-formatted `yield` declaration when pooled items were installed or cleared.
- Preserve effective context and output limits when model overrides change unrelated settings, such as thinking effort levels.

Older entries are archived in [packages/coding-agent/CHANGELOG.md@47b1156699bb](https://github.com/can1357/oh-my-pi/blob/47b1156699bb852a157216acec52ff743d992dca/packages/coding-agent/CHANGELOG.md).
## [18.1.14] - 2026-09-07

### Fixed

- `omp update` now refuses to overwrite shebang scripts or non-OMP executables behind foreign symlinks and reports the physical binary path it verified ([#11152](https://github.com/can1357/oh-my-pi/issues/11152)).
- The startup update notice counts every change in a release: bullets written above a `###` heading now count under `Other`, and `+`/`*` markers and lightly indented bullets count like `-`.
- Fixed Codex Astra retaining its larger window after disabling Extended Context, including cached models; explicit model overrides still take precedence.
- Fixed explicit Codex context-window overrides widening past the server-honored maximum; they now clamp to the documented ceiling like upstream Codex ([#11157](https://github.com/can1357/oh-my-pi/pull/11157) by [@H4vC](https://github.com/H4vC)).
- Fixed Astra's extended window over-advertising input by 128K; it now uses the documented 922K input cap inside the 1.05M total context ([#11157](https://github.com/can1357/oh-my-pi/pull/11157) by [@H4vC](https://github.com/H4vC)).
- Bills Astra API requests above 272K input at the documented 2x input / 1.5x output long-context tier; the Codex subscription route stays exempt with free cache writes ([#11157](https://github.com/can1357/oh-my-pi/pull/11157) by [@H4vC](https://github.com/H4vC)).
- Fixed Extended Context silently enabling without a settings source (SDK embedding, early boot); it now matches the off default until opted in ([#11157](https://github.com/can1357/oh-my-pi/pull/11157) by [@H4vC](https://github.com/H4vC)).
- Fixed `/copy` link captions showing Markdown delimiters for formatted labels and splitting across two rows for multiline labels ([#11086](https://github.com/can1357/oh-my-pi/pull/11086) by [@mustafaabidali](https://github.com/mustafaabidali)).
- Fixed Ask custom answers requiring another submission after paste or remaining on the same multi-select question; pending clipboard text is preserved before submission, and single-question multi-select answers still go through review ([#11099](https://github.com/can1357/oh-my-pi/pull/11099) by [@camjac251](https://github.com/camjac251)).
- The startup update notice no longer counts standalone `* * *` and `- - -` separator lines as changes.
- Fixed `/loop` replacing the repeating prompt with a mid-turn interjection; steering while the agent runs is now one-off, and only an idle submission becomes the new loop body ([#11159](https://github.com/can1357/oh-my-pi/pull/11159) by [@H4vC](https://github.com/H4vC)).
- Fixed `--plugin-dir` and omp-installed plugin agents no longer being discovered when the foreign `claude-plugins` source is disabled; user-scope plugin agent roots are now gated by origin like their skills ([#11151](https://github.com/can1357/oh-my-pi/issues/11151)).

## [18.1.13] - 2026-09-07

### Fixed

- Fixed GPT-6 Astra requiring `/extended-context` for its full context window: it now keeps the documented 1.05M-token window with the setting on or off, and explicit per-model `contextWindow` overrides still win.

## [18.1.12] - 2026-09-06

- Fixed edit and write results to report the formatted bytes actually committed by LSP writethrough.

### Added

- Added `/prewalk restart` to return an active session to its `@default` model and re-arm the one-shot handoff to `@smol`.

### Changed

- Ranged reads of text without bracket characters skip unnecessary lexical context scanning.
- Muse Code sessions send a compact hashline edit description (~3 KB less per request); all other models keep the full prompt.
- Transcript usage row now shows the prompt-to-yield time as a bare delta, keeping the clock icon for time to first token only.

### Fixed

	- Fixed GPT-6 Astra extended-context support and preserved maximum context windows reported by OpenAI Codex discovery ([#10980](https://github.com/can1357/oh-my-pi/pull/10980) by [@H4vC](https://github.com/H4vC)).
- Subagent `yield` no longer rejects a valid `data` payload because a non-strict OpenAI-compatible backend filled the optional `error` field with `""`; previously the worker retried the identical call until the invalid-yield cap and the parent received nothing.
- Fixed fullscreen `/copy` outlining only a lazily created grouped Read card, so Enter copies the assistant yield instead of tool output.
- `memory://` now resolves against the session that issued it: a caller's own memory backend answers `memory://<id>`, so co-located sessions no longer read each other's memory rows, and a caller whose session is no longer live fails closed instead of being answered by a peer. Prompt completion binds to the same caller, so `memory://<memory-id>` stays on offer while a subagent shares the working directory. Advisors retain their owning session's memory access even without a session file.
- Fullscreen `/copy` now opens on the recent tail of the branch instead of replaying the whole session, so it appears immediately and steps without lag on long sessions (`a` loads the earlier turns). Both it and the esc-esc rewind selector also cache each transcript row set instead of re-stripping it every frame.
- Fixed the fullscreen `/copy` and esc-esc rewind selectors repainting the whole frame for a wheel notch that cannot move the viewport; because both open scrolled to the newest turn, wheeling down there made the frame twitch.
- The default `omp commit` agent now uses its displayed COMMIT model and honors `--model` instead of silently running on SMOL ([#10991](https://github.com/can1357/oh-my-pi/issues/10991)).
- Fixed JavaScript `eval` `completion()`/`agent()` handles so the documented immediate-handle pattern works: `h.wait()`, `h.status()`, and the other handle methods now work on the un-awaited factory result ([#10986](https://github.com/can1357/oh-my-pi/issues/10986)).
- Fixed frame skips while streaming long markdown Write previews ([#10955](https://github.com/can1357/oh-my-pi/issues/10955)).
- LiteLLM discovery no longer caches an empty catalog after a timed-out run: a rich-metadata timeout now falls back to `/v1/models`, and a discovery failure with no prior catalog leaves the cache untouched so the next launch retries immediately instead of hiding discovery-only models ([#10964](https://github.com/can1357/oh-my-pi/issues/10964)).
- Searching `free` in the model picker now finds every zero-cost model, not just the ones with `free` in their id.

## [18.1.11] - 2026-09-05

### Added

- Added the `retry.waitForUsageReset` setting: when a provider reports usage-limit exhaustion with a reset time (5-hour or weekly quota windows on any provider), the session sleeps until the reset instead of failing fast past `retry.maxDelayMs`.
- Added opt-in `bash.allowCompoundCommands` approval for conservative literal `&&` chains, with ordered per-segment rules and normal bash policy fallback for unmatched segments. The opt-in requires a positively classified POSIX-quoting shell; incompatible and unknown shells retain legacy approval. Whole-chain denies take precedence over earlier prompts.

### Fixed

- Idle compaction now starts or reschedules when its enabled state, threshold, or delay changes while a session is already idle ([#10242](https://github.com/can1357/oh-my-pi/issues/10242)).
- Fixed `todo` and other tools called through eval rejecting optional `None`/`null` arguments that direct tool calls accept.
- Report oversized selected lines that cannot fit after read context, with a working raw recovery selector instead of a looping continuation hint ([#10775](https://github.com/can1357/oh-my-pi/issues/10775)).
- Approved plan content is now inlined into approve-and-execute prompts instead of forcing the executor to re-read the durable plan file ([#10923](https://github.com/can1357/oh-my-pi/issues/10923)).
- Fixed WorkPool child sessions crashing during startup while constructing their incremental `yield` tool schema.
- Commit summaries written in Vietnamese, Korean, and other accented scripts are no longer rejected for exceeding the length limit, and keep their accents as typed.
- Tool-scoped TTSR rules now match finalized arguments reliably when providers stream short or throttled tool calls ([#10910](https://github.com/can1357/oh-my-pi/issues/10910)).
- Restored `getSupportedThinkingLevels` in the legacy `pi-ai` shim so extensions importing it from `@earendil-works/pi-ai` (e.g. `@companion-ai/feynman`) pass Bun's named-export check and load ([#10800](https://github.com/can1357/oh-my-pi/issues/10800)).

## [18.1.10] - 2026-09-04

### Changed

- Subagent `yield` now takes `data`/`error` directly instead of nesting them under a `result` wrapper.

### Fixed

- Fixed Codex V2 remote compaction rebuilding the request prefix differently from normal turns, restoring prompt-cache reuse ([#10786](https://github.com/can1357/oh-my-pi/issues/10786)).
- Restored mouse clicks, hover, and wheel scrolling in Plan Review.

## [18.1.9] - 2026-09-04

### Breaking Changes

- Browser and computer automation now use JavaScript/Python evaluation preludes with reusable tab and element handles, replacing the previous standalone tool schemas and object-shaped run APIs.
- Replaced the `inspect_image` tool and `/vision` controls with `read <image>?q=<question>` for image questions; text-only models now receive image metadata and guidance for using this selector.
- Renamed `inspect_image.timeoutMs` to `images.questionTimeoutMs`; existing settings are migrated automatically.

### Added

- Bash now extracts Kitty and Sixel terminal graphics as image results for foreground, failed, manual, and background executions.
- Markdown links to existing local files and resources are now clickable while preserving their displayed URLs.
- Added `/switch <model>` for session-only model changes, with the same model selectors and completions supported by `--model`; ACP `/model <model>` accepts these selectors as well.
- Added the `worktree.cleanSource` setting to reset and clean the original checkout when creating a worktree with `/wt`.
- Expanded the computer JavaScript/Python evaluation prelude with direct desktop, window, screenshot, accessibility, and element interaction helpers, while keeping `computer.run` available for multi-step scripts.

### Changed

- Agent delegation is now model-aware, allowing some models to favor focused inline work instead of spawning subagents.

### Fixed

- Fixed fallback authorization-code prompts remaining active after native OAuth callback completion.
- Fixed reciprocal idle subagents repeatedly waking one another indefinitely.
- Fixed `/wt` and `git worktree add` failing when the new worktree targeted the same commit as the clean source checkout.
- Fixed omp-installed marketplace plugins and `--plugin-dir` plugins losing their skills when the Claude plugin source was not separately enabled ([#10743](https://github.com/can1357/oh-my-pi/issues/10743)).
- Fixed session accent colors rendering as bright white in terminals without truecolor support, including Terminal.app ([#10759](https://github.com/can1357/oh-my-pi/issues/10759)).
- Rules with `enabled: false` frontmatter are now omitted during discovery, matching disabled skills ([#10769](https://github.com/can1357/oh-my-pi/issues/10769)).
- Fixed large MCP tool-result previews losing the relevant tail content when an oversized output line preceded it ([#10761](https://github.com/can1357/oh-my-pi/issues/10761)).
- Fixed `Ctrl+V` replacing CJK characters with `?` when pasting from XWayland clipboard owners on Wayland ([#10762](https://github.com/can1357/oh-my-pi/issues/10762)).
- Fixed byte-limited artifact reads reporting the displayed byte count instead of the actual read limit ([#10764](https://github.com/can1357/oh-my-pi/issues/10764)).
- Fixed read-tool truncation notices incorrectly reporting zero delivered lines or bytes when previewing a partial oversized line ([#10768](https://github.com/can1357/oh-my-pi/issues/10768)).
- Fixed Mnemopi removing explicitly retained or learned long-term memory after sessions longer than 24 hours by consolidating eligible working memory at session start ([#10770](https://github.com/can1357/oh-my-pi/issues/10770)).

### Removed

- Removed the librarian agent.
- Fork builds now report that canary updates are unavailable instead of attempting the upstream npm channel; stable updates continue through verified GitHub release binaries.
- Fixed two idle subagents exchanging a single IRC message ping-ponging forever: wake-turn relays are now tagged and never relayed back, so each automated relay is delivered exactly once instead of waking a reciprocal relay until manual cancellation.

## [18.1.8] - 2026-09-03

### Fixed

- Improved background task results with structured output schemas: parsed results are now available through the `agent://<id>` resource, while large or invalid inline JSON is replaced with a reliable pointer to the complete result.
- Background task artifacts are retained long enough for follow-up turns to read them, including failed tasks that lack valid structured output, and are cleaned up without blocking shutdown or leaking resources.
- Fixed context compaction incorrectly accepting archived history that was larger because of opaque reasoning data, allowing the next compaction strategy to run instead.
- Fixed the Model Hub sidebar jumping to the top when provider refreshes rebuild the list; the focused model, or its nearest remaining entry, is now preserved.
- Fixed the `inspect_image` status hint showing the wrong model after switching between image-capable model roles.
- Fixed multi-minute TUI freezes during subagent activity and batch execution.

## [18.1.7] - 2026-09-03

### Breaking Changes

- Removed the Ruby and Julia eval backends and related interpreter configuration; eval now supports Python and JavaScript only.
- Removed the eval parallel() and pipeline() helpers. agent() and completion() now return handles immediately, and wait(handles) provides synchronization.
- Python eval tool calls are now asynchronous coroutines, matching JavaScript; use await tool.read({...}) and similar calls.

### Added

- Added asynchronous eval agent and completion handles with status, cancellation, messaging, waiting, and automatic result delivery for unwaited background work.
- Added eval workpools for queueing items onto the least context-loaded keep-alive subagent with configurable concurrency; the pool name is its async-job ID for `hub wait`, `.peek()` gives a non-consuming snapshot, per-item `{key, data|error}` yields finish batches incrementally, and `eval.workpool.freshAgents` opts into a new agent per item.
- Added support for defining eval tools in Python with @tool or JavaScript with tool(fn, schema), and exposing them to subagents through task, agent, and workpool calls. Configure availability with eval.tools.enabled.
- Added native Windows ARM64 binaries with architecture-aware installation and updates.
- Added an MLX backend for running local tiny models on Apple silicon. Configure providers.tinyModelDevice=mlx, or use PI_TINY_DEVICE=mlx or metal, to run title generation, memory tasks, and automatic thinking classification with MLX models, with an ONNX CPU fallback when Python is unavailable.
- Added Qwen3 1.7B as a local memory and thinking-classification model for the MLX backend.

### Changed

- Local tiny models for titles, memory, and automatic thinking classification now share on-demand workers across omp processes, reducing redundant resource usage; workers stop automatically after inactivity.
- PI_TINY_DEVICE=metal now selects the MLX backend on macOS.
- Updated agent reactions to trigger on the opening emoji instead of requiring a newline, consuming any following whitespace.

### Fixed

- Fixed transient provider retries incorrectly failing with an “Agent is already processing” error.
- Fixed user-scope marketplace plugins installed through omp losing their skills when the Claude plugin source was not separately enabled.
- Fixed hashline edits failing when targets included apply_patch markers, while rejecting ambiguous bracketed targets instead of editing the wrong path.
- Fixed bracketed hashline edit targets being reported as undefined to extension path allowlists.
- Fixed MCP tools discovered during startup disappearing after plan-mode approval or when leaving default-on plan mode.
- Fixed ACP clients receiving invalid file locations or updates for released terminals, preventing invalid worktree scans and terminal errors on Windows.

## [18.1.6] - 2026-09-03

### Breaking Changes

- Replaced the local session-title model choices with LFM2.5 230M, LFM2.5 350M, and Falcon H1 Tiny 90M.
- Reserved main and sub as built-in subagent definition names; custom agents can no longer use these names.

### Added

- Added agent reactions: a reply that opens with a lone emoji line shows the emoji as a badge on your message bubble instead of in the text; toggle the prompt invitation with the tui.reactions setting.
- Added video attachment and reading support through ffmpeg, including preview grids with metadata and timestamp/frame selectors such as :412 and :1h5m42s.
- Enhanced the model picker with intelligence indicators, catalog TPS estimates, provider-aware ranking, and provider-supplied badges and descriptions.
- Added detailed, non-summarized findings for scout agents through the report definition field, and subagent result relay so read-only agents can return data to their originating agent.
- Added agent-scoped rules using an agents frontmatter field with glob matching, including support for inspecting applicable rules with omp ttsr list and omp ttsr test --agent.
- Added non-interrupting extension messages through deliverAs: "aside" for pi.sendMessage and pi.sendUserMessage.
- Added copy and open controls for rendered blocks and links, including /copy link and the /open command.
- Added option-click cursor positioning in the prompt entry box.
- Added the configurable opencode display layout, with a corresponding first-run and upgrade setup option.
- Added the skillful prompt setting and /skillful command to control whether available skills are listed in the system prompt.
- Added Firecrawl as an optional providers.fetch backend for URL reading, configurable with FIRECRAWL_API_KEY and FIRECRAWL_BASE_URL.
- Added provider request metadata configuration for usage and cost attribution, including Amazon Bedrock request headers and User-Agent customization.
- Added the :-N read selector for reading the last N lines from files, directories, archives, artifacts, internal URLs, and web URLs, including combinations such as :raw:-60.
- Added an opt-in extension status-line segment for displaying custom statuses inline.
- Added injectV1: false to openai-models-list discovery for OpenAI-compatible gateways whose model endpoint is rooted at a versioned URL.
- Added provider-reported credits and routed-model counts to /session statistics.
- Added CLINE_API_KEY to the CLI environment help for native ClinePass subscription inference.
- Expanded Devin model selectors to support native CLI aliases, dotted upstream names, and dynamic effort-route identifiers.
- Standalone CLAUDE.md files in the project root and ancestor directories are now loaded as project context alongside AGENTS.md files.

### Changed

- Session history is now sorted by modification time, then creation time, then file path.
- Increased the maximum file snapshot size to 4 MB.
- Edit tools now provide streamed diff previews while applying changes.
- Approved plan content is included directly in agent history, reducing redundant reads.
- power.sleepPrevention now works on Linux and Windows. Its idle default keeps long-running sessions awake on those platforms; set it to off to restore the previous behavior.
- Unsupported-model errors no longer include incorrect retry instructions.

### Fixed

- Fixed local title models receiving unsupported online examples and failing with certain tokenizer templates.
- Fixed model picker search selection so it moves to the best matching result after results change.
- Fixed /new sometimes reviving the previous conversation in the current process or after a restart.
- Fixed raw text escaping in agent responses.
- Fixed structured subagent result previews being truncated incorrectly.
- Fixed /usage taking several seconds to become responsive on large statistics databases.
- Fixed the status line not appearing correctly in the first startup frame.
- Fixed shell builtins reporting broken-pipe errors when downstream commands exit early.
- Fixed provider-qualified model roles with dotted revisions resolving to the wrong provider or model.
- Fixed agent-scoped rules being lost when subagents are restored, and fixed rule:// URLs and rule inspection to consistently use the calling agent's applicable rules.
- Fixed extension and user asides being stranded, delivered to the wrong session, or incorrectly interrupting or restarting turns during session changes and image processing.
- Fixed parent steering messages arriving during a subagent's final result from preventing that result from being committed.
- Fixed messages typed while an edit or write tool was streaming from discarding the completed tool call and triggering unnecessary regeneration.
- Fixed self-hosted Firecrawl URLs with origin-only base URLs from gaining an extra slash.
- Fixed omp commit auto-staging from including macOS Unicode-normalization duplicates or files ignored by nested .gitignore rules.

## [18.1.5] - 2026-09-03

### Added

- Added Abliteration provider support to `/login`, including `ABLITERATION_API_KEY` configuration and help text.
- Added clone-first Git worktree support that carries over ignored build artifacts when creating worktrees, with a configurable `worktree.clone` setting and fallback to a standard checkout. This is supported by `github pr_checkout`, `omp worktree add`, and `git worktree add` commands entered through the Bash tool.
- Added the `omp worktree add` command with Git-compatible branch, detach, path, and commit options.
- Added `/wt` (alias `/worktree`) to create a linked worktree with uncommitted changes and move the current session into it while leaving the original checkout untouched.

### Changed

- Foreign user-level configuration sources (`~/.cursor`, `~/.codex`, `~/.claude`, `~/.gemini`, `~/.config/opencode`, `~/.codeium/windsurf`) are now opt-in via `enabledProviders`, while project-level configurations in CWD and `.agents` continue to load by default.
- Split subagent isolation configuration into `task.isolation.enabled` and `isolation.backend`; existing `task.isolation.mode` settings are migrated automatically.
- Updated the built-in `smol` and `slow` model priority chains to favor newer recommended models and remove older model generations.
- Improved unsupported-model error messages by removing retry guidance that does not apply.

### Fixed

- Fixed automatic title generation so `--no-title` also prevents todo-initialization title refreshes, while automatic titles retain the selected OAuth account without sharing foreground request identity.
- Fixed provider errors so they wrap to the terminal width and remain readable in the transcript and pinned error banner, with long messages available through the expansion hint.
- Fixed Gemini malformed function-call turns so textual tool-call output is rejected conversationally and the session can continue instead of stopping with a pinned error.
- Fixed auto-compaction recovery getting stuck in repeated retries when models return empty length-limited responses; it now stops with an actionable error.
- Fixed MCP servers failing to reconnect after transient startup handshake timeouts.
- Fixed programs supervised by `hub start` hanging when querying terminal capabilities.
- Fixed large pastes followed immediately by Enter so the input is submitted with the pasted content instead of being left in the large-paste menu.

### Removed

- Removed the bundled `designer` subagent and `designer` model role; `modelRoles.designer` and `@designer` are no longer built in.

## [18.1.3] - 2026-09-02

### Changed

- The `doubleEscapeAction` setting now accepts `tree`, so double-Escape can open the session tree instead of the rewind selector.
- Updated the visual representation for the IRC tool from "irc" to "#"
- Rewinding to a user message (double-Escape, `/branch`) now branches within the current session — the old path stays reachable in `/tree` — instead of forking a child session; `/rewind` is an alias for `/branch` ([#10565](https://github.com/can1357/oh-my-pi/pull/10565) by [@anatoli-tsinovoy](https://github.com/anatoli-tsinovoy)).

### Fixed

- Active sessions now keep memory proportional to truncated raw SSE and tool outputs instead of retaining complete oversized backing strings ([#10547](https://github.com/can1357/oh-my-pi/issues/10547)).
- Anthropic sessions now keep tool-roster changes and warm-prefix pruning from invalidating preserved thinking or the prompt cache.
- TypeScript code intelligence now works on TypeScript 7 projects: the built-in `typescript-native` server runs `tsc --lsp --stdio` when the resolved TypeScript install no longer ships `tsserver.js`, replacing `typescript-language-server` for that project.
- Claude marketplace MCP servers now resolve environment placeholders in stdio environment values instead of passing strings such as `${NAME:-}` literally ([#10481](https://github.com/can1357/oh-my-pi/pull/10481) by [@mrexodia](https://github.com/mrexodia)).
- Fixed prewalk conflicting with `todo.eager=always`: the forced eager-todo prelude ("call todo first this turn") was injected alongside the prewalk plan nudge ("write a complete plan first, then todo"), giving the model contradictory instructions; the eager-todo prelude is now suppressed only when prewalk will perform a handoff ([#10510](https://github.com/can1357/oh-my-pi/issues/10510)).
- Fixed `authHeader: true` + command-backed `apiKey` discovery providers (no explicit `headers:` block) resending a stale bearer after a 401 force-refresh; discovered models now re-derive `Authorization` from the live `apiKey` each request ([#10551](https://github.com/can1357/oh-my-pi/issues/10551)).
- Fixed the embedded shell's `command -v`/`-V` honoring only the first operand: it now iterates every name like bash/zsh, printing one line per resolved name and skipping misses ([#10544](https://github.com/can1357/oh-my-pi/issues/10544)).
- Fixed hard-killed subagents vanishing from the agent registry under concurrent fan-out: `AgentLifecycleManager.release` now applies the terminal `aborted` transition before awaiting the tombstone sidecar write, closing a race where the dying session's own dispose-path unregister deleted the ref instead of leaving it as a tombstone ([#10531](https://github.com/can1357/oh-my-pi/issues/10531)).
- `omp commit` now keeps extension-provided model credentials available in its nested commit-agent session ([#10528](https://github.com/can1357/oh-my-pi/issues/10528)).
- MCP tool results now surface `structuredContent`: servers that return their payload in the structured channel while keeping `content` a terse ack (e.g. rhizome-mcp) are no longer data-less to the model ([#10522](https://github.com/can1357/oh-my-pi/issues/10522)).
- Fixed the Agent Hub roster shuffling erratically while open: rows no longer re-sort on every agent heartbeat, so the list stays stable and navigable with many active agents ([#10524](https://github.com/can1357/oh-my-pi/issues/10524)).
- Exiting Vibe mode now removes its restrictions from subsequent model turns, including restored sessions ([#10500](https://github.com/can1357/oh-my-pi/issues/10500)).
- Fixed all-sessions listing (`Tab` in session picker) and cross-project resume failing when sessions are stored under `XDG_DATA_HOME`; `listAllSessions` now scans the active `getSessionsDir()` root instead of hardcoding `~/.omp/agent/sessions`.
- Fixed the Nerd Font context icon showing a Windows logo instead of a generic window ([#10476](https://github.com/can1357/oh-my-pi/pull/10476) by [@erickmazer](https://github.com/erickmazer)).
- The debug terminal snapshot now reports Herdr (and CMUX) as the multiplexer wrapping the session, matching the TUI's pane-identity detection instead of only tmux/screen/zellij.
- Fixed vibe mode becoming un-exitable after branching a session (including via `/btw`), which previously failed with "Vibe parent session changed before mode exit could be persisted." ([#10468](https://github.com/can1357/oh-my-pi/issues/10468)).
- Fixed HTML session exports reordering interleaved assistant text, thinking, images, and tool calls in the transcript, and split matching text/tool sidebar rows with block-accurate navigation. ([#10253](https://github.com/can1357/oh-my-pi/pull/10253) by [@realcoderandom](https://github.com/realcoderandom))
- Fixed the built-in `grep` and `sed` treating a basic regular expression as an extended one: a bare `+` is now the literal and `\+` the operator, patterns like `^+` or `s/^\+/` no longer match every line, `^` anchors inside `\(…\)` and after `\|`, and a repetition operator with nothing to repeat is reported instead of silently selecting the whole file ([#10298](https://github.com/can1357/oh-my-pi/pull/10298) by [@mruangutai](https://github.com/mruangutai)).
- Fixed RPC `prompt` responses for `/skill:*` commands arriving only after the entire prompt-dispatch pipeline finished (usage preflight, compaction, provider calls): under provider stress that outlasts any client prompt timeout, so hosts reported the prompt as rejected while the turn was in fact running. The skill branch now builds the skill prompt eagerly (preserving the immediate error for an unreadable skill file) and dispatches the expensive pipeline asynchronously after answering, matching plain prompts; when the dispatch is cancelled before a turn starts (e.g. an abort overtakes usage preflight), the session now reports it through the non-invoked  completion frame instead of leaving hosts waiting for an  that never comes ([#10249](https://github.com/can1357/oh-my-pi/pull/10249) by [@cwr250](https://github.com/cwr250)).
- Fixed stale `omp-plugins.lock.json` entries loading leftover `node_modules` trees for plugins no longer declared in an existing `package.json` — the orphaned copy double-loaded its extensions. Lockfile-only plugins remain supported for manifest-less roots and symlinked packages (`omp plugin link`, marketplace runtime packages); stale entries are skipped with a warning.

## [18.1.2] - 2026-09-01

### Added

- Recover stray <SM:EDIT> payloads emitted as plain text into real edit tool calls, with support for disabling this behavior through the edit.recoverInlineEdits setting.
- Advisors now receive context from the active memory backend, including project decisions and recalled instructions; advisors also gain the recall tool when supported by the backend.

### Changed

- Replaced the sloppy edit format's symbolic markers with a clearer XML-based format using <SM:EDIT>, <SM:FIND>, and <SM:PUT> tags. Edit errors now include copy-ready XML payloads.
- Increased the default input delay for the trace CLI to 3 seconds.

### Fixed

- Improved chat history stability in long-running sessions by avoiding unnecessary updates when date or directory context changes.
- Fixed the trace CLI hanging during proxy connections and added support for forward HTTP proxies.
- Fixed newly started sessions using stale model context-window limits after background model discovery completes; the active model now refreshes automatically so context usage and compaction thresholds match the model catalog.

## [18.1.1] - 2026-09-01

### Fixed

- Fixed a native crash (and multi-gigabyte committed-memory growth held until exit) when git status ran over worktrees with tens of thousands of untracked files: whole-worktree porcelain status now runs through the git CLI with bounded output capture, falling back to the in-process gitoxide walk only when git is not installed, and any panic escaping a native VCS operation now surfaces as a structured `VcsError` instead of a process-level failure.

## [18.1.0] - 2026-09-01

### Added

- Added the `/trace` slash command to display session trace URLs in the stats dashboard.
- Added support for OpenAI-compatible gateways whose model-list endpoint is rooted at a versioned URL, with an `injectV1: false` discovery option to request `{baseUrl}/models` directly.
- Added provider-reported credits and concrete routed-model counts to `/session` statistics.
- Added `CLINE_API_KEY` to CLI environment help for native ClinePass subscription inference.
- Expanded Devin model selection to support native CLI aliases, dotted upstream model names, and raw effort-route identifiers.
- Added provider-supplied model metadata to `/models`, including new, beta, and recommended badges plus model descriptions.
- Standalone `CLAUDE.md` files in project and ancestor directories are now loaded as context alongside `AGENTS.md`, while preserving config-directory precedence.
- Added an Activity view to Agent Hub with searchable and filterable timelines spanning live progress and persisted transcripts; `/hub` is now the live-operations entry point while `/agents` retains Control Center behavior.
- Added an `icon.advisorClosed` symbol-theme token: the advisor eye in the status line now closes once the advisor has finished reviewing and will not add further comments.

### Changed

- Disabled hashline editing for Kimi, Mimo, DeepSeek Flash, and Stepfun models for improved stability.
- Reworked `/usage` into a fullscreen dashboard overlay (no transcript output): a compact per-provider subscriptions grid with untouched providers collapsed into one line, a GitHub-style daily activity heatmap fed by local stats, and the classic full report one keypress away.
- Reworked transcript navigation with a fullscreen rewind selector opened by double-Escape, supporting rendered-item navigation, user-turn jumps, branching rewinds, and alternate session-tree branch selection.
- Updated `/copy` to use the fullscreen transcript selector, allowing users to copy a turn or navigate into nested content such as code, quotes, commands, and tool output.

### Fixed

- Improved edit-tool error guidance for operations missing the `»` separator, identifying redundant context-only operations
- Fixed OAuth provider `modifyModels` projections being silently dropped after a discovery refresh introduced live-config headers.
- Edit-tool `＋`/`－` line operations now match their anchors leniently across whitespace drift (indentation, blank-line miscounts) instead of failing with a byte-for-byte error; a note reports the lenient match.
- Fixed an edit-tool REWRITE consisting only of `＋` add lines silently replacing (deleting) the matched text; it now inserts after the kept MATCH.
- Edit-tool no-match errors now name MATCH lines that exist nowhere in the file and suggest marking them with `＋`, and errors without a located region no longer append a misleading file-head "closest match" preview.
- Fixed ordinary CLI startup eagerly loading the computer worker graph (native desktop addon and early environment), restoring lazy startup and profile `.env` ordering.
- Fixed online auto-thinking classifier usage being omitted from session token and cost totals.
- Fixed image generation with custom provider endpoints when using `openai-codex` credentials and a non-OpenAI chat model.
- Fixed custom hook UI factories not receiving the documented `keybindings` argument.
- Fixed MCP OAuth token exchange for authorization endpoints that use a different resource indicator.
- Fixed custom extension `web_search` tools being shadowed by the built-in search tool.
- Fixed Agent Hub task boards collapsing to summary rows after returning from a focused session.
- Improved Linux ARM64 browser startup messaging when managed Chrome for Testing builds are unavailable, with guidance for using system Chromium or `PUPPETEER_EXECUTABLE_PATH`.
- Fixed resuming image-heavy sessions that previously terminated while replaying transcripts.
- Fixed custom agents declaring `hub` being incorrectly treated as read-only.
- Restored compatibility for legacy Pi extensions that import `calculateContextTokens` or use the synchronous `SettingsManager.create()` API.
- Fixed custom model overrides being lost during configuration updates.
- Clarified that the default task-delegation setting follows the selected model's policy.
- Fixed `/rename` without a title interrupting active session activity.
- Fixed the Nerd Font notification persisting incorrectly after theme configuration.
- Fixed sampling parameter errors with newer Anthropic models.
- Long OpenCode Go usage-limit waits now switch replay-safe turns to a configured alternate provider when the delay exceeds `retry.maxDelayMs`.
- Fixed OpenAI Codex Responses tool results being lost when composite and plain tool-call identifiers did not match.
- Fixed `/tan` background agents failing to resolve credentials for providers supplied by extensions.
- Fixed Mnemopi saving session transcripts on exit when automatic retention is disabled.
- Fixed configuration writes through chained symlinks so the final target and intermediate links are preserved.
- Fixed direct tool calls using full `xd://` device URLs.
- Fixed command-backed headers in custom discovery providers being resolved for discovered models.
- Fixed Windows drive paths pasted under WSL being resolved through their `/mnt/<drive>` mounts for images and file reads.
- Improved sloppy/SPARSE edit no-match guidance so low-confidence matches are clearly presented without unsafe copy-ready operations.
- Fixed agents in Hub wait loops failing to respond to user steering messages.
- Fixed `/tan` sessions inheriting parent costs and overstating subagent totals.
- Fixed prompt action labels being truncated.
- Fixed assistant text being truncated when a tool call begins during streaming.
- Fixed the advisor dropping concerns when catching up on multiple turns and improved review context with bounded tool-result excerpts plus complete `ask` exchanges.
- Fixed bash command timeouts being delayed by child processes holding output pipes open, while improving timeout reporting and cleanup.
- Fixed retry countdowns and capped-wait errors displaying floating-point noise in millisecond durations.
- Prevented browser `app.path` from terminating existing same-executable applications when no reusable CDP endpoint is available.
- Fixed top-level errors overwriting the active composer before terminal restoration.
- Fixed Enter being ignored during the first turn when omp starts with an initial prompt.
- Fixed idle compaction discarding context while the session was still waiting on a backgrounded async job ([#10223](https://github.com/can1357/oh-my-pi/pull/10223) by [@mattwilkinsonn](https://github.com/mattwilkinsonn)).
- Fixed LSP idle timeout clobbering in multi-workspace sessions and unmanaged timer spawning on pure config reads ([#10237](https://github.com/can1357/oh-my-pi/pull/10237) by [@harshaygadekar](https://github.com/harshaygadekar)).

## [18.0.11] - 2026-08-29

### Added

- Added gallery previews for composer and status-line components, with CLI filters for browsing by surface, composer, or segment.

### Changed

- The status line now displays the thinking level as a compact icon alongside the model name by default; set `statusLine.compactThinkingLevel` to `false` to restore the previous display.

### Fixed

- Fixed MCP OAuth discovery for shared API gateways and authorization servers with nested paths, including Keycloak realms, so authentication targets the correct resource issuer and supports endpoint and dynamic client-registration discovery.
- Fixed credential rotation for HTTP 402 payment-required responses so sibling credentials are tried before model fallback without misclassifying informative non-quota errors.
- Transport errors after a complete, non-executed tool call can now retry through configured retry budgets and fallback chains when it is safe to do so, instead of ending the turn prematurely.
- Improved handling of truncated or otherwise undecodable images so they produce an actionable error and no longer permanently block subsequent requests or resumed sessions.
- Fixed Sharpshooter consolidation preserving memory files and queued changes when an empty replacement is returned.
- Fixed `omp plugin features` so it discovers marketplace-installed plugins.
- Fixed Escape handling when closing the `/session` information panel; the panel now retains focus until dismissed.
- Fixed the thinking-block visibility toggle so streamed reasoning is correctly hidden when thinking blocks are set to hidden.
- Reduced high idle CPU usage while the agent is working.
- Fixed resumed advisor subscription usage being displayed as a dollar amount instead of as a subscription.
- Fixed relative API addresses whose names end in image extensions being pasted as text instead of incorrectly treated as missing local image files.
- Fixed chat Markdown links and bare URLs so they become clickable OSC 8 hyperlinks when `tui.hyperlinks=always` is enabled.
- Fixed unreadable composer text on light terminal backgrounds when using transparent composer styles.
- Fixed `retry.fallbackChains` warnings for valid selectors from providers whose model discovery is still pending; validation now updates after discovery completes.
- Fixed visible browser windows launched by OMP so page content resizes with the operating-system window.
- Fixed Python evaluation hanging on Windows when importing native-extension modules such as NumPy.
- Fixed subagent extension context helpers so `ctx.getContextUsage()` and `ctx.compact()` operate on the child session.
- Fixed `lsp diagnostics` incorrectly reporting success for project-aware pull-diagnostic servers when diagnostics time out or fail.
- Corrected labels under `Settings > Context > Compaction Token Limit`.
- Fixed orphaned pages, iframes, and workers accumulating in the shared headless browser after abnormal OMP session termination.

## [18.0.10] - 2026-08-28

### Added

- Added the Sharpshooter memory backend for tracking friction-earned project decisions, with `/memory queue` and `/memory sync` controls.
- Added `/restart` to relaunch omp with its original launch flags and resume the current session in place.
- Added the `band` composer shape, a flush powerline status band above the prompt; it is now the default while existing `composer.shape` settings remain unchanged.
- Added in-place retry for interrupted or failed tool calls: use F5, Alt+R (`app.retry`), or `/retry` to replay an intact failed batch without an additional model round trip.
- Improved the working status display with a timed braille spinner, streamed intent, session accent colors across relevant status elements, and theme-aware session accent generation.
- Updated the `unicode` and `ascii` symbol presets to use `π`/`pi` for the brand icon, avoiding tofu on fonts without the nerd-font glyph.

### Changed

- The `/review` command's PR-style comparison now uses the merge base against the current branch, excluding commits that exist only on the base branch; selecting the current branch reports no changes.
- Prompt history is now persisted immediately when submitted, and session database state is checkpointed on exit to improve durability and prevent unbounded WAL growth.

### Fixed

- Fixed edit-tool parsing of `－`-prefixed MATCH lines so they correctly represent whole-line deletions and can be replaced by a following `＋` run.
- Fixed interrupted and failed Python evaluation cells being reported as successful results instead of errors, improving model handling, telemetry, retries, and background-job failure reporting.
- Fixed native-extension imports such as `numpy` hanging indefinitely in the Python evaluation tool on Windows.
- Fixed a macOS composer display issue where undercurl could remain attached to stale text after rapid typing.
- Improved `xd://` MCP failure messages with actionable transport stages, failure categories, server and tool context, retryability, trace IDs, and redacted JSON-RPC details.
- Fixed ACP `read` tool-call locations so clients such as Zed Follow receive the resolved filesystem path rather than the OMP line-range selector.

## [18.0.9] - 2026-08-28

### Breaking Changes

- Removed the `git` and `jj` wrapper modules from the SDK surface. VCS operations are now available through `@oh-my-pi/pi-natives/vcs`, including native handles and typed `VcsError` support; the package continues to re-export the `github` (gh CLI) helpers.

### Changed

- `extendedContext` now defaults to off: models with premium long-context pricing tiers (e.g. GPT-5.6 1M) stay capped at their standard-pricing window unless the setting or `/extended-context on` enables the extended window.

### Fixed

- Improved terminal readability on light backgrounds by ensuring TUI surfaces use contrasting foreground colors.
- Coalesced simultaneous autonomous continuation requests to prevent repeated calls while the agent is busy, with clearer continuation diagnostics.
- Fixed Snapcompact so it skips or falls back when compaction would not reduce context size, and now compacts text in mixed tool results while preserving all source images.
- Added Google Antigravity daily quota usage to the status line.
- Fixed status-line background-work counts so queued tasks and evaluation jobs remain visible without double-counting running subagents.
- Fixed nested subagent visibility in RPC subscriptions, the subagent HUD, `get_subagents`, `subagent_*` events, and `get_subagent_messages`.
- Fixed `omp token` refreshing local MCP OAuth credentials without blocking or losing rotating refresh tokens, and preserved OpenCode MCP OAuth configuration during discovery.
- Prevented process crashes caused by socket-closed errors and unhandled promise rejections during concurrent subagent shutdowns, timeouts, and MCP transport disconnects.
- Fixed automatic startup model selection so ambient AWS credentials do not incorrectly select an unavailable Amazon Bedrock model over a provider the user has authenticated with.
- Kept embedded context usage visible in the status line when long session names or paths consume available space.
- Added a status message when `CTRL-O` toggles tool-output expansion.
- Fixed `omp usage` to report Codex Chat and Spark capacity meters separately when they share a usage window.

## [18.0.8] - 2026-08-27

### Added

- Transcript usage rows now show the total prompt-to-yield time (Δ + clock, including tool calls) after the turn timestamp, opt-in via `display.showTurnTime` (off by default).
- `omp usage` now shows Z.AI GLM Coding Plan credit quotas (5h + weekly) with the subscribed plan tier.
- The usage status line now labels untiered quota windows with the report's plan tier, surfacing Z.AI Coding Plan (`pro`) and Codex plan names next to the 5h/7d percentages.

### Fixed

- Fixed corrupt session headers silently overwriting recoverable transcripts during resume ([#9915](https://github.com/can1357/oh-my-pi/issues/9915)).
- Fixed a startup race that left a new session with almost no tools and an empty skill inventory. An early reconcile could commit a small live tool set as the permanent enabled set. The enabled set is now seeded from the construction-time tool slate, and `reconcileCodeMode` samples it inside the registry mutation lock.
- Fixed `snapcompact` compaction frames larger than the persistence limit being truncated into invalid image base64 on session resume, which made the provider reject every subsequent request with HTTP 400; already-corrupted archives now resume from their retained source text instead ([#9901](https://github.com/can1357/oh-my-pi/issues/9901)).
- Fixed prompts hanging when a successful automatic retry ended through an early terminal path such as `yield`.
- Fixed `hub` `send await:true` blocking for the full IRC timeout when the awaited agent finished without replying; the send now settles as soon as the peer stops ([#9913](https://github.com/can1357/oh-my-pi/issues/9913)).
- Fixed workspace symbol searches reporting success when every configured language server failed; partial failures now remain visible alongside successful results ([#8387](https://github.com/can1357/oh-my-pi/issues/8387)).
- Handle denied working-directory changes without crashing resume, move, or startup flows.
- Fixed Cursor-only sessions becoming permanently unusable after replaying orphaned async tool results.
- Fixed `!command` config values (`auth.broker.url`, `auth.broker.token`, custom headers) passing inherited file descriptors to the resolution command; on POSIX these commands now run under `/bin/sh` (Windows keeps the built-in shell and is unchanged)
- Fixed `providers.amazon-bedrock` guardrail, transport, and header settings being dropped for models referenced by an inference-profile ARN.
- Fixed the welcome screen staying at its original width after a terminal resize; a settled rebuild now recomposes it at the new width like the rest of the transcript.
- Fixed `omp if-bench` ending an Anthropic model's run on a transient `Refusal (cyber)` classification; the cyber classifier is stochastic near the threshold, so a refused turn is now retried with a fresh session (up to 3 attempts) before it is scored as a run-ending provider failure.
- Fixed streamed assistant responses crashing when a later provider delta revised earlier Markdown; assistant output now stays mutable until finalization.
- Fixed an orphaned foreground tool card surviving a later agent turn and pinning the entire transcript outside native scrollback; new turns now seal abandoned cards while preserving background-task updates.
- Fixed resize and display replays to include naturally emitted active-head rows in one atomic bottom-first transaction without rewinding lifecycle state, while graceful shutdown still drains every eligible final suffix.
- Fixed terminal resizes lagging on large transcripts: the transient resize repaint now renders only the visible tail instead of the entire committed transcript per resize event.
- Fixed cache-miss dividers crashing completed streamed assistant messages after stable rows had entered native history; cache-miss status now trails the assistant output.
- Fixed quitting re-streaming the entire committed transcript when a resize-triggered scrollback replay was still pending; shutdown now flushes only genuinely un-retired rows.
- Fixed fast tool completions leaving a permanent running summary that blocked transcript retirement and squeezed later tool output.
- Fixed `omp git` hunk navigation (`alt+↓`/`alt+↑`) appearing to do nothing while the file sidebar had focus: the diff cursor band now stays visible (dimmed) when the pane is unfocused.
- Fixed the git TUI sidebar jumping back to the top of the file list after staging or unstaging a file; selection now stays on the nearest remaining row
- Fixed the `aarch64-linux` `nix build` output segfaulting in the dynamic loader before startup by repointing the stale `DT_VERDEF` that `patchelf` leaves behind when it grows `.dynamic`, and surfaced smoke-test signal deaths in the build log instead of masking them ([#9881](https://github.com/can1357/oh-my-pi/issues/9881)).
- Added custom RPC launcher builders so embedded clients can transport omp RPC through SSH and remote process managers.

## [18.0.7] - 2026-08-26

### Added

- Git and Jujutsu operations now run in-process (gitoxide/jj-lib) instead of spawning `git`/`jj` subprocesses — faster status lines, diffs, staging, and worktree operations. The git binary is only used for credential-bound network transfers (push/fetch/clone) and reftable repositories.
- Status lines, footers, reviews, project identity, cleanse, and autoresearch reads now work in pure Jujutsu workspaces as well as Git checkouts.
- Include token usage statistics in inspect_image tool output
- Pressing the session model shortcut (alt+p) again inside the picker toggles a red Task mode that switches the Task subagent's model for this session instead.
- Git TUI: an AI staging wand next to "Stage All" asks "What should we stage?" and stages only the matching changes — the tiny/smol model picks the matching files from the whole change list, then filters their hunks in parallel; file-scoped requests ("git stuff") stage the picked files whole, content-scoped ones ("all comment changes") stage only the matching hunks.
- Added nonblocking shared model-catalog refresh with cached startup hydration and source freshness diagnostics, allowing newly published models for known providers to appear without a binary release.
- Added `omp usage clients` to report per-client token usage recorded by the auth broker, including the machine and application responsible for usage by provider. Supports `--days` and `--json` output.

### Changed

- Enforce a 5-minute timeout and 8 MiB output limit for GitHub CLI operations
- Apply a 30-minute timeout for marketplace plugin repository cloning
- Improve large file handling with blob streaming and explicit truncation support
- Improved `omp git` responsiveness by streaming file contents, rendering complete lines promptly, progressively applying syntax highlighting, and deferring large commit statistics until after the first interactive frame.
- Expanded `omp git` navigation and editing shortcuts: refresh with `r`, stage or unstage files and directories with `s`, `u`, or `space`, navigate hunks and files with keyboard shortcuts, use Vim-style motions in both panes, select diff views with `1`–`4`, and open the commit form with `c`.
- Standardized completed edit results across edit modes with hashline-style paths and numbered previews.
- Documented browser relay behavior more clearly, including that `browser.relay` can enable relay access independently of `app.relay` and that a relayed session operates in the user's logged-in browser.
- Clarified the computer tool documentation: `desktop.window()` must be awaited, and `win.ax()` returns a textual accessibility-tree snapshot rather than a structured node list.

### Fixed

- Fixed the VCS status line counting every file inside an untracked directory instead of collapsing it to one entry like `git status`.
- Fixed git TUI sidebar wheel scrolling snapping back to the selected row after staging or collapsing entries; the list now follows the selection only when it actually changes.
- Fixed `inspect_image` selecting a text-only vision/default role when an image-capable model was available on the active provider.
- Improved unexpected-stop recovery for reasoning-only stalls by requiring the next concrete tool action instead of repeated analysis.
- The edit tool now repairs a stray closing marker typed in place of the divider in a selection (`old⟫new` inside one selection instead of `old│new`) and applies the intended replacement with a note, instead of failing with an unmatched-marker error.
- Fixed hub process waits being incorrectly prolonged or satisfied by a replacement process after an automatic restart.
- Preserved an explicitly empty `tools: []` configuration for agent definitions instead of adding default work tools.
- Corrected MCP per-tool approval configuration documentation and behavior to use registered tool names for deny policies.
- Made `/branch` consistently open the branch-from-message selector regardless of the `doubleEscapeAction` setting.
- Improved ACP behavior when prompting during an active turn by returning a typed `session_busy` JSON-RPC error instead of an opaque internal error.
- Fixed `--model <id>:<effort>` losing its effort setting when cycling back to the `default` role; an explicit `--thinking` setting continues to take precedence.
- Fixed extension-registered Codex models configured with `preferWebsockets: false` from attempting a WebSocket connection.
- Fixed stale command-generated provider and model-override credentials after HTTP 401 responses by refreshing credentials before retrying.
- Fixed extensions configured in `.omp/config.yml` not exposing their bundled skills, hooks, tools, commands, rules, prompts, and MCP configuration for discovery.
- Fixed compiled extensions that could not import public coding-agent registry modules.
- Fixed extension-provided environment variables being lost in user shell commands and prevented environment changes from one hook from affecting later commands.
- Fixed imported and legacy sessions with missing usage metadata from dropping RPC lifecycle events.
- Fixed GitHub and GitHub Enterprise issue, pull-request, and tool lookups to preserve and use the repository's actual host.
- Fixed binary installation when GitHub returns minified release metadata.
- Fixed `omp bench` and `omp if-bench` resolving credential-scoped dynamic models already listed by `omp models`.
- Fixed checkpoint and rewind recovery in Codex Code Mode.
- Fixed truncated `ask` questions being displayed incorrectly when expanded with Ctrl+O.
- Fixed the welcome screen and transcript layout not adapting correctly after terminal resizes.
- Made `omp if-bench` retry transient Anthropic cyber-safety refusals before treating them as run-ending failures.
- Fixed streamed assistant responses when later provider updates revise earlier Markdown.
- Fixed abandoned foreground tool cards and fast tool completions from blocking transcript scrolling or later output.
- Improved transcript replay and shutdown behavior so terminal resizes and exits do not duplicate, lose, or unnecessarily re-render committed output.
- Fixed cache-miss status messages from disrupting completed streamed assistant responses.
- Fixed YAML rewrites for settings, migrated configuration, and keybindings from adding trailing spaces to nested mapping headers.
- Fixed `/model` role-cycle icons overlapping their ordinal on terminals with full-width icon rendering.
- Improved `/collab` QR-code fallbacks so the browser join URL remains visible when the code is clipped or cannot fit.
- Fixed hub and child peer listings from exposing parked agents as active model context, while restoring accurate running, idle, parked, shown, and truncated counts.
- Fixed browser relay clients hanging when enabling the Runtime domain on a tab shared with another client.
- Fixed browser relay sessions leaving Chrome's debugging infobar attached after the last client releases a tab.
- Fixed interactive TTSR interruptions being displayed as errors when the rule injection succeeded.
- Fixed cold interactive launches duplicating the welcome header in Windows console scrollback.
- Fixed Git TUI hunk navigation and sidebar selection after staging or unstaging files, including correct handling of CRLF files on Windows.
- Fixed long sessions becoming unrecoverable when a provider rejects histories that exceed its message-count limit.
- Improved `/dump` output with readable titles for system notices and fenced XML payloads.
- Fixed kernel session recovery when a dead kernel reports cancellation.
- Applied advisor tool-call loop limits to advisor runs as well as regular model runs.
- Fixed `lsp rename_file` error handling for unreadable source paths and destination checks.
- Fixed LSP clients with different process arguments, initialization options, or settings from incorrectly sharing one process; `lsp reload *` now replaces superseded clients.
- Fixed auto-retry countdowns appearing frozen during long provider-specified waits.
- Fixed the Todo HUD after viewing a subagent and returning to the main session.
- Fixed child task results from linking unreadable artifacts and from replaying result bodies that had already been delivered.
- Fixed `omp update` showing a Unix reinstall command on Windows after a package-rename migration verification failure.
- Preserved `thinking.requiresEffort: false` in custom model configuration so supported local models can explicitly disable thinking.
- Prevented incompatible non-object values in shared project settings from silently replacing an entire settings group; such values are dropped with a warning.
- Jina Reader now uses configured credentials for authenticated rate limits while remaining available anonymously.
- Improved advisor session recovery and listing performance for large advisor transcripts.
- Fixed failed `browser.open` calls from leaving OMP-spawned application processes running when no tab could be acquired.
- Browser handles now fail fast with a specific per-operation timeout error instead of hanging an entire browser cell.
- Fixed autonomous runs becoming idle when a thinking-only length stop overlaps speculative handoff and compaction recovery.
- Kept completed assistant replies visible when viewport pressure prevents older active content from being retired.
- Accelerated SHA-2 and SHA-3 checksum builtins on supported ARM64 hardware.
- Fixed joined collaboration guests becoming inconsistent with the host after host-side compaction.
- Fixed `hub list` and child peer rosters counting parked agents from stale root sessions; the persisted roster now scopes to the current root, retries transient filesystem faults, and renders live rows through the production subagent prompt template with a truthful omitted count.

## [18.0.6] - 2026-08-26

### Added

- Added fast, cached conventional commit message generation to the git TUI and `omp commit --legacy`, including automatic handling of whitespace-only changes, clearer commit scopes, and improved grammar and tense in generated summaries.
- The git TUI sidebar now supports collapsing and expanding the Unstaged and Staged sections, with keyboard shortcuts to stage or unstage an entire section.
- Long streaming thinking and reasoning output now continues into terminal scrollback during a turn instead of remaining clipped to the viewport.

### Changed

- `omp commit --legacy` now uses the same conventional commit message generation as the git TUI.
- The git TUI sidebar now groups new files separately from tracked changes in the Unstaged section, while Staged and commit file lists use a unified status-based view.
- Improved resilience when streaming output changes during rendering, preventing incomplete blocks from causing further display updates to fail.

### Fixed

- Commit-message generation errors in the git TUI now remain visible in the status bar instead of disappearing and returning to an idle state.
- Fixed `omp update` leaving standalone Windows binaries on the old version when stale Bun launcher metadata was present, and preserved launchers installed by a newer concurrent update during binary repair ([#9806](https://github.com/can1357/oh-my-pi/issues/9806)).
- Quitting `omp git` during commit-message generation now exits cleanly without leaving the process running.

## [18.0.5] - 2026-08-25

### Added

- Added append-only transcript declarations and stable-row APIs for components with immutable history prefixes.
- Added the `:img` read selector to rasterize local SVG and SVGZ files for vision input.
- Added side-by-side image and SVG previews to `omp git`, including Git LFS object resolution and clear placeholders for unavailable or unsupported binary content.
- Added the `omp if-bench` command for zero-tool instruction-following and working-memory benchmarking across models, with live progress and ranked results.
- Added `q` to quit the git TUI.
- Added advanced whitespace filtering to the git TUI, including formatting-only changes and import-only changes in TypeScript, JavaScript, Rust, and Go.
- Improved the git TUI sidebar by compressing single-child directory chains and separating new or untracked files from tracked changes.
- Added Yolo-Auto to `/login` and documented the `YOLO_AUTO_API_KEY` environment variable.
- Updated the OpenRouter `/login` flow to support browser-based sign-in and automatic API-key provisioning, while retaining support for pasted `sk-or-…` keys.
- Added DeepInfra support for the `image_gen` and `tts` tools, including provider selection and MP3 or WAV output for text-to-speech.

### Changed

- Standardized completed edit results with hashline-style paths and numbered previews across edit modes.
- Improved `omp git` responsiveness with immediate file rendering, progressive syntax highlighting, and deferred large-commit statistics.
- Documented that `retry.maxDelayMs: 0` permits provider-requested quota waits to continue until automatic retry, rather than enforcing a wait ceiling.
- Expanded git TUI navigation and file-management shortcuts, including refresh, stage/unstage, directory operations, hunk and file navigation, pane movement, diff-view selection, commit-form access, and paging.

### Fixed

- Fixed race condition where tunnel startup was incorrectly reported as failure on quick process exit
- Fixed Obsidian theme task instructions and usage-limit text becoming unreadable against dark backgrounds.
- Fixed marketplace-installed plugins failing to discover their `rules/` directories.
- Fixed advisor notes in `/tree` displaying internal XML wrappers instead of readable text.
- Fixed successful agent and subagent results being discarded when cleanup exceeded its deadline.
- Fixed exiting plan mode mid-turn so the active turn now stops immediately.
- Fixed Windows workstation context reporting a virtual display adapter instead of the physical GPU.
- Fixed numbered selector menus such as `/review` ignoring digit-key selection.
- Fixed the welcome screen failing to reflow after terminal resizing.
- Fixed transcript layout issues that could clip assistant text, leave stale tool cards, disrupt scrolling, or make large-session rendering and shutdown unreliable.
- Fixed streamed assistant responses failing when later provider updates revised earlier Markdown.
- Fixed cache-miss status placement after streamed assistant output.
- Fixed `/model` role-cycle icons overlapping their ordinal on full-width terminals.
- Fixed constrained `/collab` QR codes rendering as empty rows; the browser URL hint is now shown instead.
- Fixed `hub list` and child peer rosters incorrectly including parked agents in model context and restored accurate status counts.
- Fixed browser relay clients hanging when enabling the Runtime domain on a shared tab.
- Fixed interactive TTSR interruptions being displayed as errors after successful rule injection.
- Fixed fast tool completions leaving a persistent running summary that obstructed later output.
- Fixed the Windows console welcome header being duplicated after cold launch.
- Fixed git TUI hunk navigation feedback when the sidebar has focus and preserved file selection after staging or unstaging.
- Fixed long sessions becoming unrecoverable when providers reject histories exceeding message-count limits.
- Improved `/dump` output with readable system-notice titles and XML-fenced raw payloads.
- Fixed kernel sessions failing to recover when cancellation was reported by a dead kernel.
- Applied advisor tool-call loop limits to prevent repeated failing calls from continuing without bound.
- Fixed `lsp rename_file` incorrectly reporting inaccessible paths as nonexistent and mishandling uncertain destination checks.
- Fixed LSP clients with different launch or initialization configurations incorrectly sharing one process; reloading now replaces superseded clients.
- Fixed the browser relay leaving Chrome's debugging infobar attached after the last client released a tab.
- Fixed auto-retry countdowns appearing frozen during long provider-requested waits.
- Fixed the Todo HUD becoming stale after viewing a subagent and returning to the main session.
- Fixed child-task artifact links and duplicate `hub jobs` result bodies.
- Fixed `omp update` showing a POSIX reinstall command on Windows after a package-rename migration failure.
- Preserved `thinking.requiresEffort: false` in custom model configuration so supported local Qwen templates can disable thinking explicitly.
- Fixed project settings from shared capability files being able to replace an entire settings group when a conflicting non-object value is present; the conflicting value is now ignored with a warning.
- Jina Reader requests now use configured credentials for higher authenticated rate limits while remaining available anonymously.
- Fixed advisor session persistence and loading performance for repeated retries and unusually large advisor transcripts.
- Fixed failed `browser.open` calls leaving OMP-spawned application processes running when no tab could be acquired.
- Improved browser-handle failures with prompt, operation-specific timeout errors instead of waiting for the entire browser cell.
- Fixed autonomous runs becoming idle after thinking-only length stops during speculative handoff.
- Fixed completed assistant replies disappearing from the live transcript under viewport pressure.
- Accelerated SHA-2 and SHA-3 checksums on supported ARM64 hardware.
- Fixed large MCP tool payloads being stored redundantly on disk.

## [18.0.4] - 2026-08-24

### Added

- Added the `omp git` command (and `/git` slash command): an interactive, fullscreen repository TUI featuring a split/inline/hunk diff viewer with minimap scrollbar, syntax highlighting, a staging sidebar with line-level staging, commit composer with amend support, and author avatars. Supports keyboard navigation, full mouse interaction, and pinning views to specific commits via `omp git <revision>`.
- Overhauled the `/extensions` Extension Control Center into a fullscreen alternate-screen dashboard with mouse support, tab navigation, unified inspector views across extension types, live MCP connection management, and expandable details (`Ctrl+O`).
- Added support for live syntax highlighting in streaming markdown code blocks.
- Added an immediately editable startup composer for interactive launches, preserving drafts typed while session initialization is in progress.

### Changed

- Improved streaming markdown and thinking block rendering performance on long sessions by batching token updates and eliminating redundant re-processing.
- Optimized streaming edit verification and session restoration for large files and history-heavy sessions.

### Fixed

- Fixed invalid streamed edit patches occasionally reaching the edit tool instead of being stopped early.
- Fixed `!` shell commands on zsh/fish by running them inside a real PTY, resolving terminal option errors and preserving ANSI color formatting.
- Fixed transcript layout corruption and viewport compression caused by interrupted streams, empty blocks, or collapsed wrapped diff lines.
- Fixed transcript scrollback loss where output below sticky cards (such as hub-wait or todo) failed to commit to terminal history.
- Improved HTTP 413 error handling: accurately distinguish between true token-context overflows and provider byte/media budget limits, persist terminal errors across sessions, and enable proper fallback-chain model switching.
- Fixed discovery-backed session models failing to restore when resuming sessions with `omp --resume` or `--continue`.
- Fixed browser tool initial launch timeouts on slow or cold host environments.
- Fixed eval runtime probes hanging on Windows due to inherited stdin handles.
- Fixed Claude models replaying partial thinking blocks as conversation text when interrupted mid-turn.
- Fixed image request failures with Kimi Code and Moonshot models by ensuring inline base64 image delivery.
- Fixed SQLite WAL-mode databases without sidecars failing to open in the Read tool.
- Fixed pasted image thumbnail rendering in the composer attachment preview.
- Fixed Linux startup event loop delays caused by legacy extension cache fsync churn.
- Fixed subagent advisors abandoning reviews on the final yield turn during session teardown.
- Fixed `/todo` expand/collapse commands and corrected `/shake thinking` reporting.

## [18.0.3] - 2026-08-23

### Added

- Added opt-in edit auto-repair (`edit.autoRepair.enabled`): when an edit breaks a file's AST parse, the smol model repairs the broken region in place — validated by re-parse, revert-rejected, and surfaced as a diff in the tool result — instead of only warning.

### Fixed

- Resolved cursor drift and text duplication caused by overlapping or out-of-bounds spelling ranges
- Squeezed transcript tool rows no longer render as a bare unstyled `╭─ Hub` frame: a squeezed block keeps its real render whenever it fits the allocated rows, and blocks that genuinely overflow fold to a themed frame that names the tool's activity (e.g. `Hub · send → Main`).
- Python/Ruby/Julia eval cells that hit their wall-clock timeout during a `parallel()`/`agent()`/`tool.*` fan-out no longer get their kernel force-killed (losing all session state): the timeout now aborts in-flight bridge calls so the runner unwinds as a clean KeyboardInterrupt and the kernel survives.
- Multi-select ask options whose labels end in `(Recommended)` now show their checked state and avoid duplicate recommendation suffixes ([#9452](https://github.com/can1357/oh-my-pi/issues/9452)).

## [18.0.2] - 2026-08-23

### Added

- Added update channels: `omp update --canary` installs canary prereleases from the npm `canary` dist-tag and `omp update --stable` switches back; the chosen channel persists and drives the startup update check.

### Changed

- Unexpected Stops now offers None, Mechanical (default), and Smart modes; Smart adds small-model classification to recover text-only stops.

### Fixed

- Fixed crash during update output when theme configuration is missing
- Fixed flickering typo undercurls while typing by projecting state during revalidation
- Fixed self-update on Windows leaving the `omp` command missing or stuck on the previous version when package-manager reinstalls fail on running files
- Ctrl+T now toggles every thinking block in the transcript, including blocks already retired to terminal history ([#9440](https://github.com/can1357/oh-my-pi/issues/9440)).
- Copilot Grok 4.6 Responses streams that repeatedly close after thinking now stop after one same-model retry instead of consuming the full retry budget ([#9427](https://github.com/can1357/oh-my-pi/issues/9427)).
- `/mcp test` now reports cancellation immediately when Esc is pressed during a slow config lookup, instead of staying suspended until the read settles ([#9419](https://github.com/can1357/oh-my-pi/issues/9419)).
- Fixed remote browser relay endpoints advertising a client-local CDP WebSocket URL: `/json/version` now reflects a valid request `Host` and falls back to the relay's loopback address when it is absent or unusable.
- Restored red/green and syntax highlighting in edit-tool result bodies ([#9439](https://github.com/can1357/oh-my-pi/issues/9439)).
- Fixed goal mode failing to start (`No such tool: xd://goal`) when `goal.enabled` was turned on after the session had already started; the `goal` tool is now registered lazily on goal-mode entry ([#9444](https://github.com/can1357/oh-my-pi/issues/9444)).

Older entries are archived in [packages/coding-agent/CHANGELOG.md@d95ba9ea5e83](https://github.com/can1357/oh-my-pi/blob/d95ba9ea5e8370e1cc0e7fc83cef7c7db862b543/packages/coding-agent/CHANGELOG.md).
## [18.0.1] - 2026-08-23

### Added

- Plan review can save a plan to a chosen path and start a new session.
- Edit results now warn when an edit leaves a previously parsing file unparseable, independent of the `edit.blackbox.enabled` recorder.
- Added provider-wide Amazon Bedrock guardrail settings to models configuration, including custom models.
- Added the `/pin` slash command to pin and unpin sessions so they stay at the top of the `--resume` picker UI.
- Optional edit parse-regression capture appends the before/after content, model, variant, and arguments to `~/.omp/agent/edit-blackbox.jsonl` when `edit.blackbox.enabled` is enabled.

### Changed

- Bash commands now automatically transition to the background by default when exceeding the threshold
- Transcript blocks now retire to terminal history as explicit ordered batches, active tools collapse to compact indicators under viewport pressure, and the `tui.scrollbackRebuild` and `tui.resizeScrollback` settings were removed.
- Transcript retirement is now capacity-driven: finalized blocks (and the welcome header) stay live in the viewport — reflowing to the current width on resize and visible the instant a message is submitted — and only commit to immutable terminal history when the screen runs out of room.
- Resizing no longer duplicates the editor and status rows: the settled repaint recovers its anchor from the terminal's own cursor-position report after reflow.
- The Advisor agent's guidance now prioritizes concrete technical risks and transcript-evident execution failures, while strictly prohibiting meta-advice on user intent, ceremony, or workflow narration.
- Edit-tool inline selections whose text contains the divider character itself (box-drawing code) are now resolved instead of failing the batch: a trailing divider reads as a deletion, an odd count splits at the middle divider, an even count reads as a deletion of the selected text, each with an advisory note.
- The welcome screen's recent-sessions list no longer content-scans every session file in the project directory: session titles are indexed in history.db as they are created/renamed, and startup resolves the newest files by mtime with a per-file scan fallback that backfills the index (cuts the pre-input startup transition by ~250ms per 10k sessions).
- Interactive startup no longer re-runs slash-command discovery: the composer's autocomplete reuses the discovery pass that session construction already performed.
- Interactive startup now reuses the prepaint composer's in-flight recent-session load, starts custom-command discovery with the other independent filesystem scans, and overlaps auth-cache/config reads with settings initialization instead of repeating or serializing them.
- Interactive startup now commits the complete composer frame synchronously before `session_start` hooks, lazily materializes only cached model providers needed by the configured default role, and starts cache-aware online runtime-provider discovery after the first UI paint.
- Advisor criteria for `concern` and `blocker` levels are expanded to better identify serializing independent tasks, bypassing specialized tools, ignoring verified sources, and premature yielding before convergence.
- The Advisor is now explicitly instructed to promote clean code cutovers (deleting obsolete paths and tests) unless backwards compatibility is required by the user or project rules.
- The advisor now flags transcript-evident execution failures—missed parallelism, overplanning, ungrounded assumptions, unnecessary abstraction, incomplete scope, stubs, and thin verification—before they force user steering.
- Slash-command autocomplete now collapses skills into a single `/skill:` row; the individual skills list once the prefix reaches `/skill:` (accepting the row with Tab/Enter expands it in place).
- `omp cleanse` and `/cleanse` now dispatch repair subagents while checkers are still running: diagnostics stream in (parsed from partial checker output every 5s), new files spawn workers up to the agent cap with least-loaded batching, and late diagnostics for a file being repaired are steered into the owning worker's chat instead of waiting for the full diagnostic pass.
- Suggested plan save filenames now come from a dedicated 1-3 word topic prompt instead of the sentence-length session title (e.g. `PYO3_METHODS_PLAN.md` instead of `SPLIT_PYENVIRONMENTBACKEND_REQUEST_INTO_PYO3_METHODS_PLAN.md`), with verbose fallbacks trimmed at a word boundary.
- Subagents in a shared working tree no longer run formatters, linters, or project-wide builds/test suites unless their assignment asks for it; validation runs once by the main agent.
- Context file deduplication now checks paragraph containment instead of byte-exact matching: a less-authoritative file whose normalized paragraphs appear contiguously within a more authoritative file is omitted, reducing redundant prompt context.
- Context file containment dedup now sorts by depth descending internally, treating files without a depth as least authoritative, so concatenated multi-root or user-level context cannot drop a closer-to-cwd file.
- Paragraph splitting for containment comparison is now fenced-code-block-aware: text inside a fenced example in a more authoritative file no longer counts as a contained instruction, preventing active context rules from being discarded.

### Changed

- Updates now resolve against this fork's GitHub releases (`kaioposnky/oh-my-pi`) over the digest-verified binary channel instead of querying npm, so fork installs are never pointed at upstream builds.

### Fixed

- Fixed UI jitter in the edit tool gutter by reserving space for line counts
- Edit-tool add lines written directly above a `` gap now insert under their anchor line instead of splicing at the post-gap anchor, often mid-line without a newline.
- Edit-tool add lines may contain literal selection-marker glyphs; such payloads previously failed with an unusable corrected payload.
- A bare edit selection whose REWRITE restates the whole line now replaces the full line instead of duplicating the line's prefix and suffix around the span.
- A mid-line `…` in an edit REWRITE no longer re-emits a multi-line capture, so literal ellipses inside strings survive.
- Fixed double-Esc (session tree / branch selector) appearing dead on long sessions: opening it no longer replays the entire transcript through the terminal (which blocked for tens of seconds on PTY backpressure and cleared native scrollback), only the viewport repaints.
- Fixed prompt history whitespace duplicates: prompts are normalized on save (CRLF folded, per-line trailing padding stripped) so terminal-copy resubmissions upsert instead of adding a near-identical row, and a one-time pass collapses existing padded duplicates keeping the latest submission's metadata.
- Fixed prompt history duplicates: each prompt is now stored once with its latest project path, session ID, and submission time, and session resume or transcript rebuilds no longer repopulate persistent history.
- `/models` no longer shows dead sidebar tabs for unconfigured Ollama, llama.cpp, and LM Studio endpoints; explicitly configured endpoints remain visible for diagnosis ([#2761](https://github.com/can1357/oh-my-pi/issues/2761)).
- Fixed prompt input lag under CPU load while file and macOS spelling completions are active.
- Fixed blank `mnemopi.dbPath` settings silently creating volatile memory banks instead of using persistent agent storage ([#9360](https://github.com/can1357/oh-my-pi/issues/9360)).
- Fixed legacy Pi extensions being reparsed on every startup because their persistent parse cache could not be created ([#9339](https://github.com/can1357/oh-my-pi/pull/9339) by [@walodayeet](https://github.com/walodayeet)).
- Fixed Kitty text-sized Markdown headings activating before `tui.textSizing` is enabled.
- Fixed terminal-title updates racing the TUI's off-thread output pump, which could tear an escape sequence mid-frame and print the title (e.g. `0;π ∴ <session title>`) into the editor line as if typed.
- Fixed the edit tool corrupting files on unified-diff-shaped payloads: missing-separator recovery no longer hijacks `-`/`+` bodies (which deleted matched anchors and duplicated the surrounding block); they now flow to the unified-diff reinterpretation.
- Fixed the edit tool writing literal `…` lines: a whole-line rewrite gap with no captured MATCH gap now fails closed with guidance instead of splicing an ellipsis into the file.
- Fixed status text retaining hidden DCS, PM, and APC payloads after escape-sequence sanitization.
- Fixed extension load errors truncating explicitly excluded package import specifiers.
- Fixed subagents crashing before their first turn when an extension contributed a tool or skill without a `description`; the context-breakdown token estimate now coalesces missing descriptions and system-prompt sections instead of passing `undefined` to the tokenizer ([#9331](https://github.com/can1357/oh-my-pi/issues/9331)).
- Clarified that Mnemopi `/memory enqueue` only promotes working memories older than the configured consolidation gate (12 hours by default) and that normal shutdown does not run bank sleep ([#9356](https://github.com/can1357/oh-my-pi/issues/9356)).
- Fixed asynchronous V2 remote compaction dropping user and tool messages added after its speculative snapshot ([#9351](https://github.com/can1357/oh-my-pi/issues/9351)).
- Fixed startup crashes when temporary Git worktrees point to repository metadata that the current user cannot access.
- Hidden custom tools (`hidden: true`) stay out of the parent session's active set and `/tools` unless `--tools` or an agent `tools:` list names them. They used to be always-included.
- Hidden custom tools (`hidden: true`) stay out of the parent session's active set and the TUI's `/tools` list unless `--tools` or an agent `tools:` list names them. They used to be always-included.
- Fixed edit retries suggesting the same invalid payload and permission prompts showing unknown paths for sloppy edits ([#9350](https://github.com/can1357/oh-my-pi/issues/9350)).
- Fixed Agent Hub aborted rows failing to open their read-only transcript when selected with Enter.
- Fixed `/mcp test` leaving a stale "(esc to cancel)" hint after the test finished and swallowing Esc presses during the grace window; the hint now stops advertising Esc once the test settles, a late Esc shows an "already finished" status instead of silently doing nothing, and one Esc press consumes the cancellation ownership so the next Esc reaches the running turn ([#9173](https://github.com/can1357/oh-my-pi/issues/9173)).
- Fixed MCP request timeouts surfacing as `Unexpected end of JSON input` instead of `Request timeout after Nms` when the abort lands mid-JSON-body read, including when the caller's signal aborts after the timer fires ([#9048](https://github.com/can1357/oh-my-pi/issues/9048)).
- Fixed streamed `xd://` device writes (including MCP tools) looking like a hung in-flight call while the model is still thinking; they now show as queued until the tool actually starts.
- Fixed `/clear` and `/new` keeping a stale `AGENTS.md` (and other context files) in the system prompt; a new session now re-reads them from disk ([#9273](https://github.com/can1357/oh-my-pi/issues/9273)).
- Auto-continue turns that die mid-tool-call with `OpenAI completions stream closed before a finish_reason was received` (and the Responses/Azure "closed before a terminal response event" variants): premature gateway stream closes now classify like idle stalls and HTTP/2 resets, so a resolved tool turn is continued after its preserved partial output instead of surfacing the error.
- Todo tool schemas now identify `items` as valid for single-phase `init` and `append`.
- Fixed Todo tool guidance to clarify that blocked tasks never auto-promote after state-changing operations (#8121).
- Fixed timed-out or interrupted glob searches keeping native filesystem workers alive and blocking subsequent agent turns.
- Fixed legacy Pi extensions being re-parsed on every launch instead of using the persistent cache ([#9170](https://github.com/can1357/oh-my-pi/pull/9170) by [@fmguerreiro](https://github.com/fmguerreiro)).
- `/mcp reload` now picks up external edits to `mcp.json`.
- Fixed `lsp reload` clearing active language-server settings instead of reapplying them.
- Fixed workspace diagnostics skipping lower-priority languages in polyglot project roots ([#8385](https://github.com/can1357/oh-my-pi/issues/8385)).
- Fixed isolated task cleanup deleting the only branch that retained an agent's commits after apply-back failed ([#9216](https://github.com/can1357/oh-my-pi/pull/9216), thanks [@Mustaqeem66](https://github.com/Mustaqeem66)).
- Fixed bare `hub wait` calls reporting nothing to wait for while an already-queued bus message remained unread.
- Fixed Code Mode activating for sessions whose caller never enabled `eval`, which handed restricted subagents an unrestricted JS runtime; the eval transport must now be part of the caller's own tool set.
- Fixed Code Mode dropping `write` from the direct surface when plan mode starts, and dropping `task` delegation guidance from the plan prompt once `task` is reachable only through the eval bridge.
- Fixed the eval tool advertising bridged declarations for tools the model can still call directly, such as a plan-mode transport `write`, by reading the partition the session actually applied.
- Fixed Code Mode turn metadata resolving a wire-name collision by tool registry order, and mishandling tools named after `Object.prototype` members or after the eval bridge's own internal operations (`__agent__`, `__budget__`, `__completion__`, `__concurrency__`).
- Fixed generated Code Mode declarations rendering an array of a union as `"a" | "b"[]`, which models read as a scalar-or-array type and submitted invalid arguments against.
- Fixed SDK sessions with a custom agent directory inheriting process-global model overrides instead of loading that directory's own `models.yml`.
- Fixed Eval guidance that implied `agent()` children share parent kernel state and advertised them when spawning was disabled.
- Fixed Bash guidance that implied raising `timeout` extends foreground execution beyond the auto-background threshold.
- Fixed Bash and Eval guidance that implied raising `timeout` extends foreground execution beyond the auto-background threshold ([#9155](https://github.com/can1357/oh-my-pi/pull/9155) by [@MikeeI](https://github.com/MikeeI)).
- Status-line usage no longer combines quota windows scoped to different models or tiers ([#9138](https://github.com/can1357/oh-my-pi/issues/9138)).
- Fixed `PI_PROXY` being ignored outside provider streams: the CLI now installs it on the process-wide `fetch` at startup, so OAuth token refresh/login, usage probes, and model discovery are proxied too. Combined with the Anthropic transport fix in `pi-ai`, a region-blocked machine reaching Anthropic through a proxy no longer fails with `403 Request not allowed`.
- Subagent failures now name the resolved provider and model that produced the error ([#9137](https://github.com/can1357/oh-my-pi/pull/9137) by [@Mustaqeem66](https://github.com/Mustaqeem66))
- Fixed read-only subagents (`scout`, restricted-tool custom agents) crashing before their first prompt when extensions register callable tool schemas.
- Fixed smart paste dropping text from X11 clipboard owners whose image read fails instead of reporting no image.
- Fixed `formatContent` silently swallowing formatter errors: the empty `catch {}` was replaced with per-server error tracking, and failed formatter requests now surface as `FileFormatResult.FAILED` instead of being misclassified as unchanged ([#8388](https://github.com/can1357/oh-my-pi/issues/8388)).
- Fixed `formatContent` reporting no-formatter as unchanged: when no configured server supports formatting, the result is now correctly classified as `FileFormatResult.UNSUPPORTED` ([#8388](https://github.com/can1357/oh-my-pi/issues/8388)).
- Fixed MCP request timeouts surfacing as `Unexpected end of JSON input` instead of `Request timeout after Nms` when the abort lands mid-JSON-body read.
- Fixed CJS modules being misclassified as ESM when imported from an ESM parent module. The extension loader now identifies unshadowed CommonJS syntax from Babel's parsed AST before deferring to the importer's module kind. This resolves `SyntaxError: Missing 'default' export` for packages with conditional exports (e.g. playwright-core) where an ESM wrapper re-exports from a CJS entry, while ambiguous files continue to inherit their importer's classification.

## [18.0.0] - 2026-08-22

### Added

- Added the `omp render` command to replay session threads and benchmark transcript pipeline performance.
- Added configurable typo detection (`Ctrl+.` suggestions), Tab word completion, and opt-in autocorrect to the macOS prompt editor.
- Added a live benchmark dashboard to `omp bench` with real-time performance estimates, p50/p95 statistics, distinct input/output throughput metrics, cost tracking, mixed challenge suites by default, and a `--prefill-bytes` option for synthetic prefill benchmarks.
- Added the `/shake thinking` command to strip model reasoning blocks from session history.
- Added icon support and usage-frequency ranking to slash-command autocomplete suggestions.
- Enhanced the edit tool to support `＋`-prefixed line insertions, unified diff formats, bare selection replacements, and robust recovery for common syntax variations and ambiguous match spans.
- Startup composer now renders immediately using cached session and theme data, allowing typing before session initialization finishes without dropping keystrokes.

### Changed

- Session history rewinds (via `Esc-Esc` or `/tree`) now truncate transcript tails in place instead of clearing and replaying the entire terminal scrollback.
- Switched the fallback edit mode to `sloppy` for models lacking hashline support.
- macOS spelling checks now run in the background to avoid blocking editor rendering and keystroke responsiveness.
- Word completions accepted via Tab now insert a trailing space when not immediately followed by whitespace or punctuation.
- Increased default visible autocomplete dropdown rows to 10 and added the `autocompleteMaxVisible` configuration setting.
- Slash-command descriptions in the autocomplete popup now truncate to two lines instead of wrapping indefinitely.

### Fixed

- Fixed streaming code blocks not rendering syntax highlighting live until completion.
- Fixed an issue where interrupting Claude during reasoning would replay partial thinking blocks on subsequent turns and cause API rejection errors.
- Fixed session resume performance by avoiding redundant edit-matching execution across historical transcripts.
- Fixed image requests to Kimi Code / Moonshot failing with 400 errors by sending inline base64 images directly.
- Fixed reading WAL-mode SQLite databases that do not have active `-wal` or `-shm` files.
- Fixed terminal transcript layout corruption on Windows caused by collapsed edit results with long wrapped diff lines ([#9302](https://github.com/can1357/oh-my-pi/issues/9302)).
- Fixed disappearing terminal scrollback history below updating cards such as background jobs or hub status cards.
- Fixed pasted image attachment thumbnails rendering as blank boxes in Kitty terminal graphics mode.
- Fixed context gauge display issues in the status line for unnamed sessions.
- Fixed accurate benchmark input token counts on providers with automatic prompt caching.
- Fixed C# files incorrectly displaying D3.js icons in edit results ([#9323](https://github.com/can1357/oh-my-pi/issues/9323)).
- Fixed incorrect token delta reporting in expanded context compaction summaries when pre-compaction usage was omitted by the provider ([#9293](https://github.com/can1357/oh-my-pi/issues/9293)).

## [17.4.4] - 2026-08-22

### Added

- Added the `tui.resizeScrollback` setting (default `append`) controlling how a settled width resize refreshes pane scrollback when the terminal repaints in place (tmux/screen/Zellij panes, in-place direct terminals). Multiplexers rewrap old output naively on width changes, leaving history hard-broken at the old width; `append` re-emits the transcript at the new width below it (one fresh copy per settled resize), `rebuild` clears pane history first so it holds exactly one current-width copy (needs a host that honors ED3, like tmux; erases pre-session scrollback), and `preserve` keeps the old-width history untouched with zero growth ([#8193](https://github.com/can1357/oh-my-pi/issues/8193)).

### Fixed

- Fixed the composer image chip painting its right border inside the card and mangling the thumbnail's first row: the Kitty placement prefix was counted as visible width, breaking the thumbnail centering.
- Fixed edit-tool whole-line inserts (an insert selection alone on its own line) splicing into the anchor line instead of landing on a new line when the anchor was the last matched line, preceded a blank line, or sat at EOF.
- Edit tool prompt now documents whole-line insert selections and that a REWRITE `…` with no captured MATCH gap is written to the file literally.
- Fixed multiplexer width resizes (tmux/screen/Zellij/cmux/Herdr panes) replaying the entire transcript into pane history — one duplicated transcript copy and seconds of visible scrolling per width change. The width-epoch boundary now resolves for real transcripts: finalized blocks without `getTranscriptBlockVersion` are treated as immutable per the documented contract, Container-derived blocks without a nested epoch source fall back to whole-segment stability instead of failing, and bash/eval/tool/read-group blocks report a block version for their genuine post-finalize mutations. The interactive resize listener no longer marks every SIGWINCH as "render pending", which forced the conservative replay-from-row-zero fallback on every settled resize ([#8193](https://github.com/can1357/oh-my-pi/issues/8193), [#7026](https://github.com/can1357/oh-my-pi/issues/7026)).

## [17.4.3] - 2026-08-21

### Fixed

- Fixed the edit tool rejecting payloads containing a glued `«»` line: after MATCH it now reads as the mistyped `»` separator, elsewhere as a stray terminator to drop.

## [17.4.2] - 2026-08-21

### Added

- Added an opt-in image URL broker (`images.urls.enabled`) that publishes outgoing images through an ordered chain of backends instead of sending inline base64 to URL-fetching providers
- Composer attachment chips (ported from omp2): pasted images and large text pastes stage as rounded preview cards above the prompt — image cards show a live thumbnail (Kitty Unicode placeholders) with pixel dimensions, text cards a snippet with `+N lines`/`N chars` — while the editor buffer holds a compact `<icon> #N` token in the card's identity color.

### Changed

- Pasted images now insert only the `[Image #N, WxH]` marker; the redundant trailing `attachment://N` URI is no longer added to the composer.
- Added a consolidated CLI reference (`docs/cli-reference.md`) documenting every top-level subcommand and launch flag, including headless print mode (`--print`/`-p`, `--print-thoughts`) ([#9252](https://github.com/can1357/oh-my-pi/issues/9252))

### Fixed

- Fixed unreadable colors in macOS Terminal.app by using its supported 256-color mode ([#9162](https://github.com/can1357/oh-my-pi/issues/9162)).
- Fixed Esc after a fast `/mcp test` result aborting the active agent turn instead of consuming the advertised cancellation input ([#9173](https://github.com/can1357/oh-my-pi/issues/9173)).
- Fixed task spawns crashing when legacy boolean per-agent prewalk or advisor overrides are present in `config.yml`.
- Fixed ACP `session/prompt` requests hanging forever when a builtin slash command's residual prompt (e.g. `/force:<tool> /some-command`) resolved locally, which also wedged all subsequent prompts on the session ([#9206](https://github.com/can1357/oh-my-pi/issues/9206)).
- Fixed eval-spawned subagent output being omitted from per-turn output-token budgets, including failed and isolated runs ([#9187](https://github.com/can1357/oh-my-pi/issues/9187)).
- Fixed `/compact` over RPC blocking the serialized command queue for the full summarization round-trip, so a follow-up `abort` could not interrupt it ([#9200](https://github.com/can1357/oh-my-pi/issues/9200)).
- Fixed RPC UI select requests dropping option descriptions, allowing hosts to render described choices ([#9175](https://github.com/can1357/oh-my-pi/issues/9175)).
- Fixed `/todo edit` failing with "Could not parse Markdown" when checklist items had backslash-escaped brackets (`- \[x\]`), which editors and markdown renderers commonly emit ([#9188](https://github.com/can1357/oh-my-pi/issues/9188)).
- Fixed `omp setup --check`/`--json` with no component printing usage text to stdout and exiting 0; it now errors on stderr and exits non-zero so scripted JSON health checks fail loudly ([#9221](https://github.com/can1357/oh-my-pi/issues/9221)).
- Fixed an aggressive `task.maxRuntimeMs` mislabeling committed subagent outcomes: a budget-killed run is no longer reported as a runtime-limit timeout, and a subagent that yielded a complete result before the deadline is no longer reported as aborted when teardown crosses the deadline ([#9191](https://github.com/can1357/oh-my-pi/issues/9191)).
- Fixed startup fallback-chain warnings for discovered OpenCode Zen, OpenCode Go, and GitHub Copilot models cached under credential-scoped IDs ([#9205](https://github.com/can1357/oh-my-pi/issues/9205)).
- Fixed interactive `/models` and Ctrl+P cycling omitting an `enabledModels`/`--models` model discovered by a background provider refresh (e.g. `opencode-go/ox-alpha-free`) after startup, by rebuilding the scoped list once discovery completes ([#9220](https://github.com/can1357/oh-my-pi/issues/9220)).
- Documented how to enable, trigger, target, and manually re-arm prewalk ([#9179](https://github.com/can1357/oh-my-pi/issues/9179)).
- Pasted images and large text pastes appear in the composer as compact icon tokens instead of bracketed markers; the bracketed form remains the outgoing/stored format, and the transcript renders it back as the compact chip.
- Deleting an attachment's inline token now removes the attachment from the submission (surviving image markers are renumbered).
- Restored prompts (esc-esc, `/tree`, branch, queued-message dequeue, failed-submit recovery) collapse image markers back into clickable atomic chip tokens and re-materialize their file links instead of degrading to dead text.

## [17.4.1] - 2026-08-21

### Added

- Added `PERSONALITY.md` support: `~/.omp/agent/PERSONALITY.md` (profile/XDG-aware agent dir) replaces the system prompt's personality block text; `personality: none` still omits the block ([#8528](https://github.com/can1357/oh-my-pi/issues/8528))
- Sloppy edits now support inline replacements with `⟪old│new⟫` syntax (`⟪old│⟫` for deletions and `⟪│new⟫` for insertions), alongside automatic recovery for common formatting mistakes without needing a retry.
- Sloppy edits now recover operations that mix `⟪old│new⟫` inline replacements with a `»` REWRITE instead of failing the payload: a redundant REWRITE is dropped, a diverging one is applied as the final text, and a note explains the interpretation.
- Expanded archive support in `read` and `write` tools: `read` can now inspect and extract members from `.rar`, `.7z`, `.iso`, `.cab`, `.deb`, `.rpm`, `.cpio`, `.ar`/`.a`, `.lzh`, `.arj`, compressed tar files (`.tar.bz2`, `.tar.xz`, `.tar.zst`), package formats (`.whl`, `.ipa`, `.xpi`, `.vsix`, `.nupkg`, `.cbz`, `.cbr`), `.asar` archives, and single-file compressed streams; `write` can create `.tar.zst` and update `.asar` archives.
- Added Code Mode for Codex `code_mode_only` models via `providers.openai-codex.codeMode` (`off`/`on`/`auto`), demoting non-essential tools into an eval bridge with generated TypeScript definitions.
- MCP tool names longer than 64 characters are now automatically truncated with a deterministic hash suffix to comply with strict provider validators.
- Marketplace-installed plugins with manifest settings can now be configured through `omp plugin config` and Settings → Plugins.
- Configured discovery providers with `authHeader` now preserve cached models across application restarts.
- Added repeat read warning hints when identical file content is read multiple times.
- Explicit DAP adapters can now attach without a PID or port when `attachDefaults` provide the target arguments.
- Added `isProjectTrusted()` compatibility shim to `ExtensionContext` for extensions targeting upstream per-directory trust gates.

### Changed

- Added `compaction.asyncEnabled` (default: on) to speculatively summarize context in the background before hitting threshold limits, avoiding blocking summarization pauses.
- Replaced `compaction.strategy` and `compaction.remoteEnabled` with an ordered `compaction.methodOrder` preference list.
- Handoff maintenance (`/handoff` and automatic handoff compaction) now commits generated summaries directly to the active session instead of starting a new session.
- Added `extendedContext` setting (`/settings` → Context → General, default: on) to optionally clamp models with premium long-context pricing tiers (such as OpenAI GPT-5.6 Sol/Terra/Luna) to standard-pricing token limits before compaction triggers.
- Token counting and token estimations are now dynamically scoped to each specific model tokenizer rather than using a single process-global tokenizer.
- `omp cleanse` and `/cleanse` now feature a live interactive status board displaying active checkers, repair subagents, tool metrics, and token/cost totals in real time.
- Eval-bridge nested `tool.<name>()` calls now enforce ACP permission gates and tool allowlists identically to direct tool calls.
- Added `tokenizer` option to custom models and `modelOverrides` to allow overriding the local tokenizer family for proxied model endpoints.
- Added `qwenTemplateReasoningEffort` to the `models.yml` `compat` schema to configure or disable reasoning effort flags for strict local inference servers.
- Settings menus now support click-to-toggle and drag-to-reorder for list items, as well as warning indicators and risk notes on sensitive options such as External Thinking.
- Supervised process completion notices now render as compact single-line entries.
- The todo HUD header now displays a consolidated progress bar showing task completion across all stages.
- `/settings` rows can now carry a risk note: a warning glyph on the row plus a warning-colored line above the description. `External Thinking` (`externalThinking`, `--external-thinking`) is the first user — providers have flagged the request shape it produces as abuse, up to account-level enforcement, so both the settings entry and `--help` now say so.

### Fixed

- Fixed regional HTTP 401 data-residency errors during Codex chat, web search, and image generation requests by passing token residency metadata on requests.
- Fixed macOS SSH ControlMaster socket creation failures caused by `sun_path` length limits when using named profiles.
- Fixed an issue where Nix-packaged builds failed to load on-demand native addons (`onnxruntime-node`/`sherpa-onnx`) due to missing shared C++ runtime library paths.
- Fixed external editor spawning (Ctrl+G, plan review, `/todo edit`) failing to attach to visible terminals for editors like `emacsclient`.
- Fixed `omp --resume` spinning at 100% CPU when new session entries arrived during initial transcript rendering.
- Fixed session resume hints and fatal exit messages omitting the active `--profile` argument.
- Fixed MCP OAuth authorization requests failing on pre-registered clients with restricted scopes by using RFC 9728 `scopes_supported`.
- Fixed isolated task subagents causing out-of-memory crashes on repositories with large uncommitted binary files by pre-sizing diffs and enforcing snapshot limits.
- Fixed LM Studio and lazy-loaded local models retaining uninitialized context lengths by re-probing loaded context lengths after initial inference.
- Fixed project-scoped Claude Code marketplace plugins incorrectly loading into sessions in other projects.
- Fixed configured advisors backed by discoverable providers remaining inactive on initial session startup until manually toggled.
- Fixed resolving `--model @<role>` failing for roles backed by discovery providers like oMLX, Ollama, and llama-swap.
- Fixed retry fallback chains stopping prematurely when encountering nested fallback configurations, and fixed session role priority during fallback chain selection.
- Fixed cancelled prompts disappearing upon abort during turn setup, properly restoring user text and attachments to the input editor.
- Fixed built-in shell utilities (`grep`, `rg`, `diff`, `find`, `timeout`, `top`, `date`, `head`, `tail`, `stat`, `truncate`, `kill`) across numerous POSIX/GNU/BSD compatibility edge cases and early-pipeline SIGPIPE handling.
- Fixed Cursor sessions missing standard string-replacement edit tooling after server tool injection.
- Fixed `hub wait` duplicating frozen rows into native scrollback during viewport overflow.
- Fixed dark-theme contrast issues on markdown code-fence headers.
- Fixed prompt guidance and descriptions for Task tools and SSH usage.
- ACP editor clients that support elicitation forms (Zed) can now use `ask`, so the agent can pose single-choice, multi-select, and free-text questions inline instead of guessing.
- `/retry` and `/handoff` now work over ACP, so editor clients (Zed) list them and can run them instead of sending the text to the model.
- Added `qwenTemplateReasoningEffort` to the `models.yml` `compat` schema, so the auto-enabled Qwen 3.8+ template effort dialect (`chat_template_kwargs.reasoning_effort`) can be switched off per provider/model for strict local servers that reject unknown `chat_template_kwargs`.
- Extensions can provide a normalized `usage` provider through `pi.registerProvider()`. Its reports now flow through AuthStorage caching, history, and usage displays, and the override is removed when the extension provider is unregistered.

## [17.4.0] - 2026-08-20

### Added

- `/cleanse` (and `omp cleanse`) — run the checker/repair loop in-session, with a live status board of running checkers, repair subagents, and token/cost totals.
- `omp ps` — interactive monitor for daemon-supervised background processes.
- Composer layouts — `composer.shape` picks the editor frame (rounded box, Claude Code rules, upstream-pi rules, borderless), with live previews in `/settings` and the setup wizard.
- Context line — `statusLine.contextLine` gauge (`percentage`, `annotated`, `embedded`) showing context usage and compaction boundaries.
- Backgroundable Python — `eval` cells can run async and auto-background like `bash`, with configurable thresholds.
- Local Claude token counting — Anthropic-family tokens now count via a native local tokenizer, and every counter (session maintenance, advisor, stats, context tools) uses the active model's own tokenizer.
- `extendedContext` setting — pick whether models with premium long-context pricing (272K/1M tiers on Codex-class models) use the extended window or compact early and stay on standard pricing.
- `/extended-context` — toggle premium long-context windows without leaving the session.
- Speculative compaction — with `compaction.asyncEnabled`, all compaction modes compact in parallel while the session continues, then splice the result in instantly.
- `tokenizer` property on custom models and `modelOverrides` to pin the tokenizer family for proxy models.
- `qwenTemplateReasoningEffort` in `models.yml` `compat` to disable the Qwen 3.8+ reasoning-effort template parameter for strict local servers.
- Click-to-toggle and drag-to-reorder for list-valued editors in `/settings`.
- `icon.subscription` and `icon.advisor` symbol-theme tokens (Nerd Font, Unicode, ASCII).

### Changed

- Typing anywhere in the /models UI now immediately focuses the model list for instant search and arrow navigation.
- Revamped the todo HUD — overall progress renders along the tree-spine connector with smooth completion transitions.
- Compaction divider now names the maintenance method that fired (`remote-compacted`, `soft-compacted`, `handed-off`, `snap-compacted`) and shows the before → after context size (e.g. `256K→20K`).
- `/handoff` (and automatic handoff compaction) now compacts in place, replacing the session context instead of forking a new session.
- Compaction method priorities — `compaction.methodOrder` takes an ordered preference list (e.g. `[remote, snap]` uses remote compaction where the provider supports it, such as OpenAI, and snap everywhere else), replacing `compaction.strategy`/`compaction.remoteEnabled`.
- Unified inline overlays and selectors (model picker, settings, `/cleanse`) into one titled rounded-box panel style.
- Risk badges and warnings on `/settings` rows, starting with External Thinking.
- Faster CLI Startup

### Fixed

- `/models` keeps `auto` thinking on non-default roles such as `task` instead of changing the active model and displaying the role as `max`.
- Subagent `yield` structured results no longer get corrupted by lossy argument repairs; prompt guidance improved for weak callers.
- GitHub `file_read` returns proper image blocks and direct view URLs for image/binary files.
- Cancelled prompts during pre-stream turn setup restore the text and image attachments to the editor.
- `top` builtin accepts single-dash macOS flags such as `-pid` and `-stats`.
- GNU/BSD compat sweep across built-in shell utilities (`timeout`, `diff`, `find`, `date`, `tail`, `head`, `rg`, `stat`, `truncate`, `cksum`, `sleep`, `which`, `nohup`, `kill`).

## [17.3.8] - 2026-08-19

- Fixed unquoted internal URLs in `bash` commands consuming adjacent shell operators into the resolved filesystem path.

### Added

- Added `providers.cacheRetention` setting (`/settings` → Providers → Protocol) to control prompt-cache retention per request: `auto` keeps the provider default (Anthropic: 5m entries with idle keep-alive refreshes), `short` forces 5m, `long` restores 1h TTLs where supported and disables the keep-alive refresh loop, `none` disables prompt caching.

### Changed

- The `read` tool now materializes a local text file once per invocation instead of once per consumer. A ranged read of a file within the snapshot cap previously cost four opens and three UTF-8 decodes — an 8KiB binary sniff, a streaming scan for the rendered window, a whole-file read for bracket context, and another whole-file read to hash the snapshot — with two of those readers separately normalizing line endings; whole-file reads under the structural summarizer paid a fifth read. Byte counts and truncation boundaries are now measured on the buffered bytes, so they stay exact for content that is not valid UTF-8. Files above the snapshot cap keep streaming, since nothing on that path wants the whole file. Raw reads, which skip the tree-sitter parse that documented the old cost, no longer pay for it.
- Documented that `bash.patterns` gates the `bash` tool only and does not cover a shell that `eval` can spawn via subprocess, and that closing that path needs a `tools.approval.eval` policy — noted in `docs/bash-tool-runtime.md`, `docs/approval-mode.md`, and `docs/settings.md` ([#8838](https://github.com/can1357/oh-my-pi/issues/8838)).

### Fixed

- Fixed the `/btw` panel re-committing its frame to native scrollback on every update while the primary turn is still streaming: a live region that pins itself (an anchored HUD/panel such as `/btw`) no longer leaks its scrolled-off rows just because an unpinned transcript seam sits above it in the same frame ([#8793](https://github.com/can1357/oh-my-pi/issues/8793)).
- Fixed a submitted `/skill:<name>` command staying invisible in the transcript until its awaited preflight (memory recall, `before_agent_start` hooks, auto-thinking classification, pre-prompt compaction) finished, so a slow step such as a Hindsight auto-recall timeout made the command look unaccepted. Idle skill submissions now paint an optimistic row immediately — like a normal prompt — and reconcile it in place when the canonical `message_start` lands ([#8895](https://github.com/can1357/oh-my-pi/issues/8895)).
- Fixed broker-backed MCP OAuth credentials never refreshing, so remote OAuth MCP servers dropped out of `/mcp` once their access token expired under `omp auth-broker serve`. The client threw on the broker-redacted refresh sentinel instead of asking the broker to refresh, and the broker had no `mcp_oauth:*` refresh path (`POST /v1/credential/:id/refresh` answered `Unknown OAuth provider`). The client now routes redacted MCP refreshes through the broker, and the broker refreshes MCP credentials with a generic `refresh_token` grant from the credential's embedded token endpoint and client id — so the background refresher also keeps MCP tokens live ([#8933](https://github.com/can1357/oh-my-pi/issues/8933)).
- Fixed `omp commit` split-commit failing with `corrupt binary patch` when a split commit contains a binary file. `parseFileDiffs` split the captured diff on `"\ndiff --git "`, consuming the `\n` that terminates each block, and `patch.join` stripped trailing newlines — both dropped the blank line that terminates a `GIT binary patch` block, so the rebuilt patch was rejected by `git apply --binary`. Both trailing and mid-diff binary blocks now survive the parse/rebuild round-trip byte-exact ([#8899](https://github.com/can1357/oh-my-pi/issues/8899)).
- Fixed `omp update` (and other non-launch subcommands) crashing with `error: Unknown option '--cwd'` when a leading global launch flag preceded the subcommand — e.g. a shell alias/wrapper that runs `omp --cwd <dir> update`. `resolveCliArgv` hoisted the subcommand to the front but forwarded the launch-only flag into `update`'s strict `node:util.parseArgs` parser, which rejected it. Launch-global flags before a launch-shaped command (`acp`/`launch`) are still forwarded; before any other subcommand they are now stripped as inapplicable ([#8891](https://github.com/can1357/oh-my-pi/issues/8891)).
- Fixed Claude Code marketplace plugins ignoring the `enabledPlugins` switch in `~/.claude/settings.json` and `.claude/settings(.local).json`: a plugin turned off for a project no longer loads there, and a local-scope install enabled for a project loads even when its recorded `projectPath` is a different directory
- Fixed revived subagents (warm lifecycle reviver and cold persisted reviver) rebuilding the session without initializing the extension runtime, leaving every runtime action throwing `ExtensionRuntimeNotInitializedError`. An extension with a `tool_call` handler that touched a runtime action (e.g. `appendEntry`) then tripped the fail-closed gate in `emitToolCall` and blocked every tool — including the hidden `yield` — so the revived agent could neither finish nor exit and looped until killed. Both revivers now call the shared `initializeExtensions` helper, restoring runtime actions, `onError`, and the `session_start` event ([#8824](https://github.com/can1357/oh-my-pi/issues/8824)).
- Fixed `omp commit` split-commit crashing with a misleading `No diff found for <path>` when a staged binary (or any payload) pushed `git diff --cached --binary` past the 8 MiB subprocess output cap. The capture is truncated silently, so files sorting after the binary vanished from the parsed diff; the split flow now requests a complete diff and fails fast naming the real cause instead ([#8897](https://github.com/can1357/oh-my-pi/issues/8897)).
- Fixed a mid-run compaction being misread as a phantom overflow: after a compaction rebased the in-flight context snapshot, `getContextBreakdown` used message position (`anchorIndex >= cutoffCount`) as a freshness proxy, so an in-flight provider response whose request predated the compaction out-ranked the rebased estimate and reported the pre-compaction token count (~2.6x the real one). This tripped the "Compaction freed too little context to make progress" guard and drove the frame-rescue path on a byte-identical `tokensBefore`. Assistant context snapshots now carry a monotonic compaction epoch, and a post-cutoff anchor whose epoch predates the last compaction is no longer trusted over the rebased estimate ([#8887](https://github.com/can1357/oh-my-pi/issues/8887)).
- Fixed `after_provider_response` extension handlers receiving the primary session model in `ctx.model` and `ctx.models.current()` for cross-provider side requests. `ExtensionRunner.emitAfterProviderResponse` accepted the response model but discarded it, so a handler revoking a credential on an HTTP 402 could target the wrong provider. It now threads the response model into the context, matching `emitBeforeProviderRequest` ([#8955](https://github.com/can1357/oh-my-pi/issues/8955)).
- Fixed the TinyFish web search provider ignoring the `lang:`/`language:` query directive, so every request fell back to the API's US/English geolocation. `parsed.lang` now maps onto TinyFish's `location`/`language` parameters (e.g. `lang:it-it` → `location=IT&language=it`), matching the DuckDuckGo, Perplexity, and SearXNG providers ([#8913](https://github.com/can1357/oh-my-pi/issues/8913)).
- Fixed the `/model` Roles panel silently dropping roles and model-keyed fallback chains that fell past the visible panel height: the list had no scroll window, so entries below the cutoff were unreachable with no indication anything was missing. The panel now windows around the cursor like the provider list and shows an `↑/↓ N more` hint when rows are clipped ([#8817](https://github.com/can1357/oh-my-pi/issues/8817)).
- Fixed task and eval subagents discovering newly added agent definitions while resolving their role aliases from stale startup settings. Subagent preflight now atomically reloads persisted settings before agent discovery while preserving live runtime overrides.
- Fixed images returned by tools mounted under `xd://` rendering only as file links instead of inline terminal graphics.
- Resume Cursor idle-stall turns after completed MCP/todo tool results. The watchdog already closes the Connect stream, so unmarked blocks no longer need the `exec-resolved` marker to continue.
- Fixed the Web Search Provider Order settings summary showing providers excluded from web search ([#8884](https://github.com/can1357/oh-my-pi/issues/8884)).
- Fixed subagents aborting when external thinking exposes `think` as the required prelude before their remaining tools become callable ([#8909](https://github.com/can1357/oh-my-pi/pull/8909) by [@olegpulatov](https://github.com/olegpulatov)).
- Fixed session-title generation ignoring user `/skill:<name>` invocations, so titles now see the skill name and args instead of only later assistant text.
- Fixed destructive `rm` escaping the critical-pattern approval check when anything separates the flags from the target, so `rm -rf -- /`, `rm --recursive --force /` and `rm -rf --no-preserve-root /` are now classified critical like `rm -rf /`. `--no-preserve-root` is treated as critical wherever it appears, since it is what defeats coreutils' own refusal to recurse on `/`.
- Fixed thinking-loop aborts (`AIError.Flag.ThinkingLoop`) walking `retry.fallbackChains` and switching to another model family on attempt 1, so a healthy planning turn on Grok 4.6 (SuperGrok / Cursor OAuth) no longer gets replaced by whatever the chain lists next. The loop guard now re-samples the same model with its `thinking-loop-redirect` notice, and no longer parks the model selector on a fallback cooldown. ([#8760](https://github.com/can1357/oh-my-pi/issues/8760))
- Fixed the clipboard image-paste keybind attaching Finder's generated file icon instead of the copied image on macOS. Current Finder `Cmd+C` pasteboards advertise both a `public.file-url` and a generated 1024x1024 icon bitmap, so `arboard::get_image()` succeeded with the icon and `InputController.handleImagePaste` attached it before the file-URL branch was ever reached. The handler now probes `readMacFileUrlsFromClipboard()` before the bitmap representation, so an image file URL wins over the co-advertised icon; pure bitmap pasteboards (screenshots, browser copies) and non-image file URLs still fall through to the image/text paths ([#8769](https://github.com/can1357/oh-my-pi/issues/8769)).
- Fixed the Home Manager module (`programs.omp.settings`) breaking every launch on macOS with `Failed to acquire native file lock … Permission denied (os error 13)`. The declared config is now copied into `~/.omp/agent/config.yml` as a writable file via `home.activation` instead of a read-only `/nix/store` symlink, so OMP can acquire its config lock and persist runtime changes; `home-manager switch` still reapplies the declared settings ([#8775](https://github.com/can1357/oh-my-pi/issues/8775)).
- Fixed OpenCode MCP servers 401ing when config used OpenCode's `{env:VAR}`/`{file:path}` substitution (e.g. `Bearer {env:MCP_KEY}` headers); the OpenCode loader now expands those tokens the way OpenCode does instead of only `${VAR}` ([#8778](https://github.com/can1357/oh-my-pi/issues/8778)).
- Fixed `omp update` leaking Bun's raw `fetch()` error ("pass `verbose: true` in the second argument to fetch()") when a proxy environment variable (`HTTPS_PROXY`, `ALL_PROXY`, …) uses an unsupported scheme such as SOCKS; the update check now reports an actionable message naming the offending variable and the http/https proxy requirement ([#8784](https://github.com/can1357/oh-my-pi/issues/8784)).
- Fixed worker subprocesses (memory embeddings, tiny-model titles, TTS/STT, JS eval, browser relay, LSP mux, daemon broker) running with their cwd pinned to the CLI install directory. They share the agent's foreground process group, and terminal cwd heuristics such as kitty's `new_tab_with_cwd` pick the newest process in that group, so new terminal tabs opened in `~/.bun/install/global/node_modules/@oh-my-pi/pi-coding-agent/dist` while any worker was alive. Workers now spawn with the absolute host entry and inherit the agent's cwd.
- Preserved MCP `ImageContent` tool-result blocks so vision-capable models and the TUI can inspect returned images instead of receiving only a text placeholder ([#8687](https://github.com/can1357/oh-my-pi/issues/8687)).
- Fixed a whole-file `read` of a file with a UTF-8 BOM minting a hashline tag hashed from BOM-bearing text. Because the patcher's live read strips the BOM, the next edit to that file only applied through stale-hash recovery and reported that the file had changed externally when it had not.
- Extension bare imports of workspace members now resolve inside installed git-dependency monorepo plugins (the walk recognizes `workspaces` roots; installed node_modules copies still shadow members)
- Fixed `omp completions <shell>` hanging after writing shell completion scripts to stdout by invoking `postmortem.quit(0)` upon completion. Prevents lingering event loop handles (such as background timers or sockets loaded when inspecting command metadata) from pinning the process and blocking tools like `chezmoi`.
- Fixed `omp --smoke-test` recursively deleting unrelated directories in `os.tmpdir()` (tmux/ssh sockets, editor state, build trees). The smoke broker now keeps its runtime dir under a private parent, and the dead-scope reclaim refuses any root that is not the `daemons` container and only prunes entries named like a 16-hex daemon scope key ([#8721](https://github.com/can1357/oh-my-pi/issues/8721)).
- Fixed high CPU during multi-subagent / workflowz / orchestrate sessions: each live tool block (streaming args, a running partial tool, or a `task` subagent) armed its own 80ms spinner `setInterval` driving `requestComponentRender`, so N concurrent live blocks created N unsynchronized repaint timers that kept the render scheduler awake near-continuously. The per-block timers are now consolidated into a single shared spinner ticker that repaints every live block in one coalesced frame per glyph step, independent of block count ([#8731](https://github.com/can1357/oh-my-pi/issues/8731)).
- Fixed `omp update` writing to the PATH launcher instead of the running binary on binary-only releases (major bumps or `omp.dist: "binary"`): a foreign symlink — e.g. an admin symlink into a shared install — now resolves to its real binary in every distribution channel, avoiding an `EACCES` on a root-owned link directory or a split-brain copy that shadows the shared install. Package-manager launchers keep their deliberate in-place takeover. ([#8732](https://github.com/can1357/oh-my-pi/issues/8732))
- Added `.css` to the built-in Biome server `fileTypes` so CSS files route through Biome's linter/asserter by default instead of requiring a full per-project `fileTypes` override. ([#8741](https://github.com/can1357/oh-my-pi/pull/8741))
- Fixed memory extraction sending its instructions, few-shot examples, and the user's message as a single user turn, which caused small local models to echo the examples instead of extracting facts; instructions now travel as a system turn and the raw text as the user turn
- Fixed local title generation stopping on a stop string that appeared in the prompt instead of the generated tokens
- Fixed the Subagents HUD role display and restored generated task labels by keeping spawn handles separate from UI descriptions.
- Fixed `models.yml` custom-model providers declaring `auth: oauth` being rejected by validation with "apiKey is required", which forced a dummy `apiKey` that then shadowed the broker's OAuth tokens ([#8937](https://github.com/can1357/oh-my-pi/pull/8937) by [@usr-bin-roygbiv](https://github.com/usr-bin-roygbiv)).
- Provider-qualified model selectors (e.g. `anthropic/claude-opus-5`) now fail closed when the named provider is unavailable instead of silently re-binding to OpenRouter's same-named flat id and billing the aggregator ([#8832](https://github.com/can1357/oh-my-pi/issues/8832)).
- Fixed PlanYolo plan approval dropping all MCP tools: the post-handoff tool restore now accounts for MCP discovery that completed while planning instead of restoring a pre-discovery snapshot.
- Fixed parallel `web_search` calls hanging forever past the 60s timeout when the shared headless-browser daemon or page died mid-setup; browser fallback setup and teardown are now abort-protected ([#8865](https://github.com/can1357/oh-my-pi/issues/8865)).
- Fixed extension-package `.mcp.json` `${VAR}` env placeholders (stdio env/command/args/cwd, HTTP url/headers/oauth) reaching MCP servers unexpanded.
- Advisor blocker advisories raised inside the post-interrupt immune window now wake a new turn instead of parking as asides until the next user prompt.
- The exit banner only advertises `omp --resume <id>` when the session was actually written to disk, so the printed command no longer fails for sessions that ended before persistence ([#8860](https://github.com/can1357/oh-my-pi/issues/8860)).
- Fixed terminals that deliver Shift+Enter as a bare LF (or the legacy CSI `13;2~` form) getting a plain switch instead of summarize-and-switch in the `/tree` selector ([#8821](https://github.com/can1357/oh-my-pi/issues/8821)).
- Fixed OMP panicking at startup when the host environment contains a non-UTF-8 variable value; such entries are now skipped when copying the host environment into the shell ([#8925](https://github.com/can1357/oh-my-pi/issues/8925)).
- Fixed `/mcp reauth` refusing to run the OAuth flow for HTTP MCP servers that allow unauthenticated `initialize` but require auth for `tools/call`; endpoint discovery now runs against the server URL before giving up ([#8922](https://github.com/can1357/oh-my-pi/issues/8922)).

## [17.3.7] - 2026-08-17

### Changed

- Send the `omp/<version>` User-Agent on xAI chat (`xai` and `xai-oauth`) unless the request already set its own ([#8840](https://github.com/can1357/oh-my-pi/pull/8840) by [@Jaaneek](https://github.com/Jaaneek)).

## [17.3.6] - 2026-08-17

### Added

- Added `ExtensionAPI.registerFileWriteFallback(handler)` and `ExtensionAPI.registerFileDeleteFallback(handler)`, letting an extension supply a fallback writer or deleter that is consulted when a native `write`, `edit`, or `apply_patch` byte-write or unlink is denied with a permission error (`EPERM`/`EACCES`/`EROFS`) — for hosts that embed the agent inside a sandbox that denies direct filesystem access but exposes a privileged channel. The brokered path is symlink-resolved so a handler's allowlist sees the real destination, a destination that cannot be resolved is not brokered at all, and `req.sessionId` names the session that issued the mutation so a handler sharing the process-wide registry can enforce policy per session. See [`docs/extensions.md`](../../docs/extensions.md).

### Changed

- Updated the default model for XAI_API_KEY (xai) and SuperGrok OAuth (xai-oauth) to grok-4.6. Automatic model selection continues to prefer paid xai/grok-4.6 when only XAI_API_KEY is set, with xai-oauth/grok-4.6 still available explicitly.

### Fixed

- Fixed `omp stats` and `/stats` dashboards being unreachable from container hosts by accepting an explicit `--host` bind address while preserving the `127.0.0.1` default.

## [17.3.5] - 2026-08-16

### Added

- Added Extensions tab group to settings schema

### Changed

- Routed paid xAI models (XAI_API_KEY / xai/…) through the Responses API used by SuperGrok OAuth instead of Chat Completions, including reliable replay of encrypted reasoning content on follow-up turns.
- Updated the default model for XAI_API_KEY (xai) to grok-4.5, and the default SuperGrok OAuth (xai-oauth) model to grok-4.5. Automatic model selection continues to prefer paid xai/grok-4.5 when only XAI_API_KEY is set, with xai-oauth/grok-4.5 still available explicitly.
- Stopped sending presence/frequency penalties and stop sequences to xAI reasoning models such as grok-4.5, which reject them.

### Fixed

- Fixed `hub` job and wait lists hiding stale running subagent registrations that have no turn in flight, ensuring they remain visible so operators can cancel them
- Fixed external thinking scratchpads running alongside native reasoning on xAI Grok 4 and other reasoning-only Responses models that reject `reasoning.effort`
- Fixed llama.cpp model discovery producing a baseUrl without the /v1 prefix for non-Qwen models, causing 404 errors on OpenAI-compatible endpoints.
- Fixed prompt caching on open-weight providers (DeepSeek, Qwen, GLM, …) so tool schemas stay cached across directory changes and midnight rollovers.
- Fixed omp --fork omitting the source session's artifact directory, so CLI-created forks now preserve artifact:// references like interactive /fork.
- Fixed long ask option labels being hard-truncated at the terminal width; labels now wrap onto indented continuation lines.
- Fixed toggling display.showTokenUsage from /settings leaving existing token-usage rows stale until the transcript was rebuilt.
- Fixed mid-run auto-compaction blocking the live loop while waiting on extension handlers, which could hang after a snapcompact or context-full pass.
- Reduced peak memory for persisted subagent revival probes by streaming large file-backed session journals instead of loading them fully.
- Improved responsiveness of streaming edit previews for large diffs by rendering only the visible tail.
- Fixed repeated /btw panels committing transient frames to native scrollback and replaying conversation history after dismissal.
- Clarified that closing browser tool sessions releases managed handles without closing pages in spawned, CDP-connected, or relay browsers.
- Fixed interrupted vibe_wait calls being reported as elapsed timeout windows.
- Improved checkpoint/rewind prompt rendering to stay accurate after a rewind and be more concise.
- Fixed Cursor turns dying with HTTP/2 stream errors (NGHTTP2_INTERNAL_ERROR / NGHTTP2_REFUSED_STREAM) after tool calls already had results, instead of leaving the agent idle until the user typed "continue".
- Fixed mixed-case plugin tool names being lowercased during tool-set refresh, which unmounted them from xd:// whenever MCP tools connected.
- Fixed Exa MCP servers being unmounted when their config explicitly requests tools the native Exa integration does not provide, breaking /mcp reconnect exa.
- Fixed Claude Code custom tool discovery attempting to import non-module files from .claude/tools.
- Fixed Agent Hub parking a mid-spawn child session so subsequent task calls failed with an ownership error and the row could never be revived.
- Fixed the welcome banner displaying a stale model name when the session's active model changes after startup (e.g. after a delayed config load or an explicit /model switch).
- Fixed Nix standalone binaries retaining Bun's build-time package in their runtime closure.
- Fixed birch user/custom message card contrast on dark terminals, where chat bubbles could render light-on-light.
- Fixed hidden tool snapshots preventing long streamed assistant responses from entering terminal scrollback.
- Prevented omp models from loading ambient hook factories while preserving extension-contributed providers.
- Fixed the ask dialog's multi-select mode dead-ending on Enter; Space now toggles options and Enter submits the current selection.
- Fixed workspace diagnostics reporting a clean workspace when its checker crashed without producing output.
- Fixed manual /compact failing outright when a summarization request hit a transient provider overload.
- Fixed transient Anthropic failures (overloaded_error, rate_limit_error, 429/500/502/503/529) aborting or silently degrading side-effect-free background LLM calls such as session title generation, TTS speech enhancement, commit-message generation, thinking/stop classifiers, memory extraction/consolidation, and commit analysis/summary/changelog passes; these now retry with backoff honoring retry-after instead of failing or returning an indistinguishable empty result.
- Fixed the shared headless browser daemon launching from the macOS system Google Chrome bundle, which could cause macOS to route the user's link clicks to the automation daemon and silently swallow them; the daemon now prefers an isolated Chrome for Testing binary on macOS.
- Reclaimed abandoned daemon runtime directories under ~/.omp/run/daemons/, preventing unbounded growth of leftover Chromium profiles and broker state.
- Kept the welcome screen's Tips, LSP Servers, and Recent sessions visible when a long model name still leaves enough terminal width for both columns.
- Fixed focused shimmer animation frames (ultrathink, orchestrate, workflowz) repainting the full TUI too frequently, causing high CPU usage while composing prompts on WSL2.
- Fixed the /debug report bundle including unrelated historic sessions, leaking other sessions' files and bloating archives.
- Fixed adopted keep-alive agents remaining stuck in a running state in the registry after deferred turn settlement, and prevented stale refs from sustaining bare hub wait calls indefinitely.
- Fixed home-relative marketplace catalog paths not being expanded before cache access, preventing updates from writing into a literal ~ directory.
- Fixed broker-owned headless Chromium opening and retaining an unowned blank foreground window on Windows.
- Fixed the auto thinking classifier failing every turn on Anthropic models served through LiteLLM/Vertex due to a thinking-budget mismatch.
- Fixed always-ask approval prompts bypassing edit preview readiness when a built-in tool executes under its wire-level alias, such as edit running as apply_patch.
- Fixed lsp reload crashing non-rust-analyzer language servers by sending them a rust-analyzer-specific request; that request is now gated to rust-analyzer only.
- Fixed browser open failing with "Shared browser daemon unavailable" when HTTP_PROXY/HTTPS_PROXY is set, because liveness probes were incorrectly routed through the proxy.
- Fixed defaultThinkingLevel: auto skipping classification for user-invoked /skill:<name> turns, leaving the effort stuck on pending auto.
- Fixed custom-tool directory discovery recursing into subtrees despite a non-recursive default, which could crash startup when scanning large dependency directories such as Python venvs.
- Repaired torn session JSONL appends after disk-write failures, rewrote malformed resumed files before their next append, retried transient persistence failures, and surfaced failures in the TUI.
- Prevented Anthropic model fallback from replaying model-bound thinking blocks across models, and surfaced immutable-thinking errors without retrying the unchanged invalid turn.
- Fixed empty-stop failure messages always suggesting a context problem even when the provider billed output tokens; the message now reports the billed token count and points at a provider-side filter/translation issue when appropriate.
- Fixed a parked, session-less agent-registry entry with no reviver permanently poisoning its agent id, preventing fresh subagent spawns from reusing that id.
- Made extension tool-call timeouts configurable and paused them during user dialogs.
- Fixed /vibe cancellation leaving an in-flight model turn unaware that Vibe mode and its tools were removed.
- Fixed empty local-model stops lingering on the persisted active branch after retries, preventing them from resurfacing after reload or a mid-retry process kill.
- Fixed the Biome linter client silently dropping every diagnostic due to an outdated JSON output schema; it now supports Biome 2.x's diagnostic format.
- Fixed `hub jobs` and empty `hub wait` snapshots hiding running subagents that have no live turn, which removed the only way to discover and `hub cancel` a stale registration; such agents are listed again and flagged as having no turn in flight.
- Fixed external thinking being offered on xAI reasoning-only Responses models (grok-4 family) that reject `reasoning.effort`, where the private scratchpad ran alongside native reasoning instead of replacing it.
- Fixed the extension tool-call handler timeout rendering outside a titled section in `/settings` by registering its Extensions group on the Tools tab.

## [17.3.4] - 2026-08-14

### Changed

- Replaced the MuPDF-WASM PDF document backend with `pdf-inspector` through `@oh-my-pi/pi-natives`, preserving cached text conversion and PDF line selectors while reporting pages that need OCR.
- Restored `read <pdf>:` and `read <pdf>:<image>.png` page rendering by automatically capturing PDF pages through the headless Chromium browser tool.

### Fixed

- Fixed Streamable HTTP MCP sessions being invalidated by opening the optional GET SSE stream before sending `notifications/initialized`, which prevented Figma Dev Mode MCP from connecting ([#8514](https://github.com/can1357/oh-my-pi/issues/8514)).
- Fixed the `/hotkeys` table describing Ctrl+D (`app.exit`) as "Exit (when editor is empty)" when it actually exits unconditionally and saves the current prompt as a resumable draft ([#8530](https://github.com/can1357/oh-my-pi/issues/8530)).
- Fixed Ctrl+G external editors failing to launch on Windows because Bun re-quoted the embedded `cmd.exe /c` command line ([#8544](https://github.com/can1357/oh-my-pi/issues/8544)).

## [17.3.3] - 2026-08-14

### Fixed

- Automatically continued Gemini turns that stopped after thinking without final output, using a bounded final-answer reminder instead of exhausting generic retries.
- Retried Gemini `MALFORMED_FUNCTION_CALL` failures when every emitted tool call was proven unexecuted, while preserving real tool-result and visible-output replay guards.
- Kept current terminal retry errors in one pinned banner with attempt context while surfacing local continuation failures instead of stale provider errors.

## [17.3.2] - 2026-08-13

### Fixed

- Fixed the parent TUI stalling after a subagent submits its result until terminal focus or resize wakes the event loop ([#8462](https://github.com/can1357/oh-my-pi/issues/8462)).
- Fixed `omp update` misclassifying foreign npm/bun bin aliases while preserving package-manager ownership for globally linked checkouts ([#8468](https://github.com/can1357/oh-my-pi/issues/8468)).
- Fixed `read` hashline headers collapsing nested in-workspace paths to the bare basename, which let a same-basename file at the session cwd capture a verbatim follow-up `edit` and deterministically reject it with `hash is not from this session`. Headers now retain the workspace-relative path (e.g. `[src/settings.json#0063]`) ([#8482](https://github.com/can1357/oh-my-pi/issues/8482)).

## [17.3.1] - 2026-08-13

### Fixed

- Fixed Claude Code user discovery ignoring CLAUDE_CONFIG_DIR for configuration, plugins, MCP servers, and imported sessions.
- Fixed the status-line git branch display freezing after switching branches.
- Fixed Pi extension contexts omitting the runtime mode, which caused TUI guards to silently disable extension UI.
- Fixed extension-registered tool names being rejected by the --tools flag before extension discovery, which prevented least-privilege sessions from allowlisting plugin tools.
- Fixed omp plugin install failing with cloning errors for legacy Pi extensions whose tool schemas use legacy-typebox builders.
- Fixed omp update aborting with chmod ENOENT when concurrent update runs overlapped by using unique download temporary paths.
- Fixed the browser tool executable probe launching the user's installed GUI Chromium on Windows: the `--version` version probe from ecb22957 was Linux-scoped but ran for every platform candidate, so on Windows it could hand off to a running `chrome.exe`, open a normal browser window, then reject the candidate and fall back to cached Chrome for Testing. The probe is now confined to Linux ([#8445](https://github.com/can1357/oh-my-pi/issues/8445)).

## [17.3.0] - 2026-08-13

### Breaking Changes

- Removed the global `advisor.subagents` setting. Subagent advisors are now configured per agent via frontmatter or `task.agentAdvisor`. Existing configurations of `advisor.subagents: true` will automatically migrate to `task.agentAdvisor: { task: "on" }`.

### Added

- Added Astral `ty` as a built-in fallback Python LSP server (`ty server`), ordered behind `pyright`, `basedpyright`, and `pylsp`.
- Added first-party Nix support, including reproducible source builds for Linux and macOS, a pinned development shell, NixOS and Home Manager modules, and offline Bun dependency support.
- Added support for per-agent advisors configured via the `advisor` frontmatter field or the `task.agentAdvisor` settings, allowing different agents to be advised by different models.
- Redesigned the `/agents` interface as a fullscreen hub featuring a scope sidebar, type-to-filter search, a pinned detail pane, mouse support, and interactive property chips for configuring agent settings.
- Prepared for the upcoming npm package rename by updating `omp update` and startup version checks to follow the `omp.rename` pointer in the published manifest.

### Changed

- Updated `/usage`, `omp usage`, and the status line to display authoritative OpenCode Go quota usage directly from the official endpoint, replacing estimated costs with actual usage across three time windows (5h, 7d, and monthly).
- Documented the source-available local protocol relay and clarified that production collaboration relay binaries are not currently published.
- Enabled bounded Anthropic prompt-cache refreshes for the main agent loop while isolating advisor and side-channel requests from the shared refresh timer.

### Fixed

- Fixed multiple Language Server Protocol (LSP) issues, including concurrent sessions sharing backend overlays, stale document overlays after workspace edits, incorrect transactional edit advertisements, unhandled snippet placeholders in rust-analyzer, and failing to restore overwritten targets during failed file renames.
- Fixed LSP `diagnostics` incorrectly reporting success when all language servers failed.
- Fixed Hindsight memory scoping splitting repositories across multiple scopes on case-sensitive filesystems by lowercasing the project label.
- Fixed the CLI crashing at startup with a raw `AuthBrokerError` when the configured auth broker is unreachable, replacing it with an actionable error message.
- Fixed various resource and process leaks, including idle launch brokers staying alive indefinitely, stale MCP connections leaving child processes open, and undrained stdout in DAP `runInTerminal` requests.
- Fixed custom STB-backed vision providers failing to decode WebP images by automatically detecting image formats from bytes and normalizing WebP blocks.
- Fixed command-backed provider API keys (`!command`) staying pinned to cached values after receiving an HTTP 401 error.
- Fixed the `/agents` Control Center failing to open when model overrides are configured as YAML arrays.
- Fixed session-title generation regressions by restoring plain-sentence phrasing and name-fidelity instructions.
- Fixed agent-facing prompts and system instructions mentioning tools that are absent from the current session catalog.
- Fixed manual `/shake` discarding all tool results; it now retains a small recent tail of results to preserve active working context.
- Fixed `omp install` failing validation for extensions importing legacy `is<Tool>ToolResult` event guards.
- Fixed profile aliases generated by standalone binaries invoking Bun's embedded virtual script instead of the installed `omp` command.
- Fixed `/skill:<name>` tokens in `/plan` or `/vibe` inline prompts being treated as literal text instead of executing the skill.
- Fixed long streaming `write` previews stalling the TUI by optimizing file scanning and splitting.
- Fixed the Windows console disappearing when running commands like `/stats`.
- Fixed retry-fallback selection switching to a fallback model with a context window too small to hold the current session context.
- Fixed OpenCode discovery ignoring `opencode.jsonc` files and rejecting comments in `opencode.json`.
- Fixed WSL2 startup hanging forever when the Windows interop pipe is wedged: the WSL host-home discovery probes (`cmd.exe`, `wslpath`) now run under a 500ms hard timeout and fall back to the Linux `$HOME`/`~/.omp` candidates ([#8402](https://github.com/can1357/oh-my-pi/issues/8402)).

## [17.2.15] - 2026-08-12

### Added

- Added `--external-thinking` CLI flag to force external thinking tool activation.
- Added `omp compress` command, which uses an isolated, two-tool agent loop to rewrite single or multiple text files (supporting glob patterns and concurrent processing) into dense prompt registers.
- Expanded tool discovery in `omp cleanse` to support `staticcheck` and `golangci-lint` (Go); `mypy`, `pylint`, `flake8`, `ty`, and `basedpyright` (Python); `oxlint`, `deno lint`, `stylelint`, and `vue-tsc` (JS/TS); and `actionlint` (GitHub Workflows).
- Added support for natural language requests in `omp cleanse "<request>"`, which launches a discovery subagent to automatically inspect the project, determine the correct commands, and map outputs.
- Added an interactive picker to `omp cleanse` when run without arguments on a TTY, allowing users to run all checkers, select a specific checker, or describe what to fix.

### Changed

- Restricted the `think` tool to GPT, Claude, and Gemini transports that support native reasoning replacement.
- Increased the default subagent cap for `omp cleanse` from 8 to 32.

### Fixed

- Fixed a hang in headless `omp -p` runs when `plan.defaultOnStartup: true` is enabled by disabling the startup default in print mode.
- Fixed `display.hideToolActivity` failing to hide certain activity blocks, such as reminders, diagnostics, and completions.
- Fixed several issues in the MCP Streamable HTTP transport, including updating the negotiated protocol version to `2025-11-25`, resolving connection drops and SSE resumption gaps, and preventing double-execution of tools during auth refreshes.
- Fixed `/handoff` losing local artifacts (plans, scratch files, research notes) by copying them across the handoff session boundary.
- Replaced libarchive-based tar parsing with a hardened, in-process tar reader to prevent crashes and safely handle complex archive structures, symlinks, and sparse metadata.
- Fixed `Ctrl+O` tool-output expansion failing to reach launch-completion messages wrapped in the hidden tool activity container.

## [17.2.14] - 2026-08-11

### Added

- Added `externalThinking` setting for private scratchpad reasoning via the new `think` tool

## [17.2.13] - 2026-08-11

### Added

- Added `searxng.safesearch` setting option for SearXNG searches
- `omp update` now honors an `omp.dist` distribution field published in the release's npm manifest and treats major-version bumps without one as binary-only: bun/npm-managed installs are migrated to the standalone GitHub release binary in place instead of running a package-manager install that a non-npm release (e.g. a runtime change) would break. Windows script-shim installs (npm's `omp.cmd`/`omp.ps1`) are taken over seamlessly by installing `omp.exe` beside the shims and retiring them.
- Added support for Cloudflare AI Gateway routing for Gemini search
- Added support for Exa MCP search provider
- Added domain inclusion/exclusion filtering and URL deduplication for TinyFish search
- Fixed `/vibe` mode losing the pre-vibe toolset when a session already in vibe mode switches into another session that is also in vibe mode, which left `bash`, `edit`, `write`, `grep`, `glob`, `task`, and `hub` silently unavailable after exiting the mode; the pre-vibe toolset is now recorded on the `mode_change` entry and restored from there.
- Preserved extension-filtered pasted image payloads and source links when `/goal`, `/plan`, or `/vibe` submits the composer draft.
- Fixed Agent Hub lineage registration timestamps displaying in UTC instead of the user's local timezone.
- Fixed Python/Julia/Ruby eval kernels failing to start after their staged runner script was cleared mid-session (e.g. a macOS tmpdir sweep): the memoized runner path is now re-validated so a long-lived process self-heals instead of only recovering on restart ([#8140](https://github.com/can1357/oh-my-pi/issues/8140)).
- Fixed session resume fully reading and parsing the journal twice by reusing the entries already loaded by `SessionManager.open()` ([#8117](https://github.com/can1357/oh-my-pi/issues/8117)).
- Fixed RPC `message_end` frames being serialized more than once before output while preserving v1 and v2 wire bytes ([#8118](https://github.com/can1357/oh-my-pi/issues/8118)).
- Fixed message conversion caching strongly retaining the last session transcript and converted output after session disposal ([#8119](https://github.com/can1357/oh-my-pi/issues/8119)).
- Fixed timed-out LSP requests continuing to consume server CPU and block queued requests by sending `$/cancelRequest` ([#8116](https://github.com/can1357/oh-my-pi/issues/8116)).
- Fixed `shutdownAll()` leaving the configured LSP idle checker alive and preventing short-lived SDK hosts from exiting ([#8115](https://github.com/can1357/oh-my-pi/issues/8115)).
- Fixed terminal Mermaid borders and junctions using low-contrast UI chrome colors instead of the active theme's readable content color.
- Fixed Cursor provider sessions flooding bash/grep validation errors (`cwd`/`case`/`skip` "was undefined") when Cursor omitted optional exec-frame fields; the exec bridge now omits unset optional kwargs before tool execution and transcript synthesis.
- Added structured reset-reason logging to advisor context re-primes (issue #7226): every history-rewrite trigger (compact, auto-compaction, compaction-rescue, shake, drop-images, prune-tool-outputs, prune-stale-tool-results, conversation-boundary, context-maintenance) now emits an `advisor context reset` debug event with its reason, so full-transcript replays can be attributed to a concrete path.
- Added `quarantine-recovery` and `quarantine-retry-exhausted` reset reasons to advisor context-reset debug logs, so advisor full re-primes after quarantined output remain attributable without changing quarantine retry semantics (issue #7226).

### Changed

- Standardized first-party outbound User-Agent headers on `omp/<version>` via the shared `USER_AGENT` utility.

### Fixed

- Fixed `/usage`, `/advisor status`, and every other panel command answering only after the agent stopped working. Since `17.0.1` their output was queued until the turn settled (to stop mid-turn transcript mounts duplicating rows in native scrollback, issues #4806/#6767), and the deferral was silent, so on a long turn the command was indistinguishable from a dead one. The panel now renders immediately above the editor in an anchored container that is cleared and rebuilt in place, never entering the transcript, and the full output still lands in the transcript at the next settle. The preview is capped to 40% of the viewport (minimum 6 rows) so a tall report cannot push the prompt off screen.
- Fixed the todo panel showing no progress while the agent worked through a plan: every sub-todo read as unchecked no matter how far along the run was. Three causes, all in the collapsed (default) view — the walking viewport dropped *every* closed row, so a completion only ever removed a line and the card's strike-reveal animation ran against a row nobody rendered; the phase the agent was actually in was the one phase header rendered without a `done/total` count; and the 60s todo auto-clear deleted closed tasks from an unfinished plan, resetting the phase counter to `0/n` and renumbering the stages until the next `todo` call restored the real snapshot. The viewport now keeps the newest closed task as a checked lead row (additive to the open-task cap), every phase header carries its progress, counts include abandoned tasks, and auto-clear only fires once the whole list is settled.
- Status-line `usage` now renders monthly Cursor quotas (`mo N%`) in addition to the existing `5h` / `7d` windows ([#7998](https://github.com/can1357/oh-my-pi/pull/7998) by [@dnth](https://github.com/dnth)).
- Restored the `ctx.ui.custom()` overlay API that regressed after v0.45.6: `overlayOptions` (anchor/width/maxHeight/margin positioning and sizing) is now forwarded to `showOverlay` instead of a hardcoded full-cover geometry, `onHandle` receives the resulting `OverlayHandle`, and `OverlayHandle`/`OverlayOptions` are exported from the extension API types again.
- Fixed a content refusal that arrives after the model already emitted a tool call ending the turn outright instead of consulting the model fallback chain. When the refused turn produced nothing visible and every emitted tool call provably never executed (each paired with a synthetic `executed: false` result), the turn is now retryable and the configured `retry.fallbackChains` entry gets its chance, matching how a refusal with no tool calls already behaves.
- Fixed proxy discovery preferring the bundled catalog name over the proxy-reported name, so `omp models refresh` now updates stale display names (e.g. a proxy serving `longcat-2.0` as `"LongCat"` no longer shows the raw id).
- Fixed the compiled binary build on Windows: `Bun.Glob.scan` yields backslash-separated paths, which the legacy Pi virtual module used verbatim for export keys and generated identifiers, producing invalid JavaScript.
- Fixed Ctrl+O (`app.tools.expand`) not expanding truncated tool output while a tool-approval prompt or other selection dialog held keyboard focus, by promoting the shortcut to a global input listener that fires regardless of focus (it still defers to fullscreen overlays and the tree selector's own Ctrl+O filter cycle) ([#7837](https://github.com/can1357/oh-my-pi/issues/7837)).
- Fixed `omp commit` printing a wall of bundled source when a `pre-commit`/`commit-msg` hook refuses a commit: hook failures are now reported with the hook's own message, split plans report how far they got, and the command exits non-zero cleanly ([#7834](https://github.com/can1357/oh-my-pi/issues/7834)).
- Fixed `omp commit --push` exiting 0 without pushing when the working tree is already clean; it now pushes the existing commits (or fails non-zero if the push is refused) ([#7834](https://github.com/can1357/oh-my-pi/issues/7834)).
- Subagents spawned through a model-role alias now inherit that role's `retry.fallbackChains` entry instead of the `default` chain. Both spawn paths (`task` and vibe workers) expand the alias — the bundled `task` agent's `@task`, `sonic`/`scout`'s `@smol` — before it reaches the executor, so the role identity was lost and every child was pinned to the `default` chain, routing retries onto models the operator had deliberately kept out of the role's chain. Completes [#7694](https://github.com/can1357/oh-my-pi/pull/7694), which only covered agents whose unexpanded alias reached the executor ([#7910](https://github.com/can1357/oh-my-pi/pull/7910) by [@enieuwy](https://github.com/enieuwy)).
- Fixed standalone `AGENTS.md` discovery stopping at nested Git repository roots, so enclosing workspace instructions are loaded while home-level instructions remain scoped correctly.
- Split the advisor Session update delivery into per-source-message user messages (single `Agent.prompt(AgentMessage[])` call) so provider prompt caches grow with the session instead of staying pinned at the instructions/tools boundary; rendering stays byte-identical to the old single-block update.
- Restore the advisor primary-context dedup map when a failed advisor turn is rolled back, so retried batches re-deliver first-time plan/goal context in full instead of collapsing it to "(unchanged — still in effect)".
- Include all renderer-read fields (excludeFromContext, bashExecution command, pythonExecution code, branch/compaction summary + fromId, fileMention files) in advisor prefix fingerprints so clones changing only those fields correctly trigger a re-render.
- Fixed Gemini advisors treating a valid silent review as an empty-response failure, repeatedly retrying the turn and eventually dropping the advisor backlog. ([#8223](https://github.com/can1357/oh-my-pi/issues/8223))
- Fixed bash-tool commands receiving an unguarded `CI=1`, which broke clap-based CLIs (e.g. `tauri android build`) that parse `CI` as a strict boolean, and ignored the documented `PI_BASH_NO_CI` opt-out. The per-command env now injects clap-compatible `CI=true` and honors `PI_BASH_NO_CI`/`CLAUDE_BASH_NO_CI` ([#8229](https://github.com/can1357/oh-my-pi/issues/8229)).
- Fixed macOS key hints rendering the Linux/Windows modifier names `Alt` and `Super` across every hint surface (`/hotkeys`, status bar, autocomplete, pending-message bar, copy selector, ask dialog): `alt` now renders as `Option` and `super` as `Cmd` on darwin, and the static `/hotkeys` navigation rows are platform-aware instead of hardcoding macOS `Option`/`Cmd` names on every platform ([#8235](https://github.com/can1357/oh-my-pi/issues/8235)).
- Fixed `omp plugin uninstall <plugin> --dry-run` actually removing the plugin on both the npm and marketplace routes; dry-run now reports what would be removed and leaves installed plugin state unchanged ([#8178](https://github.com/can1357/oh-my-pi/issues/8178)).
- Fixed handled OMP shutdown persisting running subagents as terminally aborted instead of restoring their transcripts as parked and revivable. ([#8216](https://github.com/can1357/oh-my-pi/issues/8216))
- Fixed `always-ask` approval prompts opening before large edit previews finish rendering, preventing blind approvals ([#7957](https://github.com/can1357/oh-my-pi/issues/7957)).
- Fixed Pi-compatible extensions registering tools during asynchronous session startup being omitted from the live model tool registry.

### Removed

- Removed the `resolveAgentModelSource` model-resolver export, whose only use was being fed to `resolveExplicitModelRole`. Replaced by `resolveAgentModelSelection`, which returns the expanded `patterns` and the pre-expansion `role` together so a spawn path cannot derive one without the other ([#7910](https://github.com/can1357/oh-my-pi/pull/7910) by [@enieuwy](https://github.com/enieuwy)).
- A run is now attributed to the model that actually produced its output, not whichever model the session was last pointed at. A retry fallback that errored on its first request — an exhausted quota, a hard provider error — was credited with the whole run in the Agent Hub row and the settled task result, even when the previous model did every turn. Sessions expose the serving model directly, holding the last model that produced output while a candidate is armed but unproven, and transcript-derived history stops at the newest turn that produced output.

## [17.2.12] - 2026-08-08

### Fixed

- Fixed shell minimization replacing meaningful `rustc --print` output with `OK`.
- Fixed shell minimization altering outputs shorter than 1,000 characters; these now pass through unchanged.
- Fixed primary and advisor Codex sessions falling back to another provider before trying sibling accounts when an account lacks Trusted Access for Cyber approval.
- Fixed task subagent assistant turns being omitted from the per-model TPS/TTFT aggregates shown by `/models`. ([#8022](https://github.com/can1357/oh-my-pi/issues/8022))
- Fixed terminal-title spinner writes consuming CPU during WSL/ConPTY agent waits by using the same static working separator as native Windows ([#8012](https://github.com/can1357/oh-my-pi/issues/8012)).
- Fixed long-running sessions leaking memory for every completed keep-alive `task`/scout subagent: a disposed (parked) subagent's `AgentSession` stayed pinned through the lifecycle adoption record's reviver closure, and `dispose()` never released the message array, append-only provider transcript, session-manager entries, or the raw-SSE debug buffer, so heavy transcripts and captured provider wire frames accumulated for the process lifetime ([#8003](https://github.com/can1357/oh-my-pi/issues/8003)).
- Fixed Z.AI web search dropping sources and exposing raw JSON when MCP responses double-encode content text ([#8000](https://github.com/can1357/oh-my-pi/issues/8000)).
- Fixed `/handoff` masking empty/whitespace-only generation and harness-initiated aborts as "Handoff cancelled"; manual empty generation now surfaces a logged failure, harness aborts preserve their reason (or report "Handoff aborted by session"), and auto-handoff still falls back to context-full compaction ([#7993](https://github.com/can1357/oh-my-pi/issues/7993)).

## [17.2.11] - 2026-08-07

### Added

- Added support for the Agent Plugins 1.0.0 standard, enabling automatic discovery, validation, and secure execution of compliant plugin packages.
- Added the `omp share <session>` command to share saved sessions by ID prefix or file path without launching the agent.
- Added the `AGENT=1` environment variable to child processes spawned by `coding-agent` to allow downstream tools to detect agent-driven execution.

### Changed

- Consolidated Exa web-search configuration under `exa.enabled`, automatically migrating legacy `exa.enableSearch` values and removing obsolete Researcher and Websets settings.
- Removed stale `computer.backend` values during configuration migration.
- Updated documentation and error messages for the JavaScript/TypeScript debug adapter (`js-debug-adapter`) to clarify supported installation paths (Mason, standalone tarball, or `JS_DEBUG_DAP_SERVER`).

### Fixed

- Fixed an issue where `/reload-plugins` and the Agent Control Center failed to propagate updated agent definitions to existing tools without a restart.
- Fixed legacy Pi extensions failing to load when calling `pi.unregisterProvider()`, ensuring provider replacements take effect immediately.
- Fixed zero-width daemon readiness and wait regex matches being rejected by the hub wire decoder.
- Fixed proxy model discovery preferring bundled catalog names over proxy-reported names, allowing `omp models refresh` to correctly update display names.
- Fixed Windows compiled binary builds failing due to backslash-separated paths in `Bun.Glob.scan` producing invalid JavaScript in virtual modules.
- Fixed the Ctrl+O (`app.tools.expand`) shortcut not expanding truncated tool output when a tool-approval prompt or selection dialog had keyboard focus.
- Improved `omp commit` error reporting when pre-commit or commit-msg hooks fail, displaying the hook's own message and exiting non-zero cleanly instead of printing bundled source code.
- Fixed `omp commit --push` exiting with code 0 without pushing when the working tree is already clean; it now correctly pushes existing commits.
- Fixed `omp commit` exiting with code 0 when the commit agent failed and fell back to a mechanical commit; it now exits non-zero to indicate the fallback was used.
- Fixed strict output schemas being rejected when native JSON Schema definition maps contain `ref` or applicator branches use `properties` without `type`.
- Fixed shell syntax extraction in `cd <path> && ...` commands to prevent redirects, extra arguments, or shell expansions from being incorrectly absorbed into the structured working directory path.
- Applied reason-specific backoff to transient rate-limit retries and consolidated exhausted retry errors.
- Fixed session-tree rows rendering as empty bullets for bookkeeping entries (such as title changes, credential pins, and mode changes); these are now hidden by default and properly labeled in `all` mode.
- Fixed extension and custom tools inheriting same-named built-in TUI renderers, which could overwrite successful results with incorrect status text.
- Fixed prewalk lifecycle handling to prevent plan injection on rejected same-model/same-effort arms, ensure consumed plan nudges do not return after context rebuilds, and prevent settings-enabled prewalk from implicitly re-arming restored sessions.
- Fixed the todo completion reminder interrupting pauses when waiting for non-English questions (such as Chinese, Japanese, Korean, or Spanish prompts ending in `？` or `?`).
- Normalized resolved file paths in read summaries, PDF image handles, and notebook errors to prevent agents from learning malformed paths.
- Fixed a bug where a per-turn `before_agent_start` system prompt override was silently dropped during base-prompt rebuilds.
- Fixed ACP `session/load` and `session/resume` failing with `ACP session not found` for sessions created under the legacy hashed project-directory scheme by falling back to a global ID scan.
- Fixed `vault://<name>?op=...` commands targeting the active vault instead of the named vault in Obsidian CLI queries.
- Fixed the status-line `session_name` segment to honor the `statusLine.sessionAccent` setting, falling back to the theme's accent color when disabled.
- Fixed automatic `agent.continue()` paths failing to run context-fit maintenance when reverting to a smaller-context model after a cooldown expiry.
- Fixed `/handoff` reporting "Handoff cancelled" for actual generation or stream timeout errors, ensuring the real error is surfaced.

## [17.2.10] - 2026-08-06

### Breaking Changes

- Replaced the re-exported `zod` API with an `omptype`-backed compatibility facade (`@oh-my-pi/omptype/zod`). Plugins retain the standard Zod-style builder interface, but real Zod-specific APIs are no longer available.

### Added

- Added a `--trusted-extension <absolute-path>` CLI flag to load an exact extension-module allowlist, bypassing ambient extension discovery.
- Added resumable session details to fatal crash outputs, including a suggested `omp --resume <session-id>` command to quickly resume persisted live agent sessions.

### Changed

- Reworked the Ctrl+S Agent Hub into a responsive fullscreen roster and selected-agent inspector, featuring aggregate status/usage metrics, detailed per-agent views (task, model, activity, usage, lineage), roster and spawn-tree views, stable ordering, asynchronous persisted-session discovery, restored historical metadata, and improved keyboard and mouse navigation.
- Replaced `arktype` with `@oh-my-pi/omptype` for all tool parameter and configuration schemas, resulting in significantly faster startup times. Configuration schema errors are now reported via `OmpErrors` entries using the standard `path`/`problem` format.

### Fixed

- Fixed panel commands (such as `/usage` and `/advisor status`) appearing unresponsive during active turns by flushing the deferred-panel queue at every settle, terminal or not. The deferral itself stays silent: mounting a status line into the transcript mid-turn re-renders rows below the live block and duplicates them in native scrollback (issues #4806/#6767).
- Fixed the bundled `ts-no-tiny-functions` rule failing to match one-line arrow functions in files with trailing newlines.
- Fixed advisor refusals skipping the model fallback chain, and bounded refusal recovery to a single attempt per model to prevent infinite fallback loops.
- Fixed repeated `/mcp reauth` commands getting stuck by ensuring new reauthorization requests cancel and clean up any pending MCP OAuth login flows.
- Fixed WSL host-home resolution to build `/mnt/<drive>/...` fallback paths using POSIX semantics regardless of the host platform.
- Fixed Python evaluation shell helpers (`!cmd`, `%%bash`, `%pip`) letting child processes inherit the runner's stdin, which previously caused deadlocks on Windows. Additionally, `%%bash` now correctly resolves Git Bash on Windows.
- Fixed subagents spawned via model-role aliases incorrectly falling back to the `default` role's retry chain instead of their own configured role chain.
- Fixed Linux/X11 clipboard reads failing when `xclip` is missing but `xsel` is available.
- Hardened Linux Chromium executable detection to filter out non-executable files, invalid wrappers, and candidates that hang during version probes.
- Fixed Bash command preview crashes caused by malformed tool arguments containing non-string environment values.
- Fixed UI rendering in the model browser and model hub where `nerd`-preset role chips would overlap and obscure the first character of labels.
- Fixed Codex web search sending incompatible request shapes to certain models, which caused the hosted `web_search` tool to ignore them.
- Fixed resumed or rebuilt sessions incorrectly applying stale rewind reports from previous checkpoint cycles to new checkpoints.
- Fixed the `read` tool incorrectly parsing semicolon-delimited internal URLs (such as batched `skill://` resources) as a single invalid resource.
- Fixed `pi.getAllTools()` returning bare strings instead of `ToolInfo[]` objects, restoring compatibility with extensions built against the upstream contract.
- Fixed legacy extensions failing to load in compiled binaries when resolving bundled dependencies via dynamic `createRequire` factories.
- Fixed Wayland window activation and native input handling by correctly reporting them as unavailable rather than attempting unsupported foreground-delivery paths.
- Fixed live execution progress being hidden in the conversation view after approving a plan in the fullscreen Plan Review.
- Fixed `omp -r` failing to discover sessions created under the temporary hashed project-directory scheme by adding a one-way migration back to legacy path-based names.
- Prevented the `read` tool from advertising or resolving `memory://` URIs when the memory backend is disabled.
- Fixed the Shift-Tab thinking mode UI rendering the `off` state as a blank label, which made it appear that reasoning could not be disabled.
- Fixed parsing of POSIX `$EDITOR` commands that contain quoted arguments or executable paths with spaces.
- Fixed persisted Agent Hub rows losing the explicit caller model role when a subagent used a model override, preserving role provenance across restarts.
- Fixed unobserved promise rejections in browser helpers (such as `tab.waitForResponse()`) causing tab workers to hang or crash.

## [17.2.9] - 2026-08-05

### Breaking Changes

- Renamed `compareVersions` to `compareChangelogEntries` in `@oh-my-pi/pi-coding-agent/utils/changelog`. The function signature and behavior are unchanged; update imports to use the new name.

### Added

- Added automatic detection of common Ungoogled Chromium Linux installations for the browser tool.

### Changed

- Restored the legacy project-scoped session directory naming scheme and removed its automatic migration ([#7646](https://github.com/can1357/oh-my-pi/issues/7646)).
- Routed Bun install-cache pruning in `update-cli` through the shared `compareVersions` utility (`@oh-my-pi/pi-utils`), removing a duplicate local comparator that rounded large numeric version identifiers via `Number`.

### Fixed

- Retried concurrent-request caps with a short backoff without deleting valid Copilot credentials or rotating through sibling accounts.
- Fixed the default `textVerbosity` setting being forwarded to OpenAI Codex requests unless the user explicitly configures it, preserving Codex's native response-control defaults. ([#4949](https://github.com/can1357/oh-my-pi/issues/4949))
- Reduced streaming CPU usage by coalescing the cumulative `message_update` deltas of a turn at the event-controller dispatch boundary: at most one streaming-state rebuild runs per ~33ms window instead of one per token, cutting the per-token handler work that dominated the CPU profile of streaming sessions (especially at high token rates) while preserving per-delta speech output. Subscriber dispatch is serialized so a rapid stream tail (`message_update` → `message_end` → `agent_end`) cannot overtake the coalesced flush. ([#7443](https://github.com/can1357/oh-my-pi/issues/7443))
- Fixed translated MCP importers (Claude Code, Cursor, Gemini CLI, Windsurf, VS Code) silently dropping a server's `enabled: false` flag, so a server disabled at the source config stayed mounted; the flag is now propagated and honored like Codex, OpenCode, and native `mcp.json`. These importers now also load project entries before same-named user entries (matching native/Codex) so a project `enabled: false` suppresses a same-named user server ([#7652](https://github.com/can1357/oh-my-pi/issues/7652)).
- Removed the per-call `model` override from the eval `agent()` helper (all runtimes), completing the earlier task-tool removal (`9f8aa87dbf`). Subagents always use their selected agent's frontmatter model and settings; a legacy `model` argument is silently ignored, so an explicit `model: "default"` can no longer route children onto the parent session model ([#6438](https://github.com/can1357/oh-my-pi/issues/6438)).
- Fixed legacy Pi extension validation rejecting plugins such as `remote-pi` that import the package-root `convertToPng` image helper. ([#7610](https://github.com/can1357/oh-my-pi/issues/7610))
- Fixed the legacy session-directory migration silently deleting a live session's transcript when its filename collided with an existing entry in the destination: colliding entries are now preserved in place, the legacy directory is only removed when empty, and collisions/migration failures are logged ([#7593](https://github.com/can1357/oh-my-pi/issues/7593)).
- Fixed `PUPPETEER_EXECUTABLE_PATH` being ignored when a system Chrome installation was detected, preventing Windows users from selecting a compatible headless browser for the shared browser daemon ([#7601](https://github.com/can1357/oh-my-pi/issues/7601)).
- Fixed `openai-models-list` discovery ignoring server-advertised input modalities, so custom virtual tier IDs absent from the bundled catalog showed `images: no` even when the `/v1/models` response reported `input: ["text","image"]` ([#7583](https://github.com/can1357/oh-my-pi/issues/7583)).
- Exposed exact source line counts in read results when selector-based reads reach EOF, allowing protocol bridges to distinguish a returned slice from the complete file ([#7590](https://github.com/can1357/oh-my-pi/issues/7590)).
- Fixed `grep`/`glob` silently collapsing a semicolon-delimited `path` list to one literal path when the joined string was too long for the OS to name (`ENAMETOOLONG`) — a list of bare filenames past `NAME_MAX` or absolute paths past `PATH_MAX` failed with `Path not found: <whole list>` even though every entry existed. The multipath probe now treats `ENAMETOOLONG` as a definitively non-existent single path so the split proceeds, and `glob` surfaces a clean `Path not found` instead of leaking the raw errno ([#7597](https://github.com/can1357/oh-my-pi/issues/7597)).
- Fixed `--mode json` (and text) print mode truncating a large final record (e.g. a multi-MB `agent_end`) when the process exited before stdout drained, while still exiting 0. Per-event writes are now serialized on their own completion callbacks and shutdown blocks on the last one, so the terminal record is delivered in full ([#7635](https://github.com/can1357/oh-my-pi/issues/7635)).
- Fixed text print mode treating buffered partial responses as replay-unsafe, allowing transient mid-stream connection failures to retry without exposing duplicated output ([#7625](https://github.com/can1357/oh-my-pi/issues/7625)).
- Fixed Hindsight `autoRecall` intermittently not reaching the model: two recall paths shared the `hasRecalledForFirstTurn` flag, and the `agent_start` event path could consume it first and inject only via an unawaited background prompt rebuild that a fast turn outran. `beforeAgentStartPrompt` (awaited before the turn builds) is now the sole injection path ([#7568](https://github.com/can1357/oh-my-pi/issues/7568)).
- Fixed `read memory://<id>` returning a confusing "Unknown memory namespace" error under `memory.backend=hindsight` (Hindsight stores memories server-side and has no `memory://` addressing); the handler now returns a corrective pointer to `recall`/`reflect` so a stray read — steered by the shared `recall` tool description — self-corrects in one turn ([#7587](https://github.com/can1357/oh-my-pi/issues/7587)).
- Fixed extension/custom/hook tool wrappers stripping schema methods off `parameters`: `applyToolProxy` bound every callable property, and binding a schema (a plain function carrying `toJsonSchema`/`assert`) dropped those properties, breaking wire-schema detection and crashing the status-line token estimator with `JSON.stringify(schema) === undefined`. Prototype methods are still bound; own data properties and schema callables now pass through untouched.
- Fixed bug where `agent()` calls in eval cells ignored turn cancellation and continued running indefinitely
- Fixed the built-in `tail` printing `tail: Broken pipe` and failing when a downstream pipeline reader exited early (e.g. `tail -c N file.jsonl | jq …` with jq aborting on a parse error); it now exits silently with 141 (128+SIGPIPE) like a real tail, in every output path including `--follow`.
- Fixed the in-process ps shell builtin rejecting common procps/BSD format specifiers (`ps -o tpgid,...` failed with `unknown output format specifier`); added `tpgid`, `pri`, `flags`, real/effective user and group columns, `wchan`, fault counters, `sz`, and the STAT `+` foreground flag.
- Fixed Herdr rejecting the macOS development launcher because its foreground process was reported as `bun` instead of `omp`.
- Completed usage-aware model fallback across startup, queued turns, same-turn tool continuations, ACP/TUI confirmation cancellation, eligible account reselection, cooldown restoration, and isolated subagent settings so low-usage handoffs remain lossless and cannot consume cancelled queued work.
- Fixed Agent Hub opening and selection becoming O(all rows) on large rosters: row rendering is now lazy around the selected viewport, and observer lookup is O(1) by id instead of copy-sorting every session per row.
- Fixed the bash interceptor blocking `grep`/`cat`/`find` used as a downstream pipeline stage (e.g. `printf 'x\n' | grep x`); a stage consuming piped stdin cannot be replaced by a path-based dedicated tool, so it is no longer matched, while standalone and first-stage searches stay intercepted ([#7496](https://github.com/can1357/oh-my-pi/issues/7496)).
- Fixed floating rejections from cmux browser guest JavaScript terminating the main process and every active session; attributable rejections now fail the browser run as tool errors while unrelated process rejections retain the fatal path ([#7365](https://github.com/can1357/oh-my-pi/issues/7365)).
- Fixed the Windows bash tool silently taking down the whole omp process when a command blocked until its timeout: cancelling a timed-out run walked the spawned child's descendant tree from raw `th32ParentProcessID` links, and a recycled pid matching the harness's stale recorded parent pid could enumerate omp as a false descendant and `TerminateProcess` it, killing the session with no `session_exit` record. Run-cancellation sweeps now refuse to signal the harness or any process collected beneath it, while still reaping the timed-out target when it owns a recycled ancestor pid ([#7452](https://github.com/can1357/oh-my-pi/issues/7452)).
- Fixed the unexpected-stop guard (`features.unexpectedStopDetection`) never firing for thinking-only stops: `isUnexpectedStopCandidate` only counted non-whitespace `text` blocks, so a `stopReason: "stop"` turn whose sole content was a signed `thinking` block (a trapped response or a truncated reasoning fragment from reasoning models) bypassed classification and silently ended the turn mid-task. Such stops are now candidates and are classified on their thinking text ([#7499](https://github.com/can1357/oh-my-pi/issues/7499)).
- Fixed Task cancellation hanging forever when a child ignored abort or stalled during cleanup ([#7483](https://github.com/can1357/oh-my-pi/issues/7483)).
- Fixed LSP diagnostics being dropped when servers normalize file URI percent-encoding or Windows path casing.
- Fixed WSL sessions missing Agent Skills stored in the Windows host profile's `.agents/skills` directory. ([#3779](https://github.com/can1357/oh-my-pi/issues/3779))
- Fixed `omp setup python` to validate the same configured or discovered interpreter used by the Python eval runtime.
- Fixed self-update misclassifying glibc Linux hosts with an installed musl loader as musl hosts, which could download an unusable musl binary instead of the glibc release.
- Fixed a crash where opening the Agent Hub after a resume and moving the selection triggered an unbounded `ExtensionExitError` unhandled-rejection storm and exit 129. The postmortem module bound the native hard-exit at first evaluation; when the bundler deferred that evaluation into a `withHostGuard` window it froze the guard's throwing replacement, poisoning every later signal/fatal exit. The native exit is now resolved per call, and the guard stamps its replacement with the native primitive it shadows so mid-guard signals still exit ([#7393](https://github.com/can1357/oh-my-pi/issues/7393)).

## [17.2.8] - 2026-08-04

### Changed

- Upgraded the bundled omptype schema engine: intersection and pipe operators, bigint and RegExp literals in the string DSL, Standard Schema V1 interop, JSON Schema import via fromJsonSchema(), and richer union/collection error reporting.

## [17.2.7] - 2026-08-03

### Changed

- Replaced arktype with @oh-my-pi/omptype for tool parameter and config schemas, significantly improving startup performance with ~100x faster schema construction. Config schema errors are now reported via OmpErrors using the same path/problem structure.

### Fixed

- Fixed an issue where custom, extension, or hook tool wrappers stripped schema methods off parameters, causing wire-schema detection failures and status-line token estimator crashes.
- Fixed a bug where agent() calls in evaluation cells ignored turn cancellation and continued running indefinitely.
- Fixed the built-in tail command to exit silently with code 141 (SIGPIPE) instead of failing with a "Broken pipe" error when a downstream pipeline reader exits early.
- Fixed the in-process ps shell builtin to support common procps/BSD format specifiers, including tpgid, pri, flags, real/effective user/group columns, wchan, fault counters, sz, and the STAT + foreground flag.
- Fixed install.sh falsely reporting success on musl-based systems (such as Alpine Linux) when the binary fails to start; the installer now smoke-tests the binary, exits non-zero on failure, and provides remediation steps.
- Fixed Codex config.toml discovery incorrectly importing MCP servers that are configured with enabled = false.
- Fixed bash.patterns allow rules rejecting valid commands when quoted arguments contained shell metacharacters (such as Cargo benchmark regex filters).

## [17.2.6] - 2026-08-03

### Added

- Added the `/reset` slash command to reset the conversation context in place: it drops the live messages, queued turns, and pending tool calls (and cancels the turn's async jobs, post-prompt continuations, and checkpoint/plan runtime state) while keeping the session id, title, cwd, model, and on-disk transcript. It records a durable reset boundary so the live transcript stays cleared across rebuilds (theme change, focus attach, `/shake`, resume) instead of resurrecting the pre-reset messages, while the full pre-reset history stays on disk ([#3580](https://github.com/can1357/oh-my-pi/issues/3580)).

### Fixed

- Fixed extension slash commands appearing as user prompts after being handled locally.
- Preserved explicit session titles when branching from an earlier conversation turn.
- Fixed an issue where unhandled JavaScript rejections in the browser guest could crash the main process and active sessions, converting them into tool errors instead.
- Fixed a critical issue on Windows where cancelling a timed-out bash tool command could mistakenly terminate the main process due to PID recycling.
- Fixed an issue where supervised processes reaching a terminal state failed to notify their launching session, requiring polling; the broker now actively notifies the session upon process completion.
- Fixed crashes on macOS when using PCRE2-only grep patterns with Bun by defaulting to the interpreted PCRE2 engine instead of JIT, and introduced the `OMP_PCRE2_JIT` environment variable to manually control JIT compilation.
- Fixed issues with `/btw` branch promotion where branches could park behind active turns, cut from outdated session leaves, or leave rejected branch keys indistinguishable from composer input.
- Fixed database bloat by ensuring archived main and nested session rows are properly cleaned up from `stats.db` during garbage collection.
- Fixed startup hanging during local model discovery when a timed-out transport left its request pending, which blocked the CLI before OAuth login could finish ([#7482](https://github.com/can1357/oh-my-pi/issues/7482)).

## [17.2.5] - 2026-08-03

### Breaking Changes

- Replaced the computer tool's coordinate-batch schema with persistent JavaScript runs, and removed computer.backend and model-specific controller switching.
- Changed the edit tool's replace mode from a multi-edit batch schema to a single-edit schema ({ path, old_string, new_string, replace_all? }).

### Added

- Added a relay browser mode to drive local Chrome tabs via the OMP Browser Relay extension, supporting automatic daemon startup and tab grouping.
- Added a scriptable desktop session featuring window-targeted capture and input, native accessibility trees, clipboard access, and streamed screenshots.
- Added broker-shared language servers (controlled by the lsp.shared setting) to multiplex LSP servers across multiple instances in a project, reducing cold-start times and resource usage.
- Added optional timeoutMs to discovery configuration in provider options to configure custom HTTP probe timeouts for llama.cpp, Ollama, and OpenAI-compatible endpoints.
- Added a cross-platform, in-process ps shell builtin with custom columns, sorting, and process metrics.
- Added the --service-tier flag to override the OpenAI service tier for a session.
- Added a configurable per-request web search timeout via providers.webSearchTimeoutSeconds.
- Added turn-aware /tree navigation shortcuts (Alt+Up/Alt+Down, Home/End, PageUp/PageDown) to traverse user and assistant turns.
- Added display.hideToolActivity and a Ctrl+Shift+O shortcut to toggle the visibility of model-initiated tool calls and results.

### Changed

- Exposed the script-driven computer schema to all models, including those with provider-native Computer Use support.
- Reduced omp --help cold-start latency and memory usage by rendering lightweight command metadata.

### Fixed

- Fixed durability of session transcripts to prevent data loss on process crashes.
- Fixed a bug on Windows where a timed-out bash command could terminate the main omp process.
- Fixed headless runs hanging or leaving background workers alive after completion.
- Fixed a crash when opening the Agent Hub after resuming a session.
- Fixed /mcp reauth environment variable expansion and token validation.
- Fixed fuzzy replace-all edits re-matching replacement text indefinitely, which could freeze the TUI.
- Fixed inspect_image ignoring configured thinking effort for vision models.
- Fixed compiled binaries dropping certain extensions with complex CommonJS/ESM dependency graphs.
- Fixed template argument substitution executing recursive placeholder expansion when positional arguments contain literal $@ or $ARGUMENTS tokens.
- Fixed project-scoped session directories using leading-hyphen names and collapsing distinct paths.
- Fixed manual /shake leaving the context budget anchored to stale pre-shake token counts.
- Fixed Mnemopi scoped recall reporting "No relevant memories found" when individual targets fail internally.
- Fixed skill:// resolution ignoring custom directories when a same-named skill exists in a default path.
- Fixed image paste failing on Wayland-only Linux sessions.
- Fixed prewalk switching to the fast model during read-only investigations.
- Fixed self-update misclassifying glibc Linux hosts with an installed musl loader as musl hosts.
- Fixed omp setup python to validate the correct interpreter used by the Python eval runtime.
- Fixed the terminal-tab title dropping to idle while an unsuppressed async job was still running.
- Fixed redirected stdin being ignored when Bun reports a pipe with an undefined isTTY.
- Fixed a literal API key configured via /login being hijacked on Windows by case-differing system environment variables.
- Fixed Esc during a streaming /loop iteration pausing the loop instead of aborting the current turn.
- Fixed heavily branched conversation trees shifting linear continuations into disconnected columns.
- Fixed plugin installation validation failures for legacy compatibility shims.
- Removed hard-coded references to disabled or absent agents in system and tool prompts.

## [17.2.4] - 2026-08-01

### Added

- Added `requestIdFormat` (`"string"` | `"number"`, default `"number"`) to MCP server config, honored by the stdio, HTTP, and SSE transports. JSON-RPC 2.0 permits both id shapes, but Apple's `xcrun mcpbridge` decodes `id` as an integer only and silently drops string ids (`mcpbridge.DecodeError Code=1`), hanging every request until it times out. The option is OMP-specific, so set it in an OMP-owned config (`.omp/mcp.json`, `~/.omp/agent/mcp.json`, a project `mcp.json`/`.mcp.json`, or an OMP plugin); servers imported from another tool's config ignore it ([#7053](https://github.com/can1357/oh-my-pi/issues/7053)).
- Fixed Anthropic web search sending unsupported temperature parameters to sampling-restricted Claude models ([#7195](https://github.com/can1357/oh-my-pi/pull/7195) by [@will-bogusz](https://github.com/will-bogusz)).
- Fixed mid-turn steering/peer-interrupt tool skips rendering as errors (red ✘, red border/text) in the TUI; pending and in-flight interrupt placeholders now render as neutral info cards while preserving whether `tool.execute` started ([#7199](https://github.com/can1357/oh-my-pi/issues/7199)).
- Added `Shift+Up` as a second default for the message dequeue, so the shortcut is reachable in macOS Terminal.app where Option is consumed for character composition.
- Added in-process `pgrep`, `pkill`, `pidwait`, and `top` shell builtins with cross-platform process discovery, BSD/procps-style filters, pidfile handling, signal selection, waiting, and snapshots.

### Changed

- Headless hosts (print/RPC/ACP/eval/SDK) now use a 1s SQLite `busy_timeout` for the session-critical databases (agent.db, history.db, stats.db), so lock contention no longer freezes the protocol loop for the full interactive 5s timeout; interactive hosts keep the 5s timeout. The interactive-host flag is now declared before settings load so the first database opens see the correct timeout.
- The model picker (`/switch`, alt+p) no longer blocks models whose context window is smaller than the live session: over-context rows stay grayed but selectable, and picking one compacts with the current model first, then switches. A cancelled or failed compaction keeps the current model.
- MCP JSON-RPC request ids now default to per-connection sequential integers instead of snowflake strings, matching the wider MCP ecosystem and making integer-only decoders like Apple's `xcrun mcpbridge` work without configuration; set `requestIdFormat: "string"` per server to restore collision-resistant string ids ([#7053](https://github.com/can1357/oh-my-pi/issues/7053)).
- `secret-placeholder.key` now resolves under XDG state (`$XDG_STATE_HOME/omp/secret-placeholder.key`) instead of the agent config directory, so it follows the same XDG layout as other state files.
- Daemon runtime directories (`run/daemons/<hash>`) and provider in-flight tracking (`run/provider-inflight`) now resolve under XDG state (`$XDG_STATE_HOME/omp/run/`) instead of the config root, keeping ephemeral runtime state out of `~/.config`.
- `marketplaces.json` now resolves under XDG data (`$XDG_DATA_HOME/omp/marketplaces.json`) instead of the config root, aligning with the XDG data category for user-scoped registry files.
- Existing XDG installs keep their placeholder key and marketplace registry: the legacy `~/.omp/agent/secret-placeholder.key` and `~/.omp/marketplaces.json` are copied to their XDG locations on first resolution.

### Fixed

- Fixed sessions without a granted `write` tool hiding discoverable and MCP tools behind the unusable `xd://` transport; those sessions now disable device mounting and expose the tools directly without gaining write access.
- Fixed collab guest prompts being sent to models as unframed developer context, so guest messages now retain their transcript attribution while reaching the model as prioritized user interjections ([#7288](https://github.com/can1357/oh-my-pi/issues/7288)).
- Fixed `/memory stats` and `/memory diagnose` showing "Memory stats is not available for the off backend" when memory is off, in both the TUI and ACP/RPC slash-command handlers; the off backend now says memory is off directly instead of naming itself as an unsupported backend ([#7251](https://github.com/can1357/oh-my-pi/pull/7251) by [@KennethHoff](https://github.com/KennethHoff)).
- Fixed `/reload-plugins` retaining stale context-file contents and activation state in the current system prompt ([#7258](https://github.com/can1357/oh-my-pi/issues/7258)).
- Fixed compiled binaries failing to import nested wildcard export subpaths such as `@oh-my-pi/pi-coding-agent/slash-commands/helpers/active-oauth-account`. Node matches `*` in an `exports` pattern across `/`, but the bundled registry enumerated only the top level and skipped any key containing a slash, so such an import resolved from source and died under bunfs — reproducible on the published 17.2.1 binary.
- Fixed concurrent session appends during `/move` recreating an orphaned `.jsonl` fragment in the old session directory ([#7270](https://github.com/can1357/oh-my-pi/issues/7270)).
- Fixed interactive launches hanging silently when a host project or its `.env` sets `NODE_ENV=test` or `BUN_ENV=test` ([#7261](https://github.com/can1357/oh-my-pi/issues/7261)).
- Fixed a subagent killed from the Agent Hub (`x`) reappearing as a `parked` row after closing and reopening the hub in a local session; the kill now leaves the ref registered as terminal `aborted` instead of unregistering it, so the persisted-subagent rescan no longer re-adopts the surviving transcript ([#7250](https://github.com/can1357/oh-my-pi/issues/7250)).
- Fixed manual and automatic Codex compaction dropping the configured OpenAI WebSocket preference ([#7198](https://github.com/can1357/oh-my-pi/issues/7198)).
- Fixed two remaining tool-card double renders: a superseded assistant turn no longer leaves its never-run cards above the re-run's fresh cards (a TTSR rewind retracts them immediately; an auto-retry removes the synthetic-settled failure cards when it supersedes the turn — while a genuinely terminal failure keeps its card visible), and a successful read whose persisted result wins a transcript-rebuild race no longer creates a fallback read group when its delayed live completion arrives ([#6879](https://github.com/can1357/oh-my-pi/issues/6879)).
- Fixed a tool card rendering twice when the provider rewrites a streamed tool call's id mid-stream — GitHub Copilot's `call_id|id` transport, or any stream that delivers the tool name/arguments before the id — so the block appears first with an empty or partial id and is populated in a later delta. The transcript keyed the live card by that mutable id, so the changed id spawned a second card: the old-id card orphaned as a blue pending preview while the new-id card took the result. Streamed tool cards are now re-keyed in place when their id changes, using the block's position in the streaming message as a stable identity ([#6879](https://github.com/can1357/oh-my-pi/issues/6879)).
- Withheld advisor nits and concerns while the primary turn is explicitly marked in progress, while still allowing blockers for unrecoverable active side effects.
- Preserved explicit `-e`/`--extension` and `--hook` packages under
  `--no-extensions` while excluding ambient extension factories and sibling
  capabilities from settings or installed OMP packages.
- Fixed explicit `thinking` metadata in `models.yml` custom definitions and `modelOverrides` being replaced by canonical catalog policy during model rebuilding. ([#7307](https://github.com/can1357/oh-my-pi/issues/7307))
- Fixed the auto-titler installing a model's whole answer as the session title when the tiny title model ignored the titling task and answered the first user message instead. `normalizeGeneratedTitle` now rejects overlong output (>80 chars or >12 words) so the caller defers titling to the next user turn rather than accepting a full sentence ([#7303](https://github.com/can1357/oh-my-pi/issues/7303)).
- Fixed the in-process `kill` builtin to validate signals, preserve negative PID operands, signal every process in pipeline jobs, continue after bad targets, and refuse non-probe signals aimed at the host process or process group.

## [17.2.3] - 2026-08-01

### Changed

- Tightened the system prompt notation: the legend now defines `⟺`, `≠`, `∉`/`∌`, and operator binding order; replaced undefined symbols (`⊭`, `≢`) in prompt bodies; removed delegation guidance duplicated between the eager-tasks preamble and the delegation gates.

### Fixed

- Fixed headless browser launch storms and orphaned Chromium process trees: omp processes now attach to one project-shared Chromium owned by the daemon broker (tabs per session; Chrome dies with the last omp client in the project), concurrent browser opens in one process share a single launch, and concurrent daemon `start` requests for one name can no longer spawn duplicate untracked processes.
- Fixed Bash auto-background leaving a live `Bun.sleep` threshold timer scheduled after a command completes (or abort/steering wins) first, which could keep the event loop alive and delay SDK/headless shutdown until the threshold expired ([#7235](https://github.com/can1357/oh-my-pi/issues/7235)).
- Fixed ephemeral side turns and native compaction bypassing an explicit or fork-inherited prompt cache key ([#7218](https://github.com/can1357/oh-my-pi/issues/7218)).
- Fixed the live Ask dialog crashing the whole session with a `replaceTabs` TypeError when a question reached `AskDialogComponent` without a string `question` field; questions are now normalized at dialog entry, mirroring the transcript renderer ([#7211](https://github.com/can1357/oh-my-pi/issues/7211)).
- Fixed Codex web search collapsing backend errors to `Codex error (): Unknown error`; the SSE error parser now preserves the backend code and message from top-level, nested `error`, and `response.error` envelopes ([#7200](https://github.com/can1357/oh-my-pi/issues/7200)).

## [17.2.2] - 2026-07-31

### Added

- Added an app.live.toggle keybinding (default Ctrl+L) to start or stop live voice mode.
- Added ctx.invokeTool(params, options?) to extension contexts, allowing wrappers to run native tools while inheriting context, abort signals, and progress updates.

### Changed

- Moved the display-reset default keybinding (app.display.reset) from Ctrl+L to Alt+L to accommodate the new live-mode toggle.
- Updated the hashline edit tool, streaming preview, and plan-mode guidance to support the unified PUT/CUT grammar, .= ranges, and named registers.
- Improved startup performance by moving subagent model-registry refresh and session-file opening off the launch critical path.
- Optimized session file writing performance by batching same-turn file-session appends.
- Rewrote the Codex saved-reset auto-redeem algorithm to be pool-wide, window-exact, and expiry-aware, ensuring banked resets are automatically and reliably redeemed across multi-account setups before they expire.

### Fixed

- Fixed a crash in Kitty terminals when rendering non-PNG tool-result images if PNG conversion fails.
- Fixed subagent evaluation resets (reset: true) wiping the shared kernel inherited from the parent session; resets from non-exclusive owners now fork into a private per-owner kernel.
- Fixed the copy selector and ask dialog rendering raw key IDs instead of human-readable keybinding labels.
- Fixed CLI positional initial messages bypassing automatic session-title generation.
- Fixed the environment-variable reference omitting Kitty Unicode placeholder controls and tmux placement caveats.
- Fixed extension validation failures during omp plugin install for extensions importing compact from @earendil-works/pi-coding-agent by adding the missing re-export.
- Fixed Bash interceptor rules to inspect unquoted/unescaped compound command fragments (e.g., &&, ||, ;, |, &, and newlines) instead of only matching the complete command input.
- Fixed ExtensionContext.cwd staying pinned to the initial session directory; it now dynamically tracks the active session's current working directory.
- Fixed the web-search provider picker description for xAI/Grok to clarify that it supports SuperGrok/X Premium+ OAuth sign-ins.
- Fixed /reload-plugins failing to reconnect MCP servers or refresh MCP tool and prompt-command registries.
- Enforced the centralized artifact spill threshold on oversized read results, persisting them as recoverable session artifacts.
- Fixed DuckDuckGo web search under-returning results above the first-page limit by automatically submitting continuation forms.
- Fixed DuckDuckGo web search ignoring after: and before: date bounds by correctly parsing and filtering result timestamps.
- Fixed env-driven OTLP trace export ignoring OTEL_RESOURCE_ATTRIBUTES.
- Fixed a fresh session with deferred MCP discovery injecting the newly mounted xd:// tool catalog twice into the first model request.
- Fixed the bash tool failing with EACCES permission errors on multi-user machines by scoping the snapshot directory per user ID.
- Fixed LSP write batching replaying stale whole-file snapshots over newer external changes made before the batch flushed.
- Fixed ctx.ui.editor() in ACP mode always resolving to undefined by routing it through the elicitation bridge.
- Fixed omp commit failing to resolve extension-provided models in both agentic and legacy pipelines.
- Fixed RPC hosts receiving no subagent lifecycle or progress frames when an IRC message revives an idle or parked keep-alive subagent.
- Fixed copied fenced-code body rows in assistant messages retaining component and container margins.
- Fixed mid-turn auto-compaction repeating dead-end rescue work and warnings at every tool boundary within a single oversized turn.
- Fixed automatic terminal appearance changes clearing native scrollback and snapping readers away from their current scroll position.
- Fixed exact-match edits failing on files containing credential-shaped tokens when secrets.enabled is active by using reversible placeholders instead of irreversible redactions.
- Fixed context usage collapsing to the latest response size for Cursor models that omit prompt-token usage.
- Fixed the browser tool crashing with EBUSY errors on Windows when a headless Chromium profile is locked during cleanup.
- Fixed the Python RPC client dropping context, compaction, OAuth URL, and terminal-settlement fields.
- Fixed the browser tool ignoring the url parameter when opening a new tab on an attached browser.
- Fixed browser automation disrupting attached browsers by adopting the active foreground tab and avoiding raising new tabs during screenshots.

## [17.2.1] - 2026-07-30

### Added

- Added `--from-claude` and `--from-codex` session imports, also available from `/resume @claude` and `/resume @codex`.
- Added an opt-in OMP-native software-security workflow (`security.enabled`, default off) with immutable scan plans, exact-account Codex subscription affinity, native task-worker review, canonical findings/coverage/SARIF publication, project-scoped history, explicit dispositions, producer-differential comparison, and the read-only `security://` resource namespace. Generic SARIF and official Codex Security bundles normalize into the same OMP-owned store.
- Added explicit Codex Security cloud operations to the opt-in security workflow: list and start account-pinned cloud scans, inspect their progress, and import current findings into OMP's canonical store and `security://` namespace without changing the native scan engine or spoofing official runtime attribution.

### Changed

- Reserved `security://` from RPC host URI shadowing so vendor adapters cannot replace OMP's canonical security-analysis namespace.

### Fixed

- Fixed remote or LAN local-engine endpoints being ignored during model discovery: the llama.cpp and Ollama probes used timeouts tuned for loopback, so a host reached over the network could exceed them and return no models, while changing `OLLAMA_BASE_URL`/`OLLAMA_HOST` could keep reusing a fresh cache from the previous endpoint. Non-loopback hosts now get a generous discovery timeout, and Ollama cache rows are scoped to the normalized endpoint ([#7087](https://github.com/can1357/oh-my-pi/issues/7087)).
- Fixed `omp install` failing extension validation for pi extensions that import `createEditTool` or `createWriteTool` (e.g. gentle-pi) — the legacy `@oh-my-pi/pi-coding-agent` shim exported the read/bash/grep/find/ls tool factories but omitted the edit and write ones, so a named import threw Bun's static "Export named X not found" error. Added `createEditTool`/`createEditToolDefinition` and `createWriteTool`/`createWriteToolDefinition` to match the upstream pi surface ([#7094](https://github.com/can1357/oh-my-pi/issues/7094)).
- Fixed Python eval's loopback tool bridge being routed through macOS system HTTP proxies, which caused `parallel()` tool reads to fail with `ConnectionRefusedError` after a local proxy stopped.

## [17.2.0] - 2026-07-30

### Breaking Changes

- Removed the `DEL`, `DEL.BLK`, `COPY`, and `COPY.BLK` hashline edit operations. Use `CUT` / `CUT.BLK` for deletion; removed content remains available to `PASTE`.

### Added

- Added server-name autocomplete for `/mcp` commands (`enable`, `disable`, `test`, `remove`, `reconnect`, `reauth`, `unauth`) using configured and runtime-discovered MCP servers.
- Added `CUT` and `PASTE` ops to the hashline edit tool for moving code without retyping it: `CUT N.=M` (and `.BLK` block forms) capture lines into a clipboard register, and `PASTE` operations insert them. The register flows across sections within a patch (cross-file moves) and persists across edit calls per session.
- Added `--from-claude` and `--from-codex` session imports (including compaction state for Codex), also available from `/resume @claude` and `/resume @codex`.
- Added interactive Exa API-key onboarding through `/login exa`, opening the official key dashboard and saving pasted keys for authenticated web search while preserving `EXA_API_KEY` and explicit-selection public MCP fallback behavior ([#1798](https://github.com/can1357/oh-my-pi/issues/1798)).
- Added `ExtensionContext.getAsyncJobSnapshot()` so extensions can read the owning session's async-job state without relying on process-global job-manager identity
- Added opt-in `tui.codexResetFireworks` celebrations for unscheduled Codex weekly usage resets and newly banked saved resets, shown in a theme-aware top-third modal until Escape ([#6858](https://github.com/can1357/oh-my-pi/pull/6858) by [@joshrzemien](https://github.com/joshrzemien)).
- The Cursor exec bridge serves the seven modern Pi tool frames, mapping each to its local equivalent: `pi_read`/`pi_ls` → `read`, `pi_bash` → `bash`, `pi_edit` → `edit`, `pi_write` → `write`, `pi_grep` → `grep`, and `pi_find` → `glob`. The frames are a separate wire family from the legacy args, not aliases, so each mapping is a real translation — `pi_grep`'s `ignore_case` is the inverse of the local tool's case-sensitivity flag, `pi_find` searches filenames rather than contents, and `pi_edit`'s replacements are renamed to the local snake_case pairs.
- `providers.autoThinkingMaxEffort` (`xhigh` | `max`, default `xhigh`) raises the ceiling of the `auto` thinking classifier. `max` became a first-class effort tier after the classifier prompt was written, so `auto` could never reach it on models that expose the tier — only the `ultrathink` keyword could. Opting in adds `max` to the classifier's vocabulary, gated on the target model actually supporting it; the default keeps today's prompt byte-for-byte. The ceiling is enforced inside the effort clamp rather than on the classifier's answer, so a sparse ladder cannot snap an excluded request back up, and the Low floor is still resolved against the model's own ladder. The on-device 3-bucket classifier stays capped at `xhigh` regardless of the setting. The ceiling governs what `auto` resolves: a ladder with nothing underneath it yields no auto level, and a `thinking.requiresEffort` model still gets its lowest supported effort from the transport.

### Changed

- Improved grouped read-call layout by nesting each request's usage metrics beneath its final path.
- Improved turn recovery to prevent duplicate output streaming during credential rotation or model fallback when visible text has already been streamed.
- Optimized tool guidance for bash, grep, and glob to be more concise while clarifying shell boundaries and search timeouts.
- Optimized models configuration resource probing to run in a single child process, reducing startup contention.
- Startup release notes now default to a compact change-count summary. Use `startup.changelogMode` (`summary` | `expanded` | `hidden`) to control them; legacy `collapseChangelog` choices migrate automatically ([#6771](https://github.com/can1357/oh-my-pi/issues/6771)).

### Fixed

- Fixed Anthropic prompt-cache cold misses on session resume with multiple OAuth accounts: the account that served a session is now recorded in the session file (as a `credential_pin` sha-256 of the account + org/project scope, so exports carry no plaintext identity) and re-pinned on resume with the session's effective last-use time, so a fresh process no longer re-ranks accounts by usage headroom — which systematically routed away from the just-used account and cold-missed the entire account-scoped cache prefix. Sticky routing was previously stored only in the auth store's KV cache, which is in-memory when a remote auth broker is configured.
- Fixed Anthropic prompt-cache cold misses on session resume with multiple OAuth accounts: the account that served a session is now recorded in the session file (as a PII-free `credential_pin` hash) and re-pinned on resume, so a fresh process no longer re-ranks accounts by usage headroom — which systematically routed away from the just-used account and cold-missed the entire account-scoped cache prefix. Sticky routing was previously stored only in the auth store's KV cache, which is in-memory when a remote auth broker is configured.
- Fixed concurrent `createAgentSession` calls with the default agent id failing initialization with `Agent "Main" was replaced during session initialization` — each in-process embedder (e.g. the edit benchmark runner) can now pass a private registry via the newly exported `AgentRegistry`, keeping every top-level session's "Main" out of the process-global roster race.
- Fixed task tool blocks duplicating their per-agent progress rows into terminal scrollback on every update: live task frames now pin the transcript live region so mid-run rows are never recorded as frozen snapshots, and a detached background task freezes its progress the moment any of its rows commit to scrollback instead of mutating committed history.
- Fixed Codex reset fireworks comparing different quota tiers or plans, preventing false celebrations when usage reports switch between Spark and base weekly limits.
- Fixed Cursor ranged-read results losing the full file byte size after applying the requested window.
- Fixed empty Codex final-stop recovery discarding an earlier commentary message when both messages shared response metadata.
- Fixed Advisor availability with providers that refuse echoed reasoning by retrying once with primary thinking stripped and surfacing persistent refusals immediately.
- Fixed `/tan` agents being unable to read parent-session `local://` attachments by correctly resolving local protocol options against the parent session's artifacts.
- Fixed Codex web search silently returning plain completions when the hosted web search tool was skipped.
- Fixed TUI collaboration guest loader not starting when joining or reconnecting mid-turn.
- Fixed multi-second TUI freezes in reftable-format repositories by moving branch resolution off the render path and adding a timeout to synchronous git spawns.
- Fixed `xd://` device summaries containing control characters and exceeding size budgets by stripping control characters and bounding summaries by UTF-8 bytes.
- Fixed `task.softRequestBudget` configuration having no effect on bundled scout and sonic subagents.
- Fixed quick LSP server exits being misreported as reader failures and resolved an issue where explicit reloads were blocked by initialization backoff.
- Forced Git subprocesses to use the stable `C` locale to ensure predictable, non-interactive command output.
- Fixed compatibility replay issues for pre-upgrade launch brokers evaluating xterm inside the client process.
- Fixed Advisor cost tracking in the status line across conversation boundaries, ensuring session transitions, forks, and resumes correctly restore or isolate conversation spend.
- Fixed validation failures for legacy extensions importing from the package root, which previously blocked installations.
- Fixed ACP clients (such as Zed), TUI status lines, and collaboration guests not updating when model changes occur dynamically within the agent loop.
- Fixed assistant-facing resource summaries omitting parameterized MCP resource templates, ensuring failed reads list templates alongside concrete resources.
- Fixed redundant `xd://` mount notices and prompt-cache invalidation when resuming sessions or reconnecting devices.
- Fixed the model picker displaying placeholder model lists instead of the actual credential-aware catalog resolved at registration.
- Fixed file corruption and snapshot mismatches when writing files through the ACP client bridge by verifying the final on-disk content after client-side post-save formatting.
- Fixed `omp ttsr test` silently evaluating source files as prose when their extensions were missing from the allowlist, and expanded the allowlist to support .NET, Shell, SQL, Zig, Dart, Scala, Elixir, and Protobuf files.
- Fixed automatic light/dark theme switching in direct WezTerm sessions on macOS when DEC Mode 2031 is unsupported, and improved theme-change color responsiveness.
- Fixed configured `retry.maxDelayMs` not being forwarded into Anthropic retry handling, so over-budget server retry delays fail fast.
- Added tokens-per-second throughput to RPC `get_state` responses for non-TUI clients.
- Added the RPC `set_fast_mode` command and typed TypeScript/Python client methods for live fast-mode control.
- Added `fastModeEnabled` and `fastModeActive` to RPC `get_state` responses.
- Fixed RPC fast-mode state reporting after direct Anthropic rejects `speed: "fast"`, while allowing explicit re-enable requests to retry priority service.
- Added opt-in subagent access to `checkpoint`, `rewind`, `learn`, and `manage_skill` when explicitly listed in an agent definition's `tools:` frontmatter. Listing one of `checkpoint`/`rewind` auto-includes the other. Settings (`checkpoint.enabled`, `autolearn.enabled`) remain master toggles.
- Added a `browser.cdpUrl` setting that points browser automation at an already-running CDP endpoint by default, so `app.cdp_url` no longer has to be repeated on every call. Explicit `app` options still take precedence.
- Native compaction preserves provider-native success and non-authentication failure semantics while retaining authenticated cross-provider fallback when the native provider rejects credentials.
- Fixed the Cursor Pi exec bridge silently dropping frame arguments. `pi_read`'s `offset`/`limit` were ignored, so a ranged read returned the whole file; `pi_grep`'s `literal` was ignored, so a fixed-string search ran as a regex and matched the wrong lines; and the path/glob join produced a `./`-prefixed spec. Ranges are now composed onto `read`'s `:N+K` inline selector, literal patterns are escaped, and the join uses `node:path`. These are `optional int32` fields, so a present `0` is honored rather than folded into a default: `pi_read` with `limit: 0` answers with empty output instead of the entire file, and `pi_find` with `limit: 0` clamps to 1 the way the reference client does.
- `pi_grep`'s `context` and `limit` are honored. Neither is expressible in the model-facing `grep` schema — context width comes from `grep.contextBefore`/`grep.contextAfter` fixed at tool construction — so the bridge builds a per-call `grep` for frames that supply them. `GrepTool` accepts these as constructor options; the model-facing schema is unchanged, and a frame that supplies neither keeps the shared instance and the session's defaults.
- `pi_ls`'s `limit` is still not mapped, now deliberately: it caps directory *entries*, while the local `read` tool renders a depth-2 tree with per-directory caps and elision rows and applies a selector as a *rendered line* slice. Mapping it to `:1+K` would cap a different unit while appearing honored.
- The legacy pi shim's regex-literal escaper and path/glob join were verbatim copies of the modern bridge's. Both paths now call the shared helpers, so the two Pi translations cannot drift.
- Fixed every Cursor `pi_edit` frame failing instead of editing. Two independent causes: the session drops `edit` from the tool registry for Cursor so the model uses full-file `write`, but that registry is also the exec bridge's tool source, so the native frame — which the server sends regardless of the advertised catalog — found no tool; and the retained instance followed the session's configured edit mode, while `PiEditExecArgs` carries `old_text`/`new_text` pairs that only `replace` accepts (the default `hashline` takes a single `input` string). The bridge now resolves a `replace`-mode instance through its fallback resolver, still wrapped for approval.
- Fixed a `pi_grep` frame carrying `context` or `limit` escaping the approval gate. Honoring those fields needs a per-call `grep`, and the per-call instance was built raw while every registry tool is wrapped, so such calls bypassed `tools.approval.grep` and the exec-tier check for SSH-targeted paths. Both bridge callsites now build it through one shared factory that applies the same wrapper.
- Fixed Cursor advisors ignoring `pi_grep`'s `context` and `limit`. Only the primary session supplied the per-call `grep` factory, so advisor frames silently fell back to session defaults. Advisors now receive the same factory, gated on the advisor actually having been granted `grep`.
- Fixed Cursor advisors failing every `pi_edit`. The advisor roster handed the bridge the `edit` instance built for the advisor's own loop, which follows the configured `edit.mode` (`hashline` by default) and rejects the frame's `old_text`/`new_text` pairs — the same mode mismatch the primary bridge already fixed, on the path it missed. The exec map now substitutes a `replace`-mode instance, gated on the advisor actually having been granted `edit`, while the advisor's own loop keeps the tool it was given.
- Fixed `pi_bash` killing commands that explicitly asked for no deadline. `timeout` is `optional int32` and `bash` documents `0` as "disables the command deadline", but a truthiness check folded a supplied `0` into unset, applying the 300s default instead. A present `0` now passes through; negatives, which have no local meaning and would otherwise clamp to the 1s floor, still fall back to the default.
- Fixed the Cursor exec bridge granting `edit` and `grep` to sessions that withheld them. Both bridge-only tools are constructed rather than looked up, and `executeTool` prefers a constructed override over the registry, so a restricted tool set (`toolNames` without them, or `restrictToolNames`) still got a working `pi_edit`/`pi_grep` — native frames arrive regardless of the advertised catalog. Both are now gated on the session having actually granted the tool, matching the `delete` frame's existing check (issue #5680).
- Fixed Cursor advisor bridge tools bypassing approval settings. The advisor's `pi_edit`/`pi_grep` instances are approval-wrapped, but the wrapper reads `tools.approvalMode`, per-tool `tools.approval.<tool>` policies and `autoApprove` only from the execute-time tool context — which the advisor bridge never supplied, so every native advisor frame resolved as `yolo` with empty policies and ran past a configured `ask` or `deny`. Advisors now receive the same context store as the primary bridge.
- Fixed Cursor's `list_mcp_resources`/`read_mcp_resource` frames answering as though the client hosted no MCP servers. The bridge hardcoded an empty catalog and `not_found`, so resources from servers the session held live connections to were invisible to the model even while the same session read them through `mcp://`. Both frames now answer from the session's `MCPManager` — awaiting a server's background resource discovery rather than reading the not-yet-populated cache and reporting "advertises nothing" — and a lookup failure surfaces as an error rather than an empty catalog, which would read as "asked, none exist". A read carrying `download_path` writes the resource to that path and answers with the path alone, per the wire contract, instead of putting the payload back in the model's context. That path arrives from the server while the general-purpose resolver deliberately honors absolute paths and `..`, so downloads are confined to the workspace: the resolved target and its deepest existing ancestor must stay inside it, and a target that is itself a symlink is refused. The write then opens `O_NOFOLLOW` and refuses a non-regular or hard-linked file before truncating, so the final component cannot be swapped for a link or an inode shared outside after the check. A parent directory replaced by a symlink mid-write is still followed; closing that needs `openat`/dirfd walking, which this does not attempt.
- Fixed the Cursor native `delete` frame bypassing approval settings. Unlike every other frame it removes the file directly instead of running a registry tool, so no approval wrapper sat in front of it — the bridge's `allowDirectFileMutation` grant answers whether a mutating tool was granted, which is a different question from whether the user's policy allows the call. A configured `tools.approval.delete: deny`, or an `always-ask` session that this channel cannot prompt in, now refuses the frame and keeps the file.
- Fixed Cursor download-mode resource reads bypassing the session's mutation restrictions. A `read_mcp_resource` frame carrying `download_path` creates and overwrites workspace files without running a registry tool — the same hole the native `delete` frame had — so a session that withheld `write`/`edit`, or one whose `write` tier is `deny`/`always-ask`, still had files written. Both frames now share one grant (`allowDirectFileMutation`, renamed from `allowNativeDelete` now that it gates more than deletion) and one `write`-tier policy check, and the download refuses before the read so a blocked call does not fetch the resource either. The primary session derives that grant before it rewrites its registry: Cursor moves `edit` out of the tool map and `write` may be auto-registered later, so reading the map at bridge-construction time would have misjudged both.
- Fixed `pi_ls` never reporting that a listing was clipped. The bridge read the entry cap from a flat `details.resultLimitReached`, which `glob` sets but `read` — the tool serving `pi_ls` — does not: it records the cap through `OutputMeta` at `details.meta.limits.resultLimit.reached`. Every capped listing therefore reached Cursor with `entry_limit_reached` unset, reading as complete. Both shapes are now checked, the same way the truncation translation already handles its two producers.
- Fixed a mixed-content MCP resource read reaching Cursor mislabelled. The mime type was taken from the first content item while the payload came from whichever item supplied it, so an image blob followed by a text note sent the text as `image/png`. Each branch now reports the type of the part it actually sends.
- Fixed `pi_read`'s `offset`/`limit` returning more lines than the frame asked for. The range is composed onto the local `read` tool's inline selector, and a plain `:N+K` deliberately pads with one leading and three trailing context lines — helpful when a human reads a snippet, wrong for a caller that named an exact range: offset 5/limit 20 handed Cursor lines 4-27. Ranged Pi reads now compose `:raw:N+K`, which slices exactly the requested lines.
- Fixed `pi_grep` returning fewer matches than it asked for when they spread across many files. The local `grep` windows results to the first 20 files and tells the caller to paginate with `skip`, but `PiGrepExecArgs` has no `skip` field — so a frame asking for 100 matches over 25 one-match files got 20, `match_limit_reached` unset, and advice it could not act on: output silently short and labelled complete. A search carrying a total match cap now reads enough files to satisfy it (cap+1, so a result landing exactly on the cap is distinguishable from a clipped one) and reports the cap when it actually bites.
- Fixed every native `pi_edit` failing after a session switched onto Cursor. The replace-mode `edit` instance the frame needs was built only for sessions *created* on Cursor, and the tool roster is not rebuilt on a model switch — so a session that started elsewhere kept its configured-mode `edit` in the registry, which the bridge resolves before its fallback, and the frame's `old_text`/`new_text` pairs failed validation against a `hashline` schema. The instance is now built from the `edit` grant regardless of the session's initial provider (lazily, so a session that never reaches Cursor never constructs one) and `pi_edit` asks for it explicitly through a dedicated accessor. A session that was never granted `edit` is still refused.
- Fixed the Cursor bridge's tool resolver being able to execute an unadvertised `edit`. That resolver doubles as the agent loop's fallback for any call outside the advertised set, so serving `edit` from it meant a hallucinated call — or one naming a tool the session deselected after startup — could run a replace-mode edit the model was never offered. It is device-only again; `pi_edit` uses its own accessor.
- Fixed the legacy Cursor `read` frame ignoring the `offset`/`limit` modern builds paginate with. Only the Pi variant composed a range, so every page of a legacy read returned the whole file (or its own truncation) and a model walking a large file never advanced past the first window. Both frames now translate a range through the same helper, and the answer sets `range_applied` to describe whether a window was actually composed.
- Fixed the legacy Cursor `grep` frame ignoring its pagination `offset`. The local `grep` paginates by file through `skip` and advertises exactly that in its own "use skip=N" advice, so an unforwarded offset re-ran the identical search and answered page one for every page. The answer now reports the offset it applied in `offset_applied`.
- Fixed a paginated Cursor `read` or `grep` frame being recorded as an unpaginated one. The executed call and the transcript block are built separately, so forwarding the frame's range and page fixed only the execution: the block still showed a bare path and an unskipped search, which is what a reloaded session replays and what the next turn reasons from — a slice of a file presented as the whole thing, and results from a later window presented as page one. Both are now synthesized from the same translation that runs them, including a `limit: 0` read, which is recorded as the zero lines it returns rather than a whole-file read.
- Fixed Cursor advisors answering every MCP resource frame as though the client hosted no servers. Only the primary bridge received the `MCPManager`-backed resource adapter, so an advisor's `list_mcp_resources` reported an empty catalog and its `read_mcp_resource` a `not_found` even though the advisor shares the session's live connections. Advisors now receive the same adapter; it is not gated on a tool grant, since reading what a server advertises is a different permission from calling one of its tools.
- Fixed advisor tools bypassing the approval gate. They are built straight from the builtin table, outside the loop that wraps every registry tool, and both the advisor's own agent loop and its Cursor exec bridge (`pi_write`, `pi_bash`) run those instances directly — so an advisor granted `write` or `bash` executed them regardless of a configured `ask` or `deny`. They now carry the same `ExtensionToolWrapper` as every other tool.
- Added `mcp_notification` extension event and multi-listener `MCPManager.addNotificationListener` API. The runtime already received MCP server-initiated JSON-RPC notifications at the transport layer but had no path to forward them to extensions; every notification (including server-custom methods) is now delivered as `{ server, method, params }` after the manager's own list/update handling. For known list-change methods (`notifications/tools/list_changed`, `notifications/resources/list_changed`, `notifications/prompts/list_changed`) the internal refresh promise is awaited before fanout, so a listener acting on `tools/list_changed` sees fresh `getTools()`. Notifications received before any listener attaches are buffered (bounded FIFO, cap 100, drop-oldest — matches `IrcBus`'s `MAILBOX_CAP`) and drained into the first subscriber, so startup-time frames aren't lost even if the extension binds after MCP discovery. Extensions can use this to bridge push-capable MCP servers (e.g. peer messaging) into session behavior by injecting a mid-turn steer via `pi.sendMessage` / `pi.sendUserMessage`.

### Removed

- Removed the dangling `MCPManager.setOnNotification` single-slot setter, which had no callers in the runtime. Replaced by `MCPManager.addNotificationListener` — multi-listener, per-listener error isolation, returns an unsubscribe function.

## [17.1.8] - 2026-07-28

### Breaking Changes

- Changed tab.screenshot() to no longer accept a per-call save path; it now saves screenshots under browser.screenshotDir (or the OS temp directory if unset) and returns the saved path.

### Added

- Added omp cleanse, a new command that automatically detects language-ecosystem checkers, parses diagnostics (such as Cargo Clippy JSON), distributes repair workloads across concurrent subagents, and runs verification checks with a live progress bar.

### Changed

- Reworked the /guided-goal command from a modal-based popup flow into a natural, conversational chat interface where the agent asks follow-up questions directly in the session.
- Reduced startup memory usage by lazy-loading HTML session export assets only on their first use.

### Fixed

- Fixed Advisor notes appending stale-review-window warnings when newer primary turns are queued during a review.
- Fixed layout padding alignment issues in bordered output blocks and web-search result panels.
- Fixed excluded web search providers remaining visible in the Web Search Provider Order settings list.
- Fixed internal Hub peer messages being exposed as ordinary tool-call updates in clients like Paseo.
- Fixed compatibility issues when installing legacy pi extensions by updating the legacy shim to correctly bridge missing runtime symbols and exports (such as isContextOverflow, isRetryableAssistantError, and JSON parsing utilities).
- Fixed an issue where routine daemon operations (like list, logs, stop, or describe) could inadvertently trigger a restart loop for detached daemons in a backoff window.
- Fixed marketplace plugin MCP discovery to correctly honor the mcpServers manifest field in plugin configuration files.
- Fixed user-initiated shell executions (! and $) being misattributed as agent actions in advisor transcripts.
- Fixed unnecessary prompt-cache invalidations by preserving the active auto-thinking effort level when per-turn classification fails.
- Fixed the omp process name showing up as bun in Linux process managers (like ps and top).
- Fixed agent shell commands inheriting environment variables from the launch directory's .env file, ensuring they only receive the parent environment and explicit tool overrides.
- Fixed the /new command retaining completed or failed async jobs from the previous session.
- Improved error handling in omp update to display a friendly timeout message if the download times out while streaming the binary.
- Fixed the write tool incorrectly treating semicolon-joined read selectors as filesystem paths and creating unintended directory structures.
- Fixed omp worktree clear prematurely deleting active task-isolation sandboxes owned by running subagents.
- Fixed /vibe mode preventing the director from completing parent tasks after verifying worker results by keeping the built-in todo tool active.
- Fixed numeric GitHub issue and pull request autocomplete being suppressed inside skill slash-command arguments.

## [17.1.7] - 2026-07-27

### Fixed

- Restoring a prompt with image attachments via esc-esc branch or `/tree` now re-attaches the images to the composer draft: previously only the text (with its `[Image #N]` markers) was restored, so resubmitting sent the literal marker with no image.
- Fixed large bash/eval/ssh output citing two different artifact ids in one result — the truncation notice said `Read artifact://N for full output` while the footer said `Artifact: N+1`. The streaming sink's head and tail windows each had a full budget, so a middle-elided inline body could reach `headBytes + spillThreshold` and always re-tripped the final-defense inline byte cap, which truncated a second time (two elision markers), saved a duplicate already-truncated artifact, and left the notice's line ranges stale. The head and tail windows now share the spill-threshold budget (head clamped to half), the cap budget derives from the configured threshold plus notice slack, and when the cap does fire on a sink-spilled result it references the existing raw artifact instead of saving a copy.

### Added

- Added the bundled `ts-no-local-is-record` TTSR rule, which catches local `isRecord` function and lambda definitions and directs agents to shared guards plus explicit shape validation.
- A `tool_call` handler (extension or hook) can now return `input` to revise the arguments a tool executes with, not just `block` it. The returned object is the raw execution input passed to the tool (ignored when `block` is set, and not applied to `computer` tool calls), enabling wrappers that normalize or rewrite a built-in's arguments without reimplementing the tool. For model-issued calls the event fires at arg-prep time in the agent loop, so a revision is revalidated against the tool schema and is what concurrency scheduling, `tool_execution_start`/transcripts, the persisted assistant message, and the approval gate all observe — the user approves exactly what runs, and a revision that changes a tool's functional concurrency (e.g. bash `pty`) schedules correctly. A revised nested `write xd://` device dispatch forfeits the outer write gate's approval and faces the full prompt again ([#6681](https://github.com/can1357/oh-my-pi/pull/6681) by [@psyrendust](https://github.com/psyrendust)).
- Added a parser for macOS `sample`(1) call-tree reports to the read tool: `*.sample.txt` reads now return a compact bottleneck summary — per-thread hot paths with on-CPU sample counts (blocked syscall time excluded), demangled Rust v0/legacy symbols, flattened direct recursion, merged call-site siblings, idle-thread classification, and a process-wide top-functions-by-self-samples table. `:raw` still reads the original report, and files that merely carry the extension fall back to plain text.
- Added V8 `.cpuprofile` support to the read tool (Node/Bun `--cpu-prof`, Chrome DevTools, CDP `Profiler.stop` output): reads now return a compact bottleneck summary — hot-path call tree with on-CPU milliseconds (`(idle)` time excluded), collapsed pass-through chains, flattened direct recursion, shortened file URLs, and a top-functions-by-self-time table. `:raw` still reads the original JSON, and files that merely carry the extension fall back to plain text.

### Changed

- Direct and `xd://` dispatch now share one canonical tool map: `write xd://<tool>` executes any enabled top-level or mounted tool, and `read xd://<tool>` returns its docs, instead of failing when the name was exposed through the other layer. Mounted names are presentation metadata only, so tool replacement and disconnection cannot leave stale device instances; disabled tools remain unreachable, and both `xd://` and Cursor/top-level fallback execution retain the tool's approval and ACP permission gates.
- Session listing now caches parsed headers keyed on file stat identity (mtime + size), so repeated resume-picker opens and startup scans re-read only changed session files
- Reduced per-keystroke editor dispatch overhead: keybinding resolution happens once per input chunk and the per-action interception chain is gated behind a single canonical-key set probe
- `xd://` device docs now render the parameter schema as a comment-annotated TypeScript type (via `jsonSchemaToTypeScript`, the same renderer the in-band tool inventory uses) instead of a raw JSON Schema dump, shrinking system-prompt device sections while keeping descriptions inline.
- Added a `/vision [on|off|auto|status]` slash command for session-scoped control of the `inspect_image` vision-delegation tool, modeled on `/computer`: `on`/`off` force the tool for the current session only, `auto` returns to the persisted setting, and `status` reports the effective mode, session override, tool state, and active-model image capability.
- Replaced the `inspect_image.enabled` boolean with the tri-state `inspect_image.mode` (`auto`|`on`|`off`, default `auto`). In `auto` the tool is registered only when the active model lacks native image input, so vision-capable models (e.g. `kimi-code/k3`) read images inline with their own capabilities instead of delegating to a separate vision model; the tool set is re-evaluated on every model switch with a status notice when it flips. The `read` tool now follows the effective state dynamically rather than the raw setting, so it returns decoded image blocks again whenever `inspect_image` is hidden. Existing `inspect_image.enabled: true/false` configs migrate to `inspect_image.mode: on/off`.

## [17.1.6] - 2026-07-27

### Added

- Added separate Advisor cost visibility to the status line, rendering primary and Advisor spend as `$2.67 (sub) + $0.41 (adv)` while keeping already-incurred Advisor cost across runtime disablement and same-session history rewrites.

### Changed

- Made the task tool's per-spawn `effort` parameter opt-in through `task.enableEffort`, which defaults to false and omits the field from flat and batch schemas and tool guidance until enabled.
- Reduced terminal-title update overhead by deduplicating unchanged titles on every platform and using `SetConsoleTitleW` through `bun:ffi` instead of OSC writes on Windows. Windows working titles now keep a static `:` separator instead of scheduling spinner updates; other platforms retain the animated separator.
- Added `task.maxEffort` to cap the task tool's optional per-spawn effort hint after model-specific resolution, so operators can enable effort hints without allowing them to exceed a configured ceiling; the ceiling now also rides into the spawned session so retry-fallback model swaps re-clamp to it instead of escalating past the cap ([#6580](https://github.com/can1357/oh-my-pi/issues/6580), [#6794](https://github.com/can1357/oh-my-pi/pull/6794) by [@wolfiesch](https://github.com/wolfiesch)).
- Restructured the steering/interjection envelope sent to the model: the injected `<user_interjection>...<message>...</message>...` wrapper around user text is now a `<system-notice>` explaining the interjection followed by the user's raw message unwrapped, matching the existing `<system-notice>`/`<system-directive>` convention instead of nesting the literal message inside its own tag pair, which some models found confusing.

### Fixed

- Fixed a disabled higher-priority MCP server no longer disabling a same-named lower-priority one: disabled servers are now suppressed after key-level dedupe instead of dropped before it, so a project `foo` with `enabled: false` keeps the user-level `foo` off while still not starving a differently-named equivalent connection.
- Fixed the MCP tool-name collision winner flipping when the current owner reconnects: the winner is now chosen by a stable server+tool key instead of tool-array insertion order, which reconnects reorder.
- Fixed MCP resources with custom URI schemes being treated as missing filesystem paths. `read` and `omp read` now resolve server-advertised native resource URIs such as `ags://capabilities/current-host`, while preserving the existing `mcp://<resource-uri>` form.
- Fixed three gaps in native MCP resource URI resolution: server-advertised URIs whose path is exactly `/` (e.g. `catalog://root/`) are now preserved byte-for-byte instead of losing the trailing slash to reconstruction; opaque resource URIs (`urn:example:document`, `custom:item`) are recognized by the `read` and `omp read` resolver gates instead of falling through to filesystem handling; and a failing `resources/templates/list` no longer discards a successful `resources/list`, which previously produced a false missing-resource error.
- Fixed custom LSP servers sending `languageId: "plaintext"` for extensions outside the built-in language map by honoring an optional per-server `languageId` in `lsp.json` for disk and in-memory document opens ([#6800](https://github.com/can1357/oh-my-pi/issues/6800)).
- Fixed interactive extension confirmations ignoring `dialogOptions`, and cancelled handler-owned dialogs when the extension watchdog times out so stale approval UI cannot outlive a blocked tool call ([#6805](https://github.com/can1357/oh-my-pi/issues/6805)).
- Fixed the per-handler extension context snapshotting the live `ctx.model` getter, so a handler calling `pi.setModel()` and then reading `ctx.model` saw the stale model; the scoped context now delegates to the base context instead of spreading it.
- Fixed Python cell errors (`$` commands and the eval tool) leaking runner-internal traceback frames. Cell syntax errors now render as the bare caret display with a `<cell>` filename instead of a `_handle_request_async`/`ast.parse` stack dump, and runtime tracebacks start at user code, matching the Ruby runner's user-frame filtering.
- Dropped unavailable forced tool choices through the queue rejection lifecycle and discarded their remaining sequence yields so a skipped force cannot disable tools on the next request ([#6543](https://github.com/can1357/oh-my-pi/pull/6543) by [@paralin](https://github.com/paralin)).
- Fixed identical MCP server connections discovered under direct and marketplace-plugin names spawning twice and duplicating mounted tool routes; distinct tools whose server names sanitize to the same route now keep the first registration and log both origins ([#6786](https://github.com/can1357/oh-my-pi/issues/6786)).
- Fixed `/usage` and the other large transcript command panels (`/session`, `/advisor status`, `/jobs`, `/changelog`, `/context`, `/memory view`) duplicating in native scrollback when invoked while an agent turn is streaming. These callsites mounted their finalized panel immediately via `present()` instead of deferring it until the turn ends via `presentCommandOutput()` (the path added in #5427 for `/tools`/`/mcp`), so the panel landed above a still-growing live block and was recommitted lower down ([#6767](https://github.com/can1357/oh-my-pi/issues/6767)).
- Fixed plan-mode task subagents unregistering extension-provided models, credentials, managers, and custom APIs from the shared parent `ModelRegistry` when restricted sessions intentionally skip extension loading ([#6783](https://github.com/can1357/oh-my-pi/issues/6783)).
- Fixed `/live` sideband WebSockets ignoring standard proxy environment variables and `NO_PROXY`, which left proxied sessions stuck while the rest of the Codex connection succeeded ([#6770](https://github.com/can1357/oh-my-pi/issues/6770)).
- Fixed the bash tool's `kill` builtin rejecting numeric signals and multiple process operands, stopping after the first failed target, and defaulting to `SIGKILL` instead of the standard `SIGTERM`. Negative PID operands (process groups per `kill(2)`) and the `--` end-of-options marker are now handled instead of being misparsed as signals ([#6779](https://github.com/can1357/oh-my-pi/issues/6779)).
- Fixed `learned.md` saves growing a blank line on every write (trailing-newline split artifact) and hoisting all headings/prose above all bullets, which re-scoped lessons under the wrong heading in hand-organized files. Saves are now byte-idempotent and preserve mixed Markdown ordering: non-list lines keep their positions, new lessons insert newest-first at the head of the first bullet run, and dedupe/cap operate on bullet lines in place.

## [17.1.5] - 2026-07-27

### Added

- Added a configurable per-request timeout for the `inspect_image` tool (`inspect_image.timeoutMs`, default 5 minutes; set to 0 to disable) so a stalled vision-model provider fails fast with a clear error instead of blocking until manual abort ([#4165](https://github.com/can1357/oh-my-pi/issues/4165)).

### Changed

- Reduced default startup resident memory by constructing the default-off ComputerTool ArkType schema only on first parameter access, then reusing it across tool instances without changing validation or tool behavior ([#6742](https://github.com/can1357/oh-my-pi/pull/6742) by [@usr-bin-roygbiv](https://github.com/usr-bin-roygbiv)).
- Reduced startup CPU and memory by loading the bundled changelog only when needed, while preserving source, npm bundle, standalone binary, and native absolute-path fallback resolution.
- Moved PTY log replay into the shared project launch broker, so normal CLI and Hub startup no longer load the xterm runtime while launch logs return validated rendered terminal rows.

### Fixed

- Fixed DeepSeek V4 Flash and Step 3.7 Flash models using hashline edit mode by default despite repeatedly misreading its range grammar; both now use the simpler replace-mode fallback unless explicitly overridden ([#6671](https://github.com/can1357/oh-my-pi/issues/6671)).
- Fixed an Ask form appearing while the main prompt contains a draft hiding that text and consuming the next in-flight keystroke. The draft now remains visible and keeps receiving input until it is submitted or cleared; only then do form controls activate ([#6737](https://github.com/can1357/oh-my-pi/issues/6737)).
- Fixed `glob` rejecting safe `memory://root/<directory>/**` patterns. Memory globs now resolve their directory prefix inside the project memory root while rejecting traversal and percent-encoded path separators across the complete glob path.
- Fixed `omp --resume <id>` prompting to fork sessions from another existing directory instead of switching the process and cwd-scoped settings into the resumed session's recorded directory ([#6752](https://github.com/can1357/oh-my-pi/issues/6752)).
- Fixed deferred CLI model roles resolving ambiguous bare model IDs to a preferred but unauthenticated provider instead of the authenticated provider selected by the eager path ([#6727](https://github.com/can1357/oh-my-pi/issues/6727)).
- Fixed Windows sessions crashing with an unhandled `EPIPE: broken pipe, write` when an LSP server closed its stdin between filesystem mutations; LSP writes now observe asynchronous `FileSink.write()` failures and route them through the existing request/notification failure path.
- Fixed the bash tool's `stat` builtin failing on native Windows with `stat: unsupported on this platform` (exit 1) for every invocation. The vendored `uu-stat` now ships a Windows-native backend that maps the GNU format directives onto `std::fs::Metadata`, the `windows_by_handle` metadata extensions (inode, hard-link count, and device via `GetFileInformationByHandle`), and the Win32 volume APIs for `--file-system` mode; Unix behavior is unchanged ([#6723](https://github.com/can1357/oh-my-pi/issues/6723)).
- Fixed auto-retry wedging the session after an assistant-tail removal miss: when a context rebuild recreated the failed turn's message object, the identity-keyed cleanup logged `assistant removal missed` but the retry still scheduled `continue()`, which rejected the terminal assistant error message locally (`Cannot continue from message role: assistant`) before any provider request — `auto_retry_end` never fired, the TUI kept showing retry progress, and the in-flight `prompt()` hung until a manual follow-up. The retry path now strips a still-failed assistant tail positionally after the backoff, and a continuation that still fails locally closes the retry saga with a failed `auto_retry_end` ([#5382](https://github.com/can1357/oh-my-pi/issues/5382)).
- Fixed native Anthropic web-search history being recursively truncated during session persistence or retained under a different user turn, preserving opaque replay bytes across reload and stripping them on reparent ([#6703](https://github.com/can1357/oh-my-pi/issues/6703)).
- Fixed malformed or temporarily unreadable `config.yml` files being treated as empty settings and then overwritten by the next setting change, which could permanently erase broker tokens, model roles, and provider configuration. Invalid YAML is now moved to a timestamped `.broken-*` backup, read failures abort without touching the source, pending changes remain retryable with the last successfully loaded settings, atomic writes preserve symlink targets and handle Windows `EPERM` replacement, concurrent startup failures are fully observed and quarantine races fail closed, and `omp config set/reset` waits for persistence before reporting success.
- Fixed mounted MCP tools being hard to invoke when server or plugin guidance names their original calls: sessions now include one bounded, exact original-name-to-`xd://` route map for every live mounted MCP tool—including servers without initialize instructions—and refresh it as catalogs change without disabling schema virtualization.
- Fixed `inspect_image` blocking indefinitely when the vision-model API stalls by combining the caller's abort signal with an `AbortSignal.timeout()` and surfacing a distinct timeout `ToolError` (separate from user-triggered abort) ([#4165](https://github.com/can1357/oh-my-pi/issues/4165)).
- Fixed MiMo models using hashline edit mode by default despite needing the same replace-mode fallback as Kimi. ([#3772](https://github.com/can1357/oh-my-pi/issues/3772))
- Fixed `omp` refusing to start on Windows when no `bash.exe` is discoverable — most visibly with scoop-installed Git, whose manifest shims `sh.exe`/`git.exe` but never `bash.exe`, so PATH lookup missed it. Startup threw `No bash shell found` while merely building the bash tool description, even though bash tool commands always execute in the embedded brush-core shell and need no host bash. Shell discovery now also checks `GIT_INSTALL_ROOT`, scoop and per-user Git for Windows install roots, and `sh.exe` on PATH, then falls back to `cmd.exe` for the spawn-only paths (interactive PTY, ACP client terminals) instead of failing; the cmd fallback is never used to wrap user-shell commands — brush runs the POSIX line directly.
- Added a selectable voice setting for `/live` realtime sessions ([#6566](https://github.com/can1357/oh-my-pi/issues/6566)).

Older entries are archived in [packages/coding-agent/CHANGELOG.md@f7051d9e7377](https://github.com/can1357/oh-my-pi/blob/f7051d9e73773b4f471ceccc8f92fd3822730b58/packages/coding-agent/CHANGELOG.md).
