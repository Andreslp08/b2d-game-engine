import { GameAssetsTypes, type AssetToPreload } from "engine/common/interfaces/assets";

const IMAGES_ASSETS:  AssetToPreload<any>[] = [
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:enemies:soldier",
        path: "/assets/textures/enemies/soldier.png",
    },

];

const ATLAS_ASSETS:  AssetToPreload<any>[] = [
    {
        type: GameAssetsTypes.Atlas,
        name: "atlas:enemies:soldier",
        path: "/assets/atlas/enemies/soldier.json",
    },
];

export const SOLDIER_ASSETS = [
    ...IMAGES_ASSETS,
    ...ATLAS_ASSETS
]