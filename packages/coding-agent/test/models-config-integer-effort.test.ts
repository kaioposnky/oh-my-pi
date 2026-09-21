import { describe, expect, test } from "bun:test";
import { OmpErrors } from "@oh-my-pi/omptype";
import { ModelsConfigSchema } from "../src/config/models-config-schema";

type ParsedModels = {
	providers: Record<string, { models?: { compat?: { reasoningEffortMap?: Record<string, unknown> } }[] }>;
};

function expectValid(result: unknown): ParsedModels {
	if (result instanceof OmpErrors) {
		throw new Error(`schema rejected valid input: ${[...result].map(e => e.problem).join("; ")}`);
	}
	return result as ParsedModels;
}

describe("models.yml schema accepts integer reasoningEffortMap values", () => {
	test("integer intensity scale (Verboo/DeepSeek) validates", () => {
		const parsed = expectValid(
			ModelsConfigSchema({
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
			}),
		);

		const map = parsed.providers.kgdev.models?.[0]?.compat?.reasoningEffortMap;
		expect(map?.high).toBe(80);
		expect(typeof map?.high).toBe("number");
	});

	test("string effort maps still validate", () => {
		const parsed = expectValid(
			ModelsConfigSchema({
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
			}),
		);
		const map = parsed.providers.anthropic.models?.[0]?.compat?.reasoningEffortMap;
		expect(map?.high).toBe("xhigh");
	});
});
