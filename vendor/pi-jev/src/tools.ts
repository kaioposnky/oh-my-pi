import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import type { JevClient } from "./jev.js";
import type { ToolRouter } from "./router.js";
import type { SkillRouter } from "./skills.js";
import type { QuestionConfig } from "./types.js";
import { JEV_THRESHOLD } from "./skills.js";
import { CdpBrowser } from "./browse-cdp.js";
import { BrowseRun, type JevAsk, type TextHelper } from "./browse.js";

/** Small model for TYPE_TEXT values: $JEV_BROWSE_TEXT_MODEL, else the `smol` role, else the session model. */
function textHelper(ctx: any, signal?: AbortSignal): TextHelper {
  const spec = process.env.JEV_BROWSE_TEXT_MODEL?.trim() || "@smol";
  const model = ctx.models?.resolve?.(spec) ?? ctx.model;
  if (!model) throw new Error("TYPE_TEXT needs a text model: set JEV_BROWSE_TEXT_MODEL or configure the smol role.");
  return async (system, context) => {
    const reply = await ctx.modelRegistry.complete(
      model,
      {
        systemPrompt: system,
        messages: [{ role: "user", content: [{ type: "text", text: JSON.stringify(context) }], timestamp: Date.now() }],
      },
      { signal, cacheRetention: "none", disableReasoning: true, maxTokens: 1024 }
    );
    if (reply.stopReason === "error" || reply.stopReason === "aborted") {
      throw new Error(`Text model ${model.provider}/${model.id} failed: ${reply.errorMessage ?? reply.stopReason}; nothing typed.`);
    }
    const content = reply.content.filter((c: any) => c.type === "text").map((c: any) => c.text).join("");
    return { content, model: `${model.provider}/${model.id}` };
  };
}

