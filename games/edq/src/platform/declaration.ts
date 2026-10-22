import type { Runtime } from "./types";

declare global {
	interface Window {
		__EDQ_RUNTIME__?: Runtime;
		b2dHost?: {
			exit(): Promise<void>;
		};
	}
}

export const RUNTIME: Runtime = window.__EDQ_RUNTIME__ ?? {
	environment: import.meta.env.DEV ? "development" : "production",
	platform: "web",
};
