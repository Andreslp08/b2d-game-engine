import type { AssetToPreload } from "engine/common/interfaces/assets";
import { PLAYER_SKIN1_ATLAS_ASSETS } from "./skin1-atlas";
import { PLAYER_SKIN2_ATLAS_ASSETS } from "./skin2-atlas";

export const PLAYER_ATLAS_ASSETS:  AssetToPreload<any>[] = [
    ...PLAYER_SKIN1_ATLAS_ASSETS,
    ...PLAYER_SKIN2_ATLAS_ASSETS
]