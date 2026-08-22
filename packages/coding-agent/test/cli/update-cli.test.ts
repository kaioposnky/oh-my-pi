import { afterEach, describe, expect, it, vi } from "bun:test";
import { getLatestRelease, runUpdateCommand } from "../../src/cli/update-cli";

type FetchInput = string | URL | Request;
type FetchInit = RequestInit | BunFetchRequestInit;

describe("runUpdateCommand fetch cancellation", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("checks release metadata with a timeout signal", async () => {
		let requestSignal: AbortSignal | undefined;
		vi.spyOn(console, "log").mockImplementation(() => {});
		const fetchStub = Object.assign(
			async (_input: FetchInput, init?: FetchInit) => {
				requestSignal = init?.signal ?? undefined;
				return Response.json({ tag_name: "v999.0.0" });
			},
			{ preconnect: globalThis.fetch.preconnect },
		);
		vi.spyOn(globalThis, "fetch").mockImplementation(fetchStub);

		await runUpdateCommand({ force: false, check: true });

		expect(requestSignal).toBeInstanceOf(AbortSignal);
	});
});

describe("getLatestRelease fork releases", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	function stubGitHub(payloads: Record<string, unknown>): string[] {
		const urls: string[] = [];
		const fetchStub = Object.assign(
			async (input: FetchInput) => {
				const url = String(input);
				urls.push(url);
				const payload = Object.entries(payloads).find(([fragment]) => url.includes(fragment))?.[1];
				if (!payload) return new Response(null, { status: 404, statusText: "Not Found" });
				return Response.json(payload);
			},
			{ preconnect: globalThis.fetch.preconnect },
		);
		vi.spyOn(globalThis, "fetch").mockImplementation(fetchStub);
		return urls;
	}

	it("resolves version, tag, binary dist, and fork package names from the latest GitHub release", async () => {
		const urls = stubGitHub({
			"/repos/kaioposnky/oh-my-pi/releases/latest": { tag_name: "v999.1.0" },
		});

		const release = await getLatestRelease();

		expect(release.version).toBe("999.1.0");
		expect(release.tag).toBe("v999.1.0");
		expect(release.dist).toBe("binary");
		expect(release.packages).toEqual({
			pkg: "@oh-my-pi/pi-coding-agent",
			natives: "@oh-my-pi/pi-natives",
		});
		expect(urls).toEqual(["https://api.github.com/repos/kaioposnky/oh-my-pi/releases/latest"]);
	});

	it("strips a v prefix from release tags that already carry it", async () => {
		stubGitHub({
			"/repos/kaioposnky/oh-my-pi/releases/latest": { tag_name: "v1.2.3" },
		});
		const release = await getLatestRelease();
		expect(release.version).toBe("1.2.3");
		expect(release.tag).toBe("v1.2.3");
	});

	it("rejects a GitHub response without a tag_name", async () => {
		stubGitHub({
			"/repos/kaioposnky/oh-my-pi/releases/latest": { hello: true },
		});
		expect(getLatestRelease()).rejects.toThrow(/missing tag_name/);
	});
});

describe("getLatestRelease proxy errors", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("translates Bun's UnsupportedProxyProtocol fetch failure into an actionable CLI message", async () => {
		const fetchStub = Object.assign(
			async () => {
				throw new Error(
					'UnsupportedProxyProtocol fetching "https://registry.npmjs.org/@oh-my-pi/pi-coding-agent/latest". ' +
						"For more information, pass `verbose: true` in the second argument to fetch()",
				);
			},
			{ preconnect: globalThis.fetch.preconnect },
		);
		vi.spyOn(globalThis, "fetch").mockImplementation(fetchStub);

		const err = await getLatestRelease({ timeoutMs: 5000 }).then(
			() => null,
			(e: unknown) => e as Error,
		);

		expect(err).toBeInstanceOf(Error);
		// The raw fetch() instruction the CLI user cannot act on must not leak through.
		expect(err?.message).not.toContain("verbose: true");
		expect(err?.message).not.toContain("fetch()");
		// Instead the user gets actionable guidance about supported proxy schemes.
		expect(err?.message).toMatch(/SOCKS/i);
		expect(err?.message).toMatch(/https?:\/\//i);
	});
});
