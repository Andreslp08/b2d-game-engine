import { GameAssetsTypes, type AssetToPreload } from "engine/common/interfaces/assets";

export const UI_ASSETS: AssetToPreload<any>[] = [
	{
		type: GameAssetsTypes.Image,
		name: "ui:segment-bar-container",
		path: "/assets/ui/segment-bar-container.png",
	},
	{ type: GameAssetsTypes.Image, name: "ui:health-icon", path: "/assets/ui/health-icon.png" },
	{ type: GameAssetsTypes.Image, name: "ui:shield-icon", path: "/assets/ui/shield-icon.png" },
	{ type: GameAssetsTypes.Image, name: "ui:crosshair", path: "/assets/ui/crosshair/main-crosshair.png" },
	{ type: GameAssetsTypes.Image, name: "ui:crosshair-main-circle", path: "/assets/ui/crosshair/main-circle.png" },
	{ type: GameAssetsTypes.Image, name: "ui:crosshair-secondary-circle", path: "/assets/ui/crosshair/secondary-circle.png" },
	{ type: GameAssetsTypes.Image, name: "ui:current-weapon-container", path: "/assets/ui/current-weapon/current-weapon-texture.png" },
	{ type: GameAssetsTypes.Image, name: "ui:fist", path: "/assets/ui/current-weapon/fist.png" },
];
