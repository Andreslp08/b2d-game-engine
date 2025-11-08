import { type AssetToPreload, type SoundAssetOptions } from "engine/common/interfaces/assets";
import { IMAGES_ASSETS } from "./images";
import { ATLAS_ASSETS } from "./atlas";
import { SOUNDS_ASSETS } from "./sounds";

export const PRELOAD_ASSETS: AssetToPreload<any | SoundAssetOptions>[] = [
	// IMAGES
	...IMAGES_ASSETS,
	// ATLAS
	...ATLAS_ASSETS,
	// SOUNDS
	...SOUNDS_ASSETS,
];