export function registerJevTools(
  pi: ExtensionAPI,
  jevClient: JevClient,
  router: ToolRouter,
  skillRouter: SkillRouter
): void {
  // 1. Tool router tool: jev_find_tools
  pi.registerTool({
    name: "jev_find_tools",
    label: "Jev Tool Finder",
    description:
      "Find and additively activate registered Pi tools needed for a task using TypeSafe Jev semantic evaluation.",
    promptSnippet: "Search and dynamically activate specialized tools for current task",
    promptGuidelines: [
      "Use jev_find_tools when current active tools cannot accomplish the user request.",
    ],
    parameters: Type.Object({
      query: Type.String({
        description: "The action, capability, or user task you need tools for.",
      }),
      threshold: Type.Optional(
        Type.Number({
          description: "Activation confidence threshold between 0.0 and 1.0 (default JEV_THRESHOLD).",
        })
      ),
    }),
    async execute(_toolCallId, params: any, signal, onUpdate) {
      onUpdate?.({
        content: [{ type: "text", text: `Evaluating candidate tools for: "${params.query}"...` }],
        details: {},
      });

      const result = await router.findAndActivate(
        params.query,
        params.threshold ?? JEV_THRESHOLD,
        signal
      );

      let summaryText = "";
      if (result.activated.length > 0) {
        summaryText = `Activated tools: ${result.activated.join(", ")}`;
      } else if (result.candidates.length > 0) {
        summaryText = `No tools met the activation threshold among candidates: ${result.candidates.join(", ")}`;
      } else {
        summaryText = `No matching inactive tools found.`;
      }

      if (result.fallbackUsed) {
        summaryText += " (Note: local heuristic shortlist used due to Jev unconfigured/offline)";
      }

      return {
        content: [{ type: "text", text: summaryText }],
        details: result,
      };
    },
  });

  // 2. Skill finder tool: jev_find_skill
  pi.registerTool({
    name: "jev_find_skill",
    label: "Jev Skill Finder",
    description:
      "Find and recommend the best matching agent skills for a specific task or problem using TypeSafe Jev semantic evaluation.",
    promptSnippet: "Discover specialized skills/workflows relevant to current task",
    promptGuidelines: [
      "Use jev_find_skill when working on specialized tasks (e.g. testing, UI design, animations, security reviews, git conflicts) to locate the relevant SKILL.md guide.",
    ],
    parameters: Type.Object({
      query: Type.String({
        description: "The task, domain, or technology you need specialized skills for.",
      }),
      threshold: Type.Optional(
        Type.Number({
          description: "Match confidence threshold between 0.0 and 1.0 (default JEV_THRESHOLD).",
        })
      ),
    }),
    async execute(_toolCallId, params: any, signal, onUpdate, ctx) {
      onUpdate?.({
        content: [{ type: "text", text: `Evaluating matching skills for: "${params.query}"...` }],
        details: {},
      });

      const result = await skillRouter.findSkills(
        params.query,
        params.threshold ?? JEV_THRESHOLD,
        ctx,
        signal
      );

      let summaryText = "";
      if (result.recommended.length > 0) {
        const lines = result.recommended.map(
          (r) => `• /skill:${r.name} (P=${r.probability.toFixed(2)})${r.location ? ` - ${r.location}` : ""}\n  ${r.description}`
        );
        summaryText = `Recommended skill(s):\n${lines.join("\n")}\n\nTo use a skill, invoke /skill:<name> or use the read tool to open its SKILL.md file.`;
      } else if (result.candidates.length > 0) {
        summaryText = `No skills met the confidence threshold among candidates: ${result.candidates.join(", ")}`;
      } else {
        summaryText = `No registered skills found in session.`;
      }

      if (result.fallbackUsed) {
        summaryText += "\n(Note: local heuristic shortlist used due to Jev unconfigured/offline)";
      }

      return {
        content: [{ type: "text", text: summaryText }],
        details: result,
      };
    },
  });

  // 3. Typed evaluation tool: jev_evaluate
  pi.registerTool({
    name: "jev_evaluate",
    label: "Jev Evaluate",
    description:
      "Ask TypeSafe Jev System One typed questions (choice, noul, score) about structured state. Returns calibrated probabilities.",
    promptSnippet: "Perform fast calibrated structured decisions and classifications over state",
    promptGuidelines: [
      "Use jev_evaluate when you need structured probability, categorical choice, or scored rubric decisions rather than text generation.",
    ],
    parameters: Type.Object({
      state: Type.Any({ description: "Target context, text, or structured JSON to evaluate" }),
      questions: Type.Record(
        Type.String(),
        Type.Object({
          type: Type.Union([
            Type.Literal("choice"),
            Type.Literal("noul"),
            Type.Literal("score"),
          ]),
          instructions: Type.String({ description: "The judgment instruction/question" }),
          criteria: Type.Optional(Type.Any({ description: "Options, yes/no criterion, or rubric levels" })),
        })
      ),
      model: Type.Optional(Type.String({ description: "Jev model identifier (default: jev-latest)" })),
    }),
    async execute(_toolCallId, params: any, signal, onUpdate) {
      if (!jevClient.isConfigured()) {
        throw new Error(
          "TypeSafe Jev is not configured. Set TYPESAFE_API_KEY, save ~/.pi/agent/secrets/typesafe_api_key, or set PI_JEV_BASE_URL."
        );
      }

      onUpdate?.({
        content: [{ type: "text", text: "Querying TypeSafe Jev model..." }],
        details: {},
      });

      const questions: Record<string, QuestionConfig> = {};
      for (const [id, q] of Object.entries(params.questions as Record<string, any>)) {
        questions[id] = {
          type: q.type,
          instructions: q.instructions,
          criteria: q.criteria,
        };
      }

      const response = await jevClient.evaluate(
        {
          state: params.state,
          questions,
          model: params.model,
        },
        signal
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.answers, null, 2),
          },
        ],
        details: response,
      };
    },
  });

  // 4. Jev Ultrafast browser agent: jev_browse
  pi.registerTool({
    name: "jev_browse",
    label: "Jev Browse",
    description:
      "Fast, cheap browser agent: give a start URL and a goal; Jev picks each click/type/select/scroll from the live " +
      "page's indexed controls (one Jev request per step, a small model writes only typed text). Returns final page text and action history.",
    promptSnippet: "Complete a goal on a website (search, fill forms, navigate, open a result) in seconds",
    promptGuidelines: [
      "Use jev_browse for goal-shaped web tasks: searching a site, filling and submitting forms, navigating to a page, setting filters.",
      "Write a narrow, verifiable goal with every value it needs (e.g. dates, cities, query text). DONE is the agent's claim; check the returned page text.",
      "Not for: file uploads, canvas apps, iframes, shadow DOM, pop-up tabs. Use the browser tool there.",
    ],
    parameters: Type.Object({
      url: Type.String({ description: "Start URL (http/https)" }),
      goal: Type.String({ description: "Natural-language goal, including all values to enter" }),
      cdp_url: Type.Optional(
        Type.String({
          description:
            "Attach to a running Chrome (http://127.0.0.1:9222 or ws://…) to reuse its logins; default launches a private headless Chrome",
        })
      ),
      screenshot: Type.Optional(Type.Boolean({ description: "Attach a screenshot of the final page" })),
    }),
    async execute(_toolCallId, params: any, signal, onUpdate, ctx) {
      if (!/^https?:\/\//i.test(params.url)) throw new Error("url must start with http:// or https://");
      if (!jevClient.isConfigured()) {
        throw new Error("TypeSafe Jev is not configured. Set TYPESAFE_API_KEY or save ~/.pi/agent/secrets/typesafe_api_key.");
      }
      const ask: JevAsk = async (state, questions) => {
        // Raw System One call: browse needs full probability maps, which JevClient.evaluate reshapes.
        const response = await jevClient.systemOne({ state, questions, model: process.env.TYPESAFE_MODEL }, signal);
        return { answers: response.answers, usage: response.usage };
      };
      const browser = await CdpBrowser.open(params.url, { cdpUrl: params.cdp_url });
      try {
        const run = new BrowseRun(browser, params.goal, ask, textHelper(ctx, signal));
        await run.start();
        const result = await run.run(signal, (r) => {
          const last = r.history.at(-1);
          onUpdate?.({
            content: [{ type: "text", text: `${r.elapsed()} ms · ${r.history.length} actions${last ? ` · ${last.kind} ${last.action}` : ""}` }],
            details: {},
          });
        });
        const steps = result.history
          .map((h) => `${h.step}. ${h.operation} ${h.action}${h.text ? ` = ${JSON.stringify(h.text)}` : ""}${h.page_changed === false ? " (no change)" : ""}`)
          .join("\n");
        const text =
          `status: ${result.status}${result.stop_reason ? ` (${result.stop_reason})` : ""}\n` +
          `elapsed: ${result.elapsed_ms} ms · ${result.decisions} Jev requests · ${result.stale} stale · ${result.text_calls} text calls\n` +
          `final: ${result.title} — ${result.url}\n\nactions:\n${steps || "(none)"}\n\nvisible page text:\n${result.text}`;
        const content: any[] = [{ type: "text", text }];
        if (params.screenshot) {
          const final = await browser.observe(true);
          content.push({ type: "image", data: final.screenshot, mimeType: "image/jpeg" });
        }
        return { content, details: result };
      } finally {
        await browser.close();
      }
    },
  });
}
