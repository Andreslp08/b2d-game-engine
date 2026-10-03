import { GameAssetsTypes, type AssetToPreload } from "engine/common/interfaces/assets";
import { PLAYER_SKIN1_ASSETS } from "./skin1";
import { PLAYER_SKIN2_ASSETS } from "./skin2";

const EFFECTS_ASSETS: AssetToPreload<any>[] = [
    {
		type: GameAssetsTypes.Image,
		name: "spritesheet:dash-effect",
		path: "/assets/textures/effects/player/dash-effect.png",
	},
]
export const PLAYER_IMAGES_ASSETS:  AssetToPreload<any>[] = [

    ...EFFECTS_ASSETS,
    ...PLAYER_SKIN1_ASSETS,
    ...PLAYER_SKIN2_ASSETS
];
