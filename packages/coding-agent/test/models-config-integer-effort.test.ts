import { describe, expect, test } from "bun:test";
import { ModelsConfigSchema } from "../src/config/models-config-schema";

describe("models.yml schema accepts integer reasoningEffortMap values", () => {
	test("integer intensity scale (Verboo/DeepSeek) validates", () => {
		const parsed = ModelsConfigSchema({
			providers: {
				kgdev: {
					baseUrl: "https://kgdev.viajador.com.br/v1",
					api: "openai-completions",
					auth: "apiKey",
					apiKey: "sk-test",
					models: [
						{
							id: "verboo-code/deepseek-v4.1-flash",
							reasoning: true,
							compat: {
								supportsReasoningEffort: true,
								reasoningEffortMap: {
									minimal: 1,
									low: 25,
									medium: 50,
									high: 80,
									xhigh: 100,
									max: 100,
								},
							},
						},
					],
				},
			},
		});

		const map = (parsed as { providers: Record<string, { models?: { compat?: { reasoningEffortMap?: Record<string, unknown> } }[] }> })
			.providers.kgdev.models?.[0]?.compat?.reasoningEffortMap;
		console.log("parsed map =", JSON.stringify(map));
		expect(map?.high).toBe(80);
		expect(typeof map?.high).toBe("number");
	});

	test("string effort maps still validate", () => {
		const parsed = ModelsConfigSchema({
			providers: {
				anthropic: {
					baseUrl: "https://api.anthropic.com",
					api: "anthropic-messages",
					auth: "apiKey",
					apiKey: "sk-test",
					models: [
						{
							id: "claude-x",
							compat: { reasoningEffortMap: { high: "xhigh", low: "minimal" } },
						},
					],
				},
			},
		});
		const map = (parsed as { providers: Record<string, { models?: { compat?: { reasoningEffortMap?: Record<string, unknown> } }[] }> })
			.providers.anthropic.models?.[0]?.compat?.reasoningEffortMap;
		expect(map?.high).toBe("xhigh");
	});
});
