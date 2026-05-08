import { type AssetToPreload } from "engine/common/interfaces/assets";
import { PLAYER_SKIN1_ASSETS } from "./skin1";
import { PLAYER_SKIN2_ASSETS } from "./skin2";

export const PLAYER_IMAGES_ASSETS:  AssetToPreload<any>[] = [
    ...PLAYER_SKIN1_ASSETS,
    ...PLAYER_SKIN2_ASSETS
];
