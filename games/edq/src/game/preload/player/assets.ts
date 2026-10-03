import type { AssetToPreload } from "engine/common/interfaces/assets";
import { PLAYER_IMAGES_ASSETS } from "./textures/images";
import { PLAYER_ATLAS_ASSETS } from "./atlas/atlas";

export const PLAYER_ASSETS: AssetToPreload<any>[] = [
	...PLAYER_IMAGES_ASSETS,
	...PLAYER_ATLAS_ASSETS,
];
