import { type AssetToPreload, type SoundAssetOptions } from "engine/common/interfaces/assets";
import { ENEMIES_ASSETS } from "./enemies/assets";
import { ITEMS_ASSETS } from "./items/assets";
import { PLAYER_ASSETS } from "./player/assets";
import { UI_ASSETS } from "./ui/assets";
import { WORLD_ASSETS } from "./world/assets";

export const PRELOAD_ASSETS: AssetToPreload<any | SoundAssetOptions>[] = [
	...PLAYER_ASSETS,
	...ITEMS_ASSETS,
	...ENEMIES_ASSETS,
	...WORLD_ASSETS,
	...UI_ASSETS,
];
