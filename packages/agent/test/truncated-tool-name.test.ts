import { describe, expect, it } from "bun:test";
import { type } from "@oh-my-pi/omptype";
import { Agent, type AgentEvent, type AgentTool } from "@oh-my-pi/pi-agent-core";
import type { AssistantMessage } from "@oh-my-pi/pi-ai";
import { createMockModel } from "@oh-my-pi/pi-ai/providers/mock";

describe("truncated tool-call name recovery", () => {
	it("executes a tool call whose final character was dropped by the provider", async () => {
		const toolSchema = type({ value: type("string") });
		const executed: Array<{ name: string; value: string }> = [];
		const tool: AgentTool<typeof toolSchema, { value: string }> = {
			name: "echo",
			label: "Echo",
			description: "Echo tool",
			parameters: toolSchema,
			concurrency: "exclusive",
			async execute(_toolCallId, params) {
				executed.push({ name: "echo", value: params.value });
				return {
					content: [{ type: "text", text: `ok:${params.value}` }],
					details: { value: params.value },
				};
			},
		};
		// Provider bug: the advertised `echo` arrives as `ech` (final character dropped).
		const mock = createMockModel({
			responses: [
				{ content: [{ type: "toolCall", id: "tool-1", name: "ech", arguments: { value: "hi" } }] },
				{ content: ["done"] },
			],
		});
		const agent = new Agent({
			initialState: { model: mock.model, systemPrompt: ["Test"], tools: [tool], messages: [] },
			streamFn: mock.stream,
			interruptMode: "immediate",
		});
		const events: AgentEvent[] = [];
		const unsubscribe = agent.subscribe(event => events.push(event));

		await agent.prompt("start");
		unsubscribe();

		expect(executed).toEqual([{ name: "echo", value: "hi" }]);
		const end = events.find(
			(event): event is Extract<AgentEvent, { type: "tool_execution_end" }> =>
				event.type === "tool_execution_end" && event.toolCallId === "tool-1",
		);
		expect(end).toBeDefined();
		const content = end?.result.content[0];
		if (content?.type !== "text") throw new Error("expected text result");
		expect(content.text).toBe("ok:hi");

		// History must carry the canonical name so provider replay stays consistent.
		const assistant = agent.state.messages.find(
			(message): message is AssistantMessage =>
				message.role === "assistant" &&
				message.content.some(block => block.type === "toolCall" && block.id === "tool-1"),
		);
		expect(assistant).toBeDefined();
		const call = assistant?.content.find(block => block.type === "toolCall");
		expect(call && call.type === "toolCall" ? call.name : undefined).toBe("echo");
	});

	it("still errors for an unrecoverable unknown tool name", async () => {
		const toolSchema = type({ value: type("string") });
		const executed: string[] = [];
		const tool: AgentTool<typeof toolSchema, { value: string }> = {
			name: "echo",
			label: "Echo",
			description: "Echo tool",
			parameters: toolSchema,
			concurrency: "exclusive",
			async execute(_toolCallId, params) {
				executed.push(params.value);
				return { content: [{ type: "text", text: `ok:${params.value}` }], details: { value: params.value } };
			},
		};
		const mock = createMockModel({
			responses: [
				{ content: [{ type: "toolCall", id: "tool-1", name: "nope", arguments: { value: "hi" } }] },
				{ content: ["done"] },
			],
		});
		const agent = new Agent({
			initialState: { model: mock.model, systemPrompt: ["Test"], tools: [tool], messages: [] },
			streamFn: mock.stream,
			interruptMode: "immediate",
		});

		await agent.prompt("start");

		expect(executed).toEqual([]);
		const assistant = agent.state.messages.find(message => message.role === "assistant");
		const result = agent.state.messages.find(
			message => message.role === "toolResult" || (message as { role?: string }).role === "toolResult",
		);
		const text = JSON.stringify(result ?? assistant ?? {});
		expect(text).toContain("not found");
	});
});
