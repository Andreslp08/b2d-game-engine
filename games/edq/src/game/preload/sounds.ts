import {
	GameAssetsTypes,
	type AssetToPreload,
	type SoundAssetOptions,
} from "engine/common/interfaces/assets";

export const SOUNDS_ASSETS: AssetToPreload<SoundAssetOptions>[] = [
	{
		type: GameAssetsTypes.Sound,
		name: "sound:desert-eagle",
		path: "/assets/sounds/weapons/desert-eagle.mp3",
		params: { sprite: { shot: [4200, 6000] } },
	},
];
