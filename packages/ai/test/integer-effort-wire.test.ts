import { describe, expect, it } from "bun:test";
import { streamOpenAICompletions } from "@oh-my-pi/pi-ai/providers/openai-completions";
import type { Context, FetchImpl, Model } from "@oh-my-pi/pi-ai/types";
import { buildModel } from "@oh-my-pi/pi-catalog/build";
import { Effort } from "@oh-my-pi/pi-catalog/effort";

const testContext: Context = {
	messages: [{ role: "user", content: "hello", timestamp: 0 }],
};

function createSseResponse(events: unknown[]): Response {
	const payload = `${events.map(e => `data: ${typeof e === "string" ? e : JSON.stringify(e)}`).join("\n\n")}\n\n`;
	return new Response(payload, { status: 200, headers: { "content-type": "text/event-stream" } });
}

/** Verboo/DeepSeek-V4.1-Flash style: integer 1-100 effort intensity. */
function createIntegerEffortModel(): Model<"openai-completions"> {
	return buildModel({
		id: "verboo-code/deepseek-v4.1-flash",
		name: "DeepSeek V4.1 Flash",
		api: "openai-completions",
		provider: "kgdev",
		baseUrl: "https://kgdev.viajador.com.br/v1",
		reasoning: true,
		thinking: {
			mode: "effort",
			efforts: [Effort.Minimal, Effort.Low, Effort.Medium, Effort.High, Effort.Max],
		},
		compat: {
			supportsReasoningEffort: true,
			reasoningEffortMap: {
				[Effort.Minimal]: 1,
				[Effort.Low]: 25,
				[Effort.Medium]: 50,
				[Effort.High]: 80,
				[Effort.Max]: 100,
			},
		},
		input: ["text"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 256_000,
		maxTokens: 64_000,
	} as never);
}

async function capturePayload(
	model: Model<"openai-completions">,
	reasoning: Effort,
): Promise<Record<string, unknown>> {
	let payload: Record<string, unknown> | undefined;
	const fetchMock: FetchImpl = Object.assign(
		async (_input: string | URL | Request, init?: RequestInit): Promise<Response> => {
			payload = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as Record<string, unknown>;
			return createSseResponse([
				{ id: "c", object: "chat.completion.chunk", created: 0, model: model.id, choices: [{ index: 0, delta: { content: "ok" } }] },
				{ id: "c", object: "chat.completion.chunk", created: 0, model: model.id, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] },
				"[DONE]",
			]);
		},
		{ preconnect: fetch.preconnect },
	);

	await streamOpenAICompletions(model, testContext, {
		apiKey: "test-key",
		fetch: fetchMock,
		reasoning,
	}).result();

	if (!payload) throw new Error("Expected an OpenAI completions request payload");
	return payload;
}

describe("integer reasoning_effort on the wire (Verboo/DeepSeek)", () => {
	it("sends the mapped integer, not the effort label", async () => {
		const model = createIntegerEffortModel();
		for (const [level, expected] of [
			[Effort.Minimal, 1],
			[Effort.Low, 25],
			[Effort.Medium, 50],
			[Effort.High, 80],
			[Effort.Max, 100],
		] as const) {
			const payload = await capturePayload(model, level);
			console.log(`reasoning_effort for ${level} =`, JSON.stringify(payload.reasoning_effort));
			expect(payload.reasoning_effort).toBe(expected);
			expect(typeof payload.reasoning_effort).toBe("number");
		}
	});
});
