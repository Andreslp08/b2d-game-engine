import {
	GameAssetsTypes,
	type AssetToPreload,
	type SoundAssetOptions,
} from "engine/common/interfaces/assets";

export const SOUNDS_ASSETS: AssetToPreload<SoundAssetOptions>[] = [
	{
		type: GameAssetsTypes.Sound,
		name: "sound:weapon:shot:desert-eagle",
		path: "/assets/sounds/weapons/desert-eagle.mp3",
		params: { sprite: { shot: [4200, 6000] } },
	},
	{
		type: GameAssetsTypes.Sound,
		name: "sound:weapon:shot:m4",
		path: "/assets/sounds/weapons/m4.mp3",
		params: { sprite: { shot: [0, 100] } },
	},
	{
		type: GameAssetsTypes.Sound,
		name: "sound:weapon:shot:shotgun",
		path: "/assets/sounds/weapons/shotgun.mp3",
		params: { sprite: { shot: [0, 1000] } },
	},
	{
		type: GameAssetsTypes.Sound,
		name: "sound:weapon:shot:rocket-launcher",
		path: "/assets/sounds/weapons/rocket-launcher.mp3",
		params: { sprite: { shot: [0,1000] } },
	},
	{
		type: GameAssetsTypes.Sound,
		name: "sound:explosion",
		path: "/assets/sounds/weapons/explosion.mp3",
		params: { sprite: { explosion1: [0, 10000] } },
	},
];
