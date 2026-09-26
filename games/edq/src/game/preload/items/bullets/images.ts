import { GameAssetsTypes, type AssetToPreload } from "engine/common/interfaces/assets";

/** Projectile images used by weapon definitions. */
export const BULLET_IMAGES_ASSETS: AssetToPreload<any>[] = [
	// Light, medium, and heavy currently reuse the standard projectile art.
	// They have separate asset keys so each ammo family can receive unique art later.
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:bullet:light",
		path: "/assets/textures/bullets/light.png",
	},
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:bullet:medium",
		path: "/assets/textures/bullets/medium.png",
	},
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:bullet:heavy",
		path: "/assets/textures/bullets/heavy.png",
	},
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:bullet:shells",
		path: "/assets/textures/bullets/shell.png",
	},
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:bullet:rocket-launcher",
		path: "/assets/textures/bullets/rocket-launcher.png",
	},
];
