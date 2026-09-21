import { describe, expect, test } from "bun:test";
import { buildModel } from "@oh-my-pi/pi-catalog/build";
import { resolveOpenAICompatPolicy } from "../src/providers/openai-shared";

describe("numeric reasoningEffortMap reaches the wire", () => {
	test("integer effort map produces integer reasoning_effort (openai-completions)", () => {
		const model = buildModel({
			id: "verboo-code/deepseek-v4.1-flash",
			name: "deepseek-v4.1-flash",
			provider: "kgdev",
			api: "openai-completions",
			baseUrl: "https://kgdev.viajador.com.br/v1",
			reasoning: true,
			compat: {
				supportsReasoningEffort: true,
				reasoningEffortMap: { minimal: 1, low: 25, medium: 50, high: 80, xhigh: 100, max: 100 },
			},
		} as never);

		for (const [level, expected] of [
			["minimal", 1],
			["low", 25],
			["medium", 50],
			["high", 80],
			["max", 100],
		] as const) {
			const policy = resolveOpenAICompatPolicy(model as never, { reasoning: level } as never);
			console.log(level, "->", JSON.stringify(policy.reasoning.wireEffort));
			expect(policy.reasoning.wireEffort).toBe(expected);
			expect(typeof policy.reasoning.wireEffort).toBe("number");
		}
	});
});
