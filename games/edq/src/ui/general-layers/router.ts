import type { ComponentType } from "react";
import { UI_LAYER_DEFINITIONS } from "../../game/interfaces/store";
import { CustomPlayerMenu } from "./custom-player-menu";
import { LoadingScreen } from "./loading-screen";
import { MainMenu } from "./main-menu";
import { GameModeMenu } from "./gamemode-menu";
import { ArcadeLevelsMenu } from "./arcade-levels-menu";

type GlobalLayer = (typeof UI_LAYER_DEFINITIONS)["global"][number];

export const GENERAL_VIEWS_ROUTER = {
	loadingScreen: LoadingScreen,
	mainMenu: MainMenu,
	customPlayerMenu: CustomPlayerMenu,
	gameModeMenu: GameModeMenu,
	levelsMenu: ArcadeLevelsMenu
	
} satisfies Partial<Record<GlobalLayer, ComponentType>>;
