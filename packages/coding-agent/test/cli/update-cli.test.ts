import { describe, expect, it } from "bun:test";
import type { BuildHost } from "../../src/cli/build-service";
import { fetchForkBuild, getForkLatestRelease, REPO } from "../../src/cli/update-cli";

type FetchInput = string | URL | Request;
type FetchInit = RequestInit | BunFetchRequestInit;

const linuxHost: BuildHost = { target: "linux-x64", asset: "linux-x64", windows: false };

const asset = (name: string, overrides: Record<string, unknown> = {}) => ({
	name,
	size: 1024,
	digest: `sha256:${"a".repeat(64)}`,
	browser_download_url: `https://github.com/${REPO}/releases/download/v999.1.0/${name}`,
	...overrides,
});

/** Serve `payloads` by URL fragment, recording every requested URL and its init. */
function stubGitHub(payloads: Record<string, unknown>): {
	urls: string[];
	signals: Array<AbortSignal | undefined>;
	fetchImpl: typeof fetch;
} {
	const urls: string[] = [];
	const signals: Array<AbortSignal | undefined> = [];
	const fetchStub = Object.assign(
		async (input: FetchInput, init?: FetchInit) => {
			const url = String(input);
			urls.push(url);
			signals.push(init?.signal ?? undefined);
			const payload = Object.entries(payloads).find(([fragment]) => url.includes(fragment))?.[1];
			if (payload === undefined) return new Response(null, { status: 404, statusText: "Not Found" });
			return Response.json(payload);
		},
		{ preconnect: globalThis.fetch.preconnect },
	);
	return { urls, signals, fetchImpl: fetchStub as unknown as typeof fetch };
}

describe("getForkLatestRelease", () => {
	it("resolves the tag, version, binary dist, and the host asset digest", async () => {
		const stub = stubGitHub({
			"/releases/latest": { tag_name: "v999.1.0", assets: [asset("omp-linux-x64"), asset("SHA256SUMS.txt")] },
		});

		const release = await getForkLatestRelease({ fetchImpl: stub.fetchImpl, host: linuxHost });

		expect(release.tag).toBe("v999.1.0");
		expect(release.version).toBe("999.1.0");
		expect(release.dist).toBe("binary");
		expect(release.binaryDigest).toBe(`sha256:${"a".repeat(64)}`);
		expect(stub.urls[0]).toContain(`/repos/${REPO}/releases/latest`);
		// Release metadata is fetched under a timeout signal.
		expect(stub.signals[0]).toBeInstanceOf(AbortSignal);
	});

	it("reads the digest from SHA256SUMS.txt when GitHub reports none for the asset", async () => {
		const sums = `${"b".repeat(64)}  omp-linux-x64\n`;
		const urls: string[] = [];
		const fetchStub = Object.assign(
			async (input: FetchInput) => {
				const url = String(input);
				urls.push(url);
				if (url.endsWith("/releases/latest")) {
					return Response.json({
						tag_name: "v999.1.0",
						assets: [
							asset("omp-linux-x64", { digest: undefined }),
							asset("SHA256SUMS.txt", {
								digest: undefined,
								browser_download_url: "https://sums.test/SHA256SUMS.txt",
							}),
						],
					});
				}
				if (url === "https://sums.test/SHA256SUMS.txt") return new Response(sums);
				return new Response(null, { status: 404 });
			},
			{ preconnect: globalThis.fetch.preconnect },
		);

		const release = await getForkLatestRelease({ fetchImpl: fetchStub as unknown as typeof fetch, host: linuxHost });

		expect(release.binaryDigest).toBe(`sha256:${"b".repeat(64)}`);
		expect(urls).toContain("https://sums.test/SHA256SUMS.txt");
	});

	it("still advertises a release that publishes no asset for this platform", async () => {
		const stub = stubGitHub({ "/releases/latest": { tag_name: "v999.2.0", assets: [asset("omp-darwin-arm64")] } });

		const release = await getForkLatestRelease({ fetchImpl: stub.fetchImpl, host: linuxHost });

		expect(release.version).toBe("999.2.0");
		expect(release.binaryDigest).toBeUndefined();
	});

	it("takes the newest prerelease on the canary channel", async () => {
		const stub = stubGitHub({
			"/releases?per_page=30": [
				{ tag_name: "v999.2.0-canary.1", draft: false, prerelease: true, assets: [] },
				{ tag_name: "v999.2.0-canary.3", draft: false, prerelease: true, assets: [] },
				{ tag_name: "v999.3.0", draft: false, prerelease: false, assets: [] },
			],
		});

		const release = await getForkLatestRelease({
			channel: "canary",
			fetchImpl: stub.fetchImpl,
			host: linuxHost,
		});

		expect(release.version).toBe("999.2.0-canary.3");
	});
});

describe("fetchForkBuild", () => {
	it("answers with the host asset's name, size, digest, and download URL", async () => {
		const stub = stubGitHub({
			"/releases/latest": {
				tag_name: "v999.1.0",
				assets: [asset("omp-linux-x64", { size: 2048 }), asset("omp-darwin-arm64")],
			},
		});

		const build = await fetchForkBuild({ channel: "stable" }, { fetchImpl: stub.fetchImpl, host: linuxHost });

		expect(build.version).toBe("999.1.0");
		expect(build.file).toEqual({ name: "omp-linux-x64", size: 2048, sha256: "a".repeat(64) });
		expect(build.download).toBe(`https://github.com/${REPO}/releases/download/v999.1.0/omp-linux-x64`);
		expect(build.patch).toBeUndefined();
	});

	it("names the Windows asset with its .exe suffix", async () => {
		const stub = stubGitHub({
			"/releases/latest": { tag_name: "v999.1.0", assets: [asset("omp-windows-x64.exe")] },
		});

		const build = await fetchForkBuild(
			{ channel: "stable" },
			{ fetchImpl: stub.fetchImpl, host: { target: "windows-x64", asset: "windows-x64", windows: true } },
		);

		expect(build.file.name).toBe("omp-windows-x64.exe");
	});

	it("refuses a release that publishes no binary for this platform", async () => {
		const stub = stubGitHub({ "/releases/latest": { tag_name: "v999.1.0", assets: [asset("omp-darwin-arm64")] } });

		await expect(
			fetchForkBuild({ channel: "stable" }, { fetchImpl: stub.fetchImpl, host: linuxHost }),
		).rejects.toThrow(/publishes no omp-linux-x64/);
	});

	it("fetches an exact version by tag", async () => {
		const stub = stubGitHub({
			"/releases/tags/v999.0.5": { tag_name: "v999.0.5", assets: [asset("omp-linux-x64")] },
		});

		const build = await fetchForkBuild({ version: "999.0.5" }, { fetchImpl: stub.fetchImpl, host: linuxHost });

		expect(build.version).toBe("999.0.5");
		expect(stub.urls[0]).toContain(`/repos/${REPO}/releases/tags/v999.0.5`);
	});
});
