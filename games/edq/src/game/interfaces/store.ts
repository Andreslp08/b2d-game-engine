import type { PlayerSkin } from "../config/constants";

export const UI_LAYER_DEFINITIONS = {
	global: ["loadingScreen", "mainMenu", "gameModeMenu", "levelsMenu", "customPlayerMenu", "settingsMenu", "controlsMenu"],
	arcade: ["pauseMenu", "victoryMenu", "gameOverMenu"],
	story: ["pauseMenu", "victoryMenu", "gameOverMenu"],
} as const;

export type UIScope = keyof typeof UI_LAYER_DEFINITIONS;
export type GameId = Exclude<UIScope, "global">;

export type UILayersByScope = {
	[S in UIScope]: (typeof UI_LAYER_DEFINITIONS)[S][number];
};

export type ActiveUIState =
	| {
			[S in UIScope]: {
				scope: S;
				layer: UILayersByScope[S];
			};
	  }[UIScope]
	| null;

export interface GameRuntimeState {
	currentGame: GameId | null;
	currentUI: ActiveUIState;
	currentSkin: PlayerSkin;
}

export interface GameRuntimeActions {
	setCurrentGame: (game: GameId | null) => void;
	clearCurrentGame: () => void;
	setCurrentUI: <S extends UIScope>(scope: S, layer: UILayersByScope[S]) => void;
	clearCurrentUI: () => void;
	setCurrentSkin: (skin: PlayerSkin) => void;
}

export type GameState = GameRuntimeState & GameRuntimeActions;
