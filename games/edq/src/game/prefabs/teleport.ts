import { createMarker } from "./marker";
import type { TeleportParams } from "../interfaces/teleport";
import { TeleportController } from "../script-components/teleport/teleport-controller";
import { PLAYER_Z_INDEX } from "../script-components/player/constants";

export const createTeleport = (params: TeleportParams) => {
	const teleport = createMarker({...params, zIndex: params.zIndex ?? PLAYER_Z_INDEX.ARMS + 1, color: params.color ?? "#ff0000"});
	teleport.addComponent(
		new TeleportController({
			roomId: params.roomId,
			levelId: params.levelId,
			loadContext: params.loadContext,
		}),
	);
	return teleport;
};
