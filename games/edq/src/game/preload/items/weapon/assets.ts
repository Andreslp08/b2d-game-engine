import type { AssetToPreload } from "engine/common/interfaces/assets";
import { WEAPONS_IMAGES_ASSETS } from "./images";
import { WEAPON_SOUNDS_ASSETS } from "./sounds";

export const WEAPONS_ASSETS: AssetToPreload<any>[] = [
	...WEAPONS_IMAGES_ASSETS,
	...WEAPON_SOUNDS_ASSETS,
];
