import { GameAssetsTypes, type AssetToPreload } from "engine/common/interfaces/assets";

export const PLAYER_SKIN1_ASSETS:  AssetToPreload<any>[] = [
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-skin1-idle",
        path: "/assets/textures/player/skin1/player-idle.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-skin1-idle-no-arms",
        path: "/assets/textures/player/skin1/player-idle-no-arms.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-skin1-right-arm",
        path: "/assets/textures/player/skin1/player-right-arm.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-skin1-run",
        path: "/assets/textures/player/skin1/player-run.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-skin1-run-no-arm",
        path: "/assets/textures/player/skin1/player-run-no-arm.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-skin1-jump",
        path: "/assets/textures/player/skin1/player-jump.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-skin1-jump-no-arm",
        path: "/assets/textures/player/skin1/player-jump-no-arm.png",
    },
];
