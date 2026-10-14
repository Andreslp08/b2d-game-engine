import type { MarkerParams } from "./marker";

export type TeleportParams = Omit<MarkerParams, "onEnter" | "onExit" | "onStay"> & {
	roomId: string;
	levelId: string;
};
