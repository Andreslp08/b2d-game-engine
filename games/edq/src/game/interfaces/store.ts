export const UI_LAYER_DEFINITIONS = {
	global: ["loadingScreen", "mainMenu", "levelsMenu", "settingsMenu", "controlsMenu"],
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
}

export interface GameRuntimeActions {
	setCurrentGame: (game: GameId | null) => void;
	clearCurrentGame: () => void;
	setCurrentUI: <S extends UIScope>(scope: S, layer: UILayersByScope[S]) => void;
	clearCurrentUI: () => void;
}

export type GameState = GameRuntimeState & GameRuntimeActions;
