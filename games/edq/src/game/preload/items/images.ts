import { type AssetToPreload } from "engine/common/interfaces/assets";
import { WEAPONS_IMAGES_ASSETS } from "./weapon/images";
import { CONSUMABLE_IMAGES_ASSETS } from "./consumable/images";
import { BULLET_IMAGES_ASSETS } from "./bullets/images";


export const ITEMS_IMAGES_ASSETS: AssetToPreload<any>[] = [
	
	...WEAPONS_IMAGES_ASSETS,
	...CONSUMABLE_IMAGES_ASSETS,
	...BULLET_IMAGES_ASSETS
];
