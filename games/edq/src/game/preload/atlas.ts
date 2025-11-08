import { GameAssetsTypes, type AssetToPreload } from "engine/common/interfaces/assets";

export const ATLAS_ASSETS:  AssetToPreload<any>[] = [
	{
		type: GameAssetsTypes.Atlas,
		name: "atlas:player-idle",
		path: "/assets/atlas/player-idle.json",
	},
	{
		type: GameAssetsTypes.Atlas,
		name: "atlas:player-idle-no-arms",
		path: "/assets/atlas/player-idle-no-arms.json",
	},
	{
		type: GameAssetsTypes.Atlas,
		name: "atlas:player-run",
		path: "/assets/atlas/player-run.json",
	},
	{
		type: GameAssetsTypes.Atlas,
		name: "atlas:player-run-no-arm",
		path: "/assets/atlas/player-run-no-arm.json",
	},
	{
		type: GameAssetsTypes.Atlas,
		name: "atlas:soldier-idle",
		path: "/assets/atlas/soldier-idle.json",
	},
	{
		type: GameAssetsTypes.Atlas,
		name: "atlas:player-jump",
		path: "/assets/atlas/player-jump.json",
	},
	{
		type: GameAssetsTypes.Atlas,
		name: "atlas:player-jump-no-arm",
		path: "/assets/atlas/player-jump-no-arm.json",
	},
];
