import { GameAssetsTypes, type AssetToPreload } from "engine/common/interfaces/assets";

export const IMAGES_ASSETS:  AssetToPreload<any>[] = [
    // UI
    {
        type: GameAssetsTypes.Image,
        name: "ui:segment-bar-container",
        path: "/assets/ui/segment-bar-container.png",
    },
    { type: GameAssetsTypes.Image, name: "ui:health-icon", path: "/assets/ui/health-icon.png" },
    { type: GameAssetsTypes.Image, name: "ui:shield-icon", path: "/assets/ui/shield-icon.png" },
    // spritesheets
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:city",
        path: "/assets/textures/city.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:desert-eagle",
        path: "/assets/textures/desert-eagle.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:desert-eagle-bullet",
        path: "/assets/textures/desert-eagle-bullet.png",
    },
    { type: GameAssetsTypes.Image, name: "spritesheet:box", path: "/assets/textures/Box.png" },
    { type: GameAssetsTypes.Image, name: "spritesheet:city", path: "/assets/textures/city.png" },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-idle",
        path: "/assets/textures/player-idle.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-idle-no-arms",
        path: "/assets/textures/player-idle-no-arms.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-right-arm",
        path: "/assets/textures/player-right-arm.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-run",
        path: "/assets/textures/player-run.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-run-no-arm",
        path: "/assets/textures/player-run-no-arm.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-jump",
        path: "/assets/textures/player-jump.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:player-jump-no-arm",
        path: "/assets/textures/player-jump-no-arm.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:soldier-idle",
        path: "/assets/textures/soldier-idle.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:block1",
        path: "/assets/textures/block1.png",
    },
    {
        type: GameAssetsTypes.Image,
        name: "spritesheet:spines-bug",
        path: "/assets/textures/spines-bug.png",
    },
];
