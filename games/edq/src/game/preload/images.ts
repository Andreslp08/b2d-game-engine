import { GameAssetsTypes, type AssetToPreload } from "engine/common/interfaces/assets";
import { PLAYER_IMAGES_ASSETS } from "./player/textures/images";

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
        name: "spritesheet:virus",
        path: "/assets/textures/Virus.png",
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
    ...PLAYER_IMAGES_ASSETS,
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
