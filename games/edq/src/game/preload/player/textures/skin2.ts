import { GameAssetsTypes, type AssetToPreload } from "engine/common/interfaces/assets";

export const PLAYER_SKIN2_ASSETS:  AssetToPreload<any>[] = [
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-skin2-idle",
        path: "/assets/textures/player/skin2/player-idle.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-skin2-idle-no-arms",
        path: "/assets/textures/player/skin2/player-idle-no-arms.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-skin2-right-arm",
        path: "/assets/textures/player/skin2/player-right-arm.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-skin2-run",
        path: "/assets/textures/player/skin2/player-run.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-skin2-run-no-arm",
        path: "/assets/textures/player/skin2/player-run-no-arm.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-skin2-jump",
        path: "/assets/textures/player/skin2/player-jump.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-skin2-jump-no-arm",
        path: "/assets/textures/player/skin2/player-jump-no-arm.png",
    },
];
