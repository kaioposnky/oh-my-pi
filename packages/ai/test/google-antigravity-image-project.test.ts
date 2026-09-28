/**
 * Antigravity image project resolution contract. A stored credential's
 * `projectId` can point at a GCP project without the Cloud Code Assist license
 * (403 SUBSCRIPTION_REQUIRED); the image request must instead carry the
 * `cloudaicompanionProject` reported by `v1internal:loadCodeAssist`, and fall
 * back to the stored project when discovery fails.
 */
import { describe, expect, it } from "bun:test";
import { generateImage } from "@oh-my-pi/pi-ai/images";
import { buildModel } from "@oh-my-pi/pi-catalog/build";
import type { FetchImpl, Model } from "@oh-my-pi/pi-catalog/types";

const SSE_IMAGE = `data: ${JSON.stringify({
	response: {
		candidates: [{ content: { parts: [{ inlineData: { data: "aW1n", mimeType: "image/png" } }] } }],
	},
})}\n\n`;

function imageModel(): Model {
	return buildModel({
		id: "gemini-3-pro-image",
		name: "antigravity/gemini-3-pro-image",
		provider: "google-antigravity",
		api: "google-gemini-cli",
		kind: "image",
		baseUrl: "https://daily-cloudcode-pa.googleapis.com",
		reasoning: false,
		input: ["text", "image"],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 4096,
		maxTokens: 4096,
	});
}

/** Records the `project` field of every `v1internal:streamGenerateContent` request body. */
function recordingFetch(loadCodeAssist: () => Response): { fetch: FetchImpl; projects: unknown[] } {
	const projects: unknown[] = [];
	const impl = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
		const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
		if (url.includes("loadCodeAssist")) return loadCodeAssist();
		if (url.includes("streamGenerateContent")) {
			const body: unknown = JSON.parse(String(init?.body));
			projects.push(typeof body === "object" && body !== null && "project" in body ? body.project : undefined);
			return new Response(SSE_IMAGE, { status: 200, headers: { "content-type": "text/event-stream" } });
		}
		// Model discovery: no advertised image model, so the catalog model is used.
		return new Response(JSON.stringify({}), { status: 200, headers: { "content-type": "application/json" } });
	};
	return { fetch: impl as FetchImpl, projects };
}

function credential(projectId: string): string {
	return JSON.stringify({ token: "access-token", projectId });
}

describe("antigravity image project resolution", () => {
	it("prefers the loadCodeAssist project over a stale credential project", async () => {
		const { fetch, projects } = recordingFetch(
			() =>
				new Response(JSON.stringify({ cloudaicompanionProject: "licensed-project" }), {
					status: 200,
					headers: { "content-type": "application/json" },
				}),
		);

		const result = await generateImage(
			imageModel(),
			{ prompt: "a red apple" },
			{ apiKey: credential("stale-project"), fetch },
		);

		expect(result.images).toHaveLength(1);
		expect(projects).toHaveLength(1);
		expect(projects[0]).toBe("licensed-project");
	});

	it("falls back to the credential project when loadCodeAssist fails", async () => {
		const { fetch, projects } = recordingFetch(() => new Response("nope", { status: 403 }));

		await generateImage(imageModel(), { prompt: "a red apple" }, { apiKey: credential("stale-project"), fetch });

		expect(projects[0]).toBe("stale-project");
	});
});
