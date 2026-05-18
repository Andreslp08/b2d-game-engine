import { create } from "zustand";
import type { GameState } from "../game/interfaces/store";
import { produce } from "immer";
import { devtools } from "zustand/middleware";

export const useGameStore = create<GameState>()(
	devtools(
		(set) => ({
			runningGame: false,
			setRunningGame: (runningGame) => set({ runningGame }, false, "game/setRunningGame"),
			loadingGame: true,
			setLoadingGame: (loadingGame) => set({ loadingGame }, false, "game/setLoadingGame"),
			paused: false,
			setPaused: (paused) => set({ paused }, false, "game/setPaused"),
			uiLayers: {
				inGameLayer: {
					visible: false,
					setVisible: (visible) =>
						set(
							produce((state) => {
								state.uiLayers.inGameLayer.visible = visible;
							}),
							false,
							"ui/inGameLayer/setVisible"
						),
					hudLayer: {
						visible: false,
						setVisible: (visible) =>
							set(
								produce((state) => (state.uiLayers.inGameLayer.hudLayer.visible = visible)),
								false,
								"ui/inGameLayer/hudLayer/setVisible"
							),
					},
					victoryMenu: {
						visible: false,
						setVisible: (visible) =>
							set(
								produce((state) => {
									state.uiLayers.inGameLayer.victoryMenu.visible = visible;
								}),
								false,
								"ui/inGameLayer/victoryMenu/setVisible"
							),
					},
					gameOverMenu: {
						visible: false,
						setVisible: (visible) =>
							set(
								produce((state) => {
									state.uiLayers.inGameLayer.gameOverMenu.visible = visible;
								}),
								false,
								"ui/inGameLayer/gameOverMenu/setVisible"
							),
					},
					pauseMenu: {
						visible: false,
						setVisible: (visible) =>
							set(
								produce((state) => {
									state.uiLayers.inGameLayer.pauseMenu.visible = visible;
								}),
								false,
								"ui/inGameLayer/pauseMenu/setVisible"
							),
					},
				},
				generalLayer: {
					visible: false,
					setVisible: (visible) =>
						set(
							produce((state) => {
								state.uiLayers.generalLayer.visible = visible;
							}),
							false,
							"ui/generalLayer/setVisible"
						),
					loadingScreen: {
						visible: false,
						setVisible: (visible) =>
							set(
								produce((state) => {
									state.uiLayers.generalLayer.loadingScreen.visible = visible;
								}),
								false,
								"ui/generalLayer/loadingScreen/setVisible"
							),
					},
					mainMenu: {
						visible: false,
						setVisible: (visible) =>
							set(
								produce((state) => {
									state.uiLayers.generalLayer.mainMenu.visible = visible;
								}),
								false,
								"ui/generalLayer/mainMenu/setVisible"
							),
					},
					controlsMenu: {
						visible: false,
						setVisible: (visible) =>
							set(
								produce((state) => {
									state.uiLayers.generalLayer.controlsMenu.visible = visible;
								}),
								false,
								"ui/generalLayer/controlsMenu/setVisible"
							),
					},
					levelsMenu: {
						visible: false,
						setVisible: (visible) =>
							set(
								produce((state) => {
									state.uiLayers.generalLayer.levelsMenu.visible = visible;
								}),
								false,
								"ui/generalLayer/levelsMenu/setVisible"
							),
					},
					SettingsMenu: {
						visible: false,
						setVisible: (visible) =>
							set(
								produce((state) => {
									state.uiLayers.generalLayer.SettingsMenu.visible = visible;
								}),
								false,
								"ui/generalLayer/settingsMenu/setVisible"
							),
					},
				},
			},
		}),
		{
			name: "edq-game-store",
			enabled: import.meta.env.DEV,
		}
	)
);