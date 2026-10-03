import type { AssetToPreload } from "engine/common/interfaces/assets";
import { WEAPONS_ASSETS } from "./weapon/assets";
import { CONSUMABLE_IMAGES_ASSETS } from "./consumable/images";
import { BULLET_IMAGES_ASSETS } from "./bullets/images";

export const ITEMS_ASSETS: AssetToPreload<any>[] = [
	...WEAPONS_ASSETS,
	...CONSUMABLE_IMAGES_ASSETS,
	...BULLET_IMAGES_ASSETS,
];
