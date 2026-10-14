import type { MarkerParams } from "./marker";
import type { RoomLoadContext } from "../levels/room";

export type TeleportParams = Omit<MarkerParams, "onEnter" | "onExit" | "onStay"> & {
	roomId: string;
	levelId: string;
	loadContext?: RoomLoadContext;
};
