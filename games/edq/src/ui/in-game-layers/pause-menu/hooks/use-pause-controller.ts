import { useRef, useState } from "react";
import { Engine } from "engine";
import { MouseManager } from "engine/input/mouse-manager";
import { currentGameInstance } from "../../../../game/game";
import { useGameStore } from "../../../../store/store";

export const usePauseController = () => {
	const pauseMenu = useGameStore((state) => state.uiLayers.inGameLayer.pauseMenu);
	const inGameLayer = useGameStore((state) => state.uiLayers.inGameLayer);
	const generalLayer = useGameStore((state) => state.uiLayers.generalLayer);
	const setRunningGame = useGameStore((state) => state.setRunningGame);
	const pendingResumeRef = useRef(false);
	const autoPausedByVisibilityRef = useRef(false);
	const [isTransitionLocked, setIsTransitionLocked] = useState(false);

	const openPauseMenu = () => {
		if (pauseMenu.visible || isTransitionLocked) return;
		setIsTransitionLocked(true);
		currentGameInstance.pause();
		MouseManager.setCursorRenderMode("system");
		pauseMenu.setVisible(true);
	};

	const closePauseMenuAndResume = () => {
		if (!pauseMenu.visible || isTransitionLocked) return;
		setIsTransitionLocked(true);
		autoPausedByVisibilityRef.current = false;
		MouseManager.setCursorRenderMode("custom");
		pendingResumeRef.current = true;
		pauseMenu.setVisible(false);
	};

	const togglePauseMenu = () => {
		if (pauseMenu.visible) {
			closePauseMenuAndResume();
			return;
		}

		openPauseMenu();
	};

	const pauseOnVisibilityLoss = () => {
		if (!pauseMenu.visible && !Engine.isPaused) {
			autoPausedByVisibilityRef.current = true;
			openPauseMenu();
		}
	};

	const resumeAfterVisibilityRestore = () => {
		if (autoPausedByVisibilityRef.current && pauseMenu.visible) {
			closePauseMenuAndResume();
		}
	};

	const goToMainMenu = () => {
		pendingResumeRef.current = false;
		autoPausedByVisibilityRef.current = false;
		setIsTransitionLocked(false);
		MouseManager.setCursorRenderMode("system");
		pauseMenu.setVisible(false);
		inGameLayer.setVisible(false);
		generalLayer.setVisible(true);
		generalLayer.mainMenu.setVisible(true);
		setRunningGame(false);
		currentGameInstance.stop();
	};

	const handlePauseMenuEnterComplete = () => {
		setIsTransitionLocked(false);
	};

	const handlePauseMenuExitComplete = () => {
		if (pendingResumeRef.current) {
			pendingResumeRef.current = false;
			currentGameInstance.resume();
		}

		setIsTransitionLocked(false);
	};

	return {
		isPauseMenuVisible: pauseMenu.visible,
		isTransitionLocked,
		openPauseMenu,
		closePauseMenuAndResume,
		togglePauseMenu,
		pauseOnVisibilityLoss,
		resumeAfterVisibilityRestore,
		goToMainMenu,
		handlePauseMenuEnterComplete,
		handlePauseMenuExitComplete,
	};
};
