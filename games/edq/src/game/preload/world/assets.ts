import { GameAssetsTypes, type AssetToPreload } from "engine/common/interfaces/assets";

export const WORLD_ASSETS: AssetToPreload<any>[] = [
	{ type: GameAssetsTypes.Image, name: "spritesheet:city", path: "/assets/textures/world/city.png" },
	{ type: GameAssetsTypes.Image, name: "spritesheet:box", path: "/assets/textures/world/box.png" },
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:block1",
		path: "/assets/textures/world/block1.png",
	},
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:virus",
		path: "/assets/textures/world/virus.png",
	},
];
