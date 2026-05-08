import { GameAssetsTypes, type AssetToPreload } from "engine/common/interfaces/assets";
import { PLAYER_ATLAS_ASSETS } from "./player/atlas/atlas";

export const ATLAS_ASSETS:  AssetToPreload<any>[] = [
	...PLAYER_ATLAS_ASSETS,
	{
		type: GameAssetsTypes.Atlas,
		name: "atlas:soldier-idle",
		path: "/assets/atlas/soldier-idle.json",
	},
	{
		type: GameAssetsTypes.Atlas,
		name: "atlas:spines-bug",
		path: "/assets/atlas/spines-bug.json",
	},
];
