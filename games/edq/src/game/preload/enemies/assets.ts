import type { AssetToPreload } from "engine/common/interfaces/assets";
import { TAIL_GUNNER_ASSETS } from "./tail-gunner/assets";
import { SOLDIER_ASSETS } from "./soldier/assets";
import { SPINES_BUG_ASSETS } from "./spines-enemy/assets";

export const ENEMIES_ASSETS: AssetToPreload<any>[] = [
	...TAIL_GUNNER_ASSETS,
	...SOLDIER_ASSETS,
	...SPINES_BUG_ASSETS,
];
