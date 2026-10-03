import { GameAssetsTypes, type AssetToPreload } from "engine/common/interfaces/assets";

const IMAGES_ASSETS:  AssetToPreload<any>[] = [
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:enemies:tail-gunner",
        path: "/assets/textures/enemies/tail-gunner.png",
    },

];

const ATLAS_ASSETS:  AssetToPreload<any>[] = [
    {
        type: GameAssetsTypes.Atlas,
        name: "atlas:enemies:tail-gunner",
        path: "/assets/atlas/enemies/tail-gunner.json",
    },
];

export const TAIL_GUNNER_ASSETS = [
    ...IMAGES_ASSETS,
    ...ATLAS_ASSETS
]