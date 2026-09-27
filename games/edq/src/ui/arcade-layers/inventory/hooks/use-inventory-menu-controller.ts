import { useEffect } from "react";
import { currentGameInstance } from "../../../../game/game";
import { useGameStore } from "../../../../store/store";
import { useEscapeBack } from "../../../shared/hooks/use-escape-back";

export const useInventoryMenuController = () => {
	const currentUI = useGameStore((state) => state.currentUI);
	const setCurrentUI = useGameStore((state) => state.setCurrentUI);
	const clearCurrentUI = useGameStore((state) => state.clearCurrentUI);
	const isInventoryMenuVisible =
		currentUI?.scope === "arcade" && currentUI.layer === "inventoryMenu";
	const keybind = "i";

	const hideUI = () => {
		clearCurrentUI();
	};

	const showUI = () => {
		setCurrentUI("arcade", "inventoryMenu");
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
			if (
				event.key !== keybind ||
				(currentUI?.scope === "arcade" && currentUI?.layer === "pauseMenu")
			)
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
