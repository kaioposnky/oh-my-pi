import { describe, expect, it } from "bun:test";
import { type } from "@oh-my-pi/omptype";
import type { Tool } from "@oh-my-pi/pi-ai/types";
import { resolveToolNameByUniquePrefix, validateToolCall } from "@oh-my-pi/pi-ai/utils/validation";

describe("resolveToolNameByUniquePrefix", () => {
	const names = ["read", "readmefull", "bash", "glob"];

	it("returns an exact match unchanged", () => {
		expect(resolveToolNameByUniquePrefix(names, "read")).toBe("read");
		expect(resolveToolNameByUniquePrefix(names, "bash")).toBe("bash");
	});

	it("recovers a missing final character when the completion is unique", () => {
		expect(resolveToolNameByUniquePrefix(names, "bas")).toBe("bash");
		expect(resolveToolNameByUniquePrefix(names, "glo")).toBe("glob");
	});

	it("prefers a unique one-character completion over a unique longer prefix", () => {
		expect(resolveToolNameByUniquePrefix(["alpha", "alphabet"], "alph")).toBe("alpha");
	});

	it("resolves a truncated name by its unique longer prefix", () => {
		expect(resolveToolNameByUniquePrefix(["readmefull", "bash"], "readmefu")).toBe("readmefull");
		expect(resolveToolNameByUniquePrefix(["read", "readme"], "reax")).toBeUndefined();
	});

	it("recovers a truncated name even when longer prefixes also match", () => {
		expect(resolveToolNameByUniquePrefix(names, "rea")).toBe("read");
	});

	it("refuses ambiguous prefixes with no unique one-character completion", () => {
		expect(resolveToolNameByUniquePrefix(["alpha", "alphabet"], "alp")).toBeUndefined();
	});

	it("ignores names shorter than three characters", () => {
		expect(resolveToolNameByUniquePrefix(["ab"], "a")).toBeUndefined();
	});

	it("returns undefined for unknown names", () => {
		expect(resolveToolNameByUniquePrefix(names, "zzz")).toBeUndefined();
	});
});

describe("validateToolCall truncation recovery", () => {
	it("validates arguments against the tool recovered from a truncated name", () => {
		const schema = type({ path: type("string") });
		const tools: Tool[] = [
			{ name: "read", description: "", parameters: schema },
			{ name: "bash", description: "", parameters: type({ command: type("string") }) },
		];
		const args = validateToolCall(tools, {
			type: "toolCall",
			id: "call-1",
			name: "rea",
			arguments: { path: "README.md" },
		});
		expect(args).toEqual({ path: "README.md" });
	});

	it("still throws ToolNotFoundError for unrecoverable names", () => {
		const tools: Tool[] = [{ name: "read", description: "", parameters: type({}) }];
		expect(() => validateToolCall(tools, { type: "toolCall", id: "call-1", name: "wri", arguments: {} })).toThrow();
	});
});
