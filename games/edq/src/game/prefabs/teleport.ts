import { createMarker } from "./marker";
import type { TeleportParams } from "../interfaces/teleport";
import { TeleportController } from "../script-components/teleport/teleport-controller";

export const createTeleport = (params: TeleportParams) => {
	const teleport = createMarker(params);
	teleport.addComponent(
		new TeleportController({
			roomId: params.roomId,
			levelId: params.levelId,
			loadContext: params.loadContext,
		}),
	);
	return teleport;
};
