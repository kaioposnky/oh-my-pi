import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { JevClient } from "./jev.js";
import { JEV_THRESHOLD } from "./skills.js";
import type { QuestionConfig } from "./types.js";

/** Retract needs a stronger "no" than inject needs a "yes": pulling tools the
 * user relies on is worse than missing an inactive one. Dead zone keeps the
 * current state so a mediocre verdict never churns the toolset. */
export const MCP_RETRACT_BELOW = 0.35;

const MCP_PREFIX = "mcp__";

/** Server segment of an MCP tool name: "mcp__srv_tool" → "srv". Non-MCP names → undefined. */
export function mcpServerOf(toolName: string): string | undefined {
  if (!toolName.startsWith(MCP_PREFIX)) return undefined;
  const rest = toolName.slice(MCP_PREFIX.length);
  const end = rest.indexOf("_");
  const server = end === -1 ? rest : rest.slice(0, end);
  return server || undefined;
}

export interface McpGatePlan {
  servers: Array<{ server: string; tools: string[] }>;
  inject: string[];
  retract: string[];
}

/** Pure decision: given the active set, every MCP tool, and a server → noul
 * probability, which MCP tools to inject (p >= JEV_THRESHOLD, inactive) and
 * retract (p <= MCP_RETRACT_BELOW, active). Dead zone → untouched. */
export function planMcpGate(
  active: string[],
  allMcpTools: Array<{ name: string }>,
  judgments: Map<string, number>,
): McpGatePlan {
  const servers: Array<{ server: string; tools: string[] }> = [];
  if (allMcpTools.length === 0) return { servers, inject: [], retract: [] };

  const activeSet = new Set(active);
  const inject: string[] = [];
  const retract: string[] = [];
  for (const { name } of allMcpTools) {
    const server = mcpServerOf(name);
    if (!server) continue;
    let entry = servers.find((s) => s.server === server);
    if (!entry) {
      entry = { server, tools: [] };
      servers.push(entry);
    }
    entry.tools.push(name);

    const p = judgments.get(server);
    if (p === undefined) continue;
    if (p >= JEV_THRESHOLD && !activeSet.has(name)) inject.push(name);
    else if (p <= MCP_RETRACT_BELOW && activeSet.has(name)) retract.push(name);
  }
  return { servers, inject, retract };
}

/** Runtime override for the MCP gate; null = fall back to PI_JEV_MCP env. */
export const mcpOverride: { enabled: boolean | null } = { enabled: null };

const MAX_TASK_CHARS = 6000;
const MAX_SERVER_QUESTIONS = 30;

type McpToolInfo = { name: string; description?: string };

function serverQuestion(server: string, tools: McpToolInfo[]): QuestionConfig {
  const sample = tools.slice(0, 3).map((t) => t.name.replace(`mcp__${server}_`, "")).join(", ");
  const first = (tools.find((t) => t.description)?.description ?? "").slice(0, 200);
  const detail = first ? ` First tool description: ${first}` : "";
  return {
    type: "noul",
    instructions: `Does this task need tools from the '${server}' MCP server? Available tools: ${sample}.${detail}`,
  };
}

/**
 * Per-prompt MCP tool injection/retraction gate. Asks one batched Jev evaluate
 * (one noul question per server, ≤30 servers) and applies the diff with
 * setActiveTools. Never throws: any failure leaves the toolset untouched.
 *
 * Standalone evaluate (not folded into the auto batch) is deliberate: the
 * auto-batch plumbing (ModelJudgmentContribution) is model-router-specific and
 * folding mcp questions through it would need a route() split plus ~60 lines
 * of coupling. This costs one extra call, and only when mcp tools exist.
 */
export class McpGate {
  constructor(private jevClient: Pick<JevClient, "isConfigured" | "evaluate">) {}

  public async route(
    prompt: string,
    pi: ExtensionAPI,
    ctx?: { signal?: AbortSignal; ui?: { setStatus(s: string, t: string): void } },
  ): Promise<void> {
    if (mcpOverride.enabled === false) return;
    if (mcpOverride.enabled === null && process.env.PI_JEV_MCP?.trim() === "0") return;
    const text = prompt.trim();
    if (!text || text.startsWith("/")) return;
    if (!this.jevClient.isConfigured()) return;

    try {
      const mcpTools = pi
        .getAllTools()
        .filter((t) => t.name.startsWith(MCP_PREFIX))
        .map((t) => ({ name: t.name, description: t.description })) as McpToolInfo[];
      if (mcpTools.length === 0) return;

      const plan0 = planMcpGate([], mcpTools, new Map());
      // Largest tool-count first: biggest servers are the likeliest matches.
      const asked = [...plan0.servers].sort((a, b) => b.tools.length - a.tools.length).slice(0, MAX_SERVER_QUESTIONS);

      const questions: Record<string, QuestionConfig> = {};
      for (const { server, tools } of asked) {
        const serverTools = tools.map((name) => mcpTools.find((t) => t.name === name)!);
        questions[`mcp:${server}`] = serverQuestion(server, serverTools);
      }

      const { answers } = await this.jevClient.evaluate(
        { state: { task: text.slice(0, MAX_TASK_CHARS) }, questions },
        ctx?.signal,
      );

      const judgments = new Map<string, number>();
      for (const [key, answer] of Object.entries(answers)) {
        if (!key.startsWith("mcp:")) continue;
        if (typeof answer.value === "number") judgments.set(key.slice(4), answer.value);
      }

      const plan = planMcpGate(pi.getActiveTools(), mcpTools, judgments);
      if (plan.inject.length === 0 && plan.retract.length === 0) return;

      const retractSet = new Set(plan.retract);
      const next = [
        ...pi.getActiveTools().filter((t) => !retractSet.has(t)),
        ...plan.inject.filter((t) => !retractSet.has(t)),
      ];
      await pi.setActiveTools([...new Set(next)]);
      ctx?.ui?.setStatus("jev", `jev: mcp +${plan.inject.length}/-${plan.retract.length}`);
    } catch {
      // Fail-open: leave the toolset exactly as it was.
    }
  }

  /** No own event listener — wiring is explicit in extensions/index.ts to keep
   * ordering deterministic relative to the main routing chain. */
  public install(_pi: ExtensionAPI): void {}
}
