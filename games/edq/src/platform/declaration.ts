import type { Platform } from "./types";

declare global {
  interface Window {
    __PLATFORM__?: Platform;
    b2dHost?: {
      exit(): Promise<void>;
    };
  }
}
export const platform: Platform = window.__PLATFORM__ ?? "web";
