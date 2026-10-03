import { afterEach, describe, expect, it } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { loadExtensions, setExtensionCliArgs } from "@oh-my-pi/pi-coding-agent/extensibility/extensions/loader";
import { TempDir } from "@oh-my-pi/pi-utils";

// Pi extensions read `getFlag()` inside their factory, right after `registerFlag()`.
// The CLI value must already be visible there, not only after the post-load reparse.
describe("extension flags at factory time", () => {
	let dir: TempDir | undefined;

	afterEach(() => {
		setExtensionCliArgs([]);
		dir?.removeSync();
		dir = undefined;
	});

	async function seenByFactory(argv: string[]): Promise<unknown> {
		dir = TempDir.createSync("@ext-flag-load-");
		const file = path.join(dir.path(), "ext.ts");
		fs.writeFileSync(
			file,
			`export default function (api) {
				api.registerFlag("guard", { type: "boolean", default: false });
				api.registerFlag("mode", { type: "string", default: "off" });
				globalThis.__extFlagSeen = { guard: api.getFlag("guard"), mode: api.getFlag("mode") };
			}`,
		);
		setExtensionCliArgs(argv);
		const result = await loadExtensions([file], dir.path());
		expect(result.errors).toEqual([]);
		return (globalThis as { __extFlagSeen?: unknown }).__extFlagSeen;
	}

	it("exposes CLI values to the factory", async () => {
		expect(await seenByFactory(["-p", "--guard", "--mode", "strict", "hello"])).toEqual({
			guard: true,
			mode: "strict",
		});
	});

	it("falls back to registered defaults when the flag is absent", async () => {
		expect(await seenByFactory(["-p", "hello"])).toEqual({ guard: false, mode: "off" });
	});

	it("ignores flags after the end-of-options marker", async () => {
		expect(await seenByFactory(["--", "--guard"])).toEqual({ guard: false, mode: "off" });
	});
});
