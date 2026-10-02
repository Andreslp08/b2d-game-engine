import { useEffect } from "react";
import { currentGameInstance } from "../../../../game/game";
import { useGameStore } from "../../../../store/store";
import { useEscapeBack } from "../../../shared/hooks/use-escape-back";
import { MouseManager } from "engine/input/mouse-manager";

export const useInventoryMenuController = () => {
	const currentUI = useGameStore((state) => state.currentUI);
	const setCurrentUI = useGameStore((state) => state.setCurrentUI);
	const clearCurrentUI = useGameStore((state) => state.clearCurrentUI);
	const isInventoryMenuVisible =
		currentUI?.scope === "arcade" && currentUI.layer === "inventoryMenu";
	const keybind = "Tab";

	const hideUI = () => {
		clearCurrentUI();
		MouseManager.setCursorRenderMode("hidden");
	};

	const showUI = () => {
		setCurrentUI("arcade", "inventoryMenu");
		MouseManager.setCursorRenderMode("system");
		currentGameInstance.pause();
	};

	useEscapeBack({
		onBack: hideUI,
		enabled: isInventoryMenuVisible,
	});

	const handleExitComplete = () => {
		currentGameInstance.resume();
	};

	useEffect(() => {
		const showInventoryMenu = (event: KeyboardEvent) => {
			if (event.key !== keybind) return;

			// Tab is an in-game keybind, so do not let the browser move focus
			// through the page's controls.
			event.preventDefault();

			if (currentUI?.scope === "arcade" && currentUI?.layer === "pauseMenu")
				return;

			if (isInventoryMenuVisible) hideUI();
			else showUI();
		};

		window.addEventListener("keydown", showInventoryMenu);
		return () => {
			window.removeEventListener("keydown", showInventoryMenu);
		};
	}, [currentUI?.layer, currentUI?.scope, isInventoryMenuVisible]);

	return {
		visible: isInventoryMenuVisible,
		handleExitComplete,
	};
};
