import { describe, expect, test } from "bun:test";
import { Effort } from "../src/effort";
import { resolveModelPolicy } from "../src/compat/resolve";
import type { ModelSpec } from "../src/types";

describe("numeric reasoningEffortMap (verboo/deepseek integer effort)", () => {
	test("integer values survive resolveModelPolicy for openai-completions", () => {
		const spec = {
			id: "verboo-code/deepseek-v4.1-flash",
			api: "openai-completions",
			provider: "kgdev",
			baseUrl: "https://kgdev.viajador.com.br/v1",
			compat: {
				supportsReasoningEffort: true,
				reasoningEffortMap: {
					[Effort.Minimal]: 1,
					[Effort.Low]: 25,
					[Effort.Medium]: 50,
					[Effort.High]: 80,
					[Effort.XHigh]: 100,
					[Effort.Max]: 100,
				},
			},
		} as unknown as ModelSpec<"openai-completions">;

		const policy = resolveModelPolicy(spec);
		const map = policy.compat.reasoningEffortMap as Record<string, unknown> | undefined;
		console.log("resolved reasoningEffortMap =", JSON.stringify(map));
		console.log("thinking.effortMap =", JSON.stringify(policy.thinking?.effortMap));

		expect(map).toBeDefined();
		expect(map![Effort.Minimal]).toBe(1);
		expect(map![Effort.High]).toBe(80);
		expect(map![Effort.Max]).toBe(100);
		expect(typeof map![Effort.High]).toBe("number");
	});
});
