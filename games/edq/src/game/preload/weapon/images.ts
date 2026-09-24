import { GameAssetsTypes, type AssetToPreload } from "engine/common/interfaces/assets";


export const WEAPONS_IMAGES_ASSETS: AssetToPreload<any>[] = [
	
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:weapons:desert-eagle",
		path: "/assets/textures/weapons/desert-eagle.png",
	},
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:weapons:m4",
		path: "/assets/textures/weapons/m4.png",
	},
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:weapons:shotgun",
		path: "/assets/textures/weapons/shotgun.png",
	},
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:weapons:rocket-launcher",
		path: "/assets/textures/weapons/rocket-launcher.png",
	},
];
