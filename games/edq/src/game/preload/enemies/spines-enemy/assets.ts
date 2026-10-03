import { GameAssetsTypes, type AssetToPreload } from "engine/common/interfaces/assets";

const IMAGES_ASSETS: AssetToPreload<any>[] = [
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:enemies:spines-bug",
		path: "/assets/textures/enemies/spines-bug.png",
	},
];

const ATLAS_ASSETS: AssetToPreload<any>[] = [
	{
		type: GameAssetsTypes.Atlas,
		name: "atlas:enemies:spines-bug",
		path: "/assets/atlas/enemies/spines-bug.json",
	},
];

export const SPINES_BUG_ASSETS = [...IMAGES_ASSETS, ...ATLAS_ASSETS];
