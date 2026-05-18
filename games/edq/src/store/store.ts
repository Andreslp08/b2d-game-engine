import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ActiveUIState, GameState, UIScope, UILayersByScope } from "../game/interfaces/store";

const INITIAL_UI_STATE: GameState["currentUI"] = {
	scope: "global",
	layer: "loadingScreen",
};

type ActiveUIForScope<S extends UIScope> = Extract<NonNullable<ActiveUIState>, { scope: S }>;

const createActiveUIState = <S extends UIScope>(
	scope: S,
	layer: UILayersByScope[S]
): ActiveUIForScope<S> =>
	({
		scope,
		layer,
	}) as ActiveUIForScope<S>;

export const useGameStore = create<GameState>()(
	devtools<GameState>(
		(set) => ({
			currentGame: null,
			currentUI: INITIAL_UI_STATE,

			setCurrentGame: (currentGame) => set({ currentGame }, false, "game/setCurrentGame"),
			clearCurrentGame: () => set({ currentGame: null }, false, "game/clearCurrentGame"),

			setCurrentUI: <S extends UIScope>(scope: S, layer: UILayersByScope[S]) =>
				set(
					{ currentUI: createActiveUIState(scope, layer) },
					false,
					`ui/${scope}/${String(layer)}/setCurrent`
				),

			clearCurrentUI: () => set({ currentUI: null }, false, "ui/clearCurrentUI"),
		}),
		{
			name: "edq-game-store",
			enabled: import.meta.env.DEV,
		}
	)
);
