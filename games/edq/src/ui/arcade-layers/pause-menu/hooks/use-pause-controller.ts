import { useRef, useState } from "react";
import { Engine } from "engine";
import { MouseManager } from "engine/input/mouse-manager";
import { currentGameInstance } from "../../../../game/game";
import { useGameStore } from "../../../../store/store";

export const usePauseController = () => {
	const currentGame = useGameStore((state) => state.currentGame);
	const currentUI = useGameStore((state) => state.currentUI);
	const setCurrentUI = useGameStore((state) => state.setCurrentUI);
	const clearCurrentUI = useGameStore((state) => state.clearCurrentUI);
	const clearCurrentGame = useGameStore((state) => state.clearCurrentGame);
	const pendingResumeRef = useRef(false);
	const autoPausedByVisibilityRef = useRef(false);
	const [isTransitionLocked, setIsTransitionLocked] = useState(false);
	const isPauseMenuVisible = currentUI?.scope === "arcade" && currentUI.layer === "pauseMenu";

	const openPauseMenu = () => {
		if (isPauseMenuVisible || isTransitionLocked || currentGame !== "arcade") return;
		setIsTransitionLocked(true);
		currentGameInstance.pause();
		MouseManager.setCursorRenderMode("system");
		setCurrentUI("arcade", "pauseMenu");
	};

	const closePauseMenuAndResume = () => {
		if (!isPauseMenuVisible || isTransitionLocked) return;
		setIsTransitionLocked(true);
		autoPausedByVisibilityRef.current = false;
		MouseManager.setCursorRenderMode("custom");
		pendingResumeRef.current = true;
		clearCurrentUI();
	};

	const togglePauseMenu = () => {
		if (isPauseMenuVisible) {
			closePauseMenuAndResume();
			return;
		}

		openPauseMenu();
	};

	const pauseOnVisibilityLoss = () => {
		if (!isPauseMenuVisible && !Engine.isPaused) {
			autoPausedByVisibilityRef.current = true;
			openPauseMenu();
		}
	};

	const resumeAfterVisibilityRestore = () => {
		if (autoPausedByVisibilityRef.current && isPauseMenuVisible) {
			closePauseMenuAndResume();
		}
	};

	const goToMainMenu = () => {
		pendingResumeRef.current = false;
		autoPausedByVisibilityRef.current = false;
		setIsTransitionLocked(false);
		MouseManager.setCursorRenderMode("system");
		clearCurrentGame();
		setCurrentUI("global", "mainMenu");
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
		isPauseMenuVisible,
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
