import { useEffect } from "react";
import { currentGameInstance } from "../../../../game/game";
import { GameSceneLoader } from "../../../../game/scene-loader";
import { useGameStore } from "../../../../store/store";
import { MouseManager } from "engine/input/mouse-manager";

export const useGameOverController = () => {
	const currentUI = useGameStore((state) => state.currentUI);
	const clearCurrentUI = useGameStore((state) => state.clearCurrentUI);
	const clearCurrentGame = useGameStore((state) => state.clearCurrentGame);
	const setCurrentUI = useGameStore((state) => state.setCurrentUI);
	const isGameOverVisible = currentUI?.scope === "arcade" && currentUI.layer === "gameOverMenu";

	const goToMainMenu = () => {
		clearCurrentGame();
		setCurrentUI("global", "mainMenu");
		currentGameInstance.stop();
	};

	const restart = () => {
		clearCurrentUI();
		GameSceneLoader.restartCurrentScene();
	};

	useEffect(() => {
		if (isGameOverVisible) {
			MouseManager.setCursorRenderMode("system");
		} else {
			MouseManager.setCursorRenderMode("custom");
		}
		const timer = setTimeout(() => {
			if (!isGameOverVisible) return;
			currentGameInstance.pause();
		}, 3000);
		return () => clearTimeout(timer);
	}, [isGameOverVisible]);

	return { goToMainMenu, restart };
};
