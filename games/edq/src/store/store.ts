import { create } from "zustand";
import type { GameState } from "../game/enum/interfaces/store";
import { produce } from "immer";

export const useGameStore = create<GameState>((set) => ({
	runningGame: false,
	setRunningGame: (runningGame) => set({ runningGame }),
	loadingGame: true,
	setLoadingGame: (loadingGame) => set({ loadingGame }),
	paused: false,
	setPaused: (paused) => set({ paused }),
	uiLayers: {
		inGameLayer: {
			visible: false,
			setVisible: (visible) =>
				set(
					produce((state) => {
						state.uiLayers.inGameLayer.visible = visible;
					})
				),
			hudLayer: {
				visible: false,
				setVisible: (visible) =>
					set(
						produce((state) => (state.uiLayers.inGameLayer.hudLayer.visible = visible))
					),
			},
			victoryMenu: {
				visible: false,
				setVisible: (visible) =>
					set(
						produce((state) => {
							state.uiLayers.inGameLayer.victoryMenu.visible = visible;
						})
					),
			},
			gameOverMenu: {
				visible: false,
				setVisible: (visible) =>
					set(
						produce((state) => {
							state.uiLayers.inGameLayer.gameOverMenu.visible = visible;
						})
					),
			},
			pauseMenu: {
				visible: false,
				setVisible: (visible) =>
					set(
						produce((state) => {
							state.uiLayers.inGameLayer.pauseMenu.visible = visible;
						})
					),
			},
		},
		generalLayer: {
			visible: false,
			setVisible: (visible) =>
				set(
					produce((state) => {
						state.uiLayers.generalLayer.visible = visible;
					})
				),
			loadingScreen: {
				visible: false,
				setVisible: (visible) =>
					set(
						produce((state) => {
							state.uiLayers.generalLayer.loadingScreen.visible = visible;
						})
					),
			},
			mainMenu: {
				visible: false,
				setVisible: (visible) =>
					set(
						produce((state) => {
							state.uiLayers.generalLayer.mainMenu.visible = visible;
						})
					),
			},
			controlsMenu: {
				visible: false,
				setVisible: (visible) =>
					set(
						produce((state) => {
							state.uiLayers.generalLayer.controlsMenu.visible = visible;
						})
					),
			},
			levelsMenu: {
				visible: false,
				setVisible: (visible) =>
					set(
						produce((state) => {
							state.uiLayers.generalLayer.levelsMenu.visible = visible;
						})
					),
			},
			SettingsMenu: {
				visible: false,
				setVisible: (visible) =>
					set(
						produce((state) => {
							state.uiLayers.generalLayer.SettingsMenu.visible = visible;
						})
					),
			},
		},
	},
}));
