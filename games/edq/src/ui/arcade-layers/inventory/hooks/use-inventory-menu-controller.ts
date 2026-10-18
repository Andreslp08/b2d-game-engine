import { useEffect } from "react";
import { currentGameInstance } from "../../../../game/game";
import { useGameStore } from "../../../../store/store";
import { useEscapeBack } from "../../../shared/hooks/use-escape-back";
import { MouseManager } from "@b2d-engine/core/input/mouse-manager";
import { InputActionPhase } from "@b2d-engine/core/input/input-manager";
import { GameplayAction, InputManagerInstance } from "../../../../game/input/input-manager";
import { InputContextPriority } from "../../../../game/input/context-priority";

export const useInventoryMenuController = () => {
	const currentUI = useGameStore((state) => state.currentUI);
	const setCurrentUI = useGameStore((state) => state.setCurrentUI);
	const clearCurrentUI = useGameStore((state) => state.clearCurrentUI);
	const isInventoryMenuVisible =
		currentUI?.scope === "arcade" && currentUI.layer === "inventoryMenu";

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
		const releaseContext = InputManagerInstance.pushContext({
			id: "arcade-inventory-hotkey",
			priority: InputContextPriority.Menu,
			dispatchMode: "immediate",
			actions: [{ action: GameplayAction.InventoryToggle, phases: [InputActionPhase.Pressed] }],
			onAction: (inputEvent) => {
				if (
					!(inputEvent?.nativeEvent instanceof KeyboardEvent) ||
					(currentUI?.scope === "arcade" && currentUI.layer === "pauseMenu")
				) {
					return;
				}

				inputEvent.nativeEvent.preventDefault();
				if (isInventoryMenuVisible) hideUI();
				else showUI();
			},
		});

		return () => {
			releaseContext();
		};
	}, [currentUI?.layer, currentUI?.scope, isInventoryMenuVisible]);

	return {
		visible: isInventoryMenuVisible,
		handleExitComplete,
	};
};
