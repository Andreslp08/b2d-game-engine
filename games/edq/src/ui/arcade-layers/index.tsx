import { AnimatePresence } from "framer-motion";
import { PauseMenuLayer } from "./pause-menu/components/pause-menu";
import { usePauseController } from "./pause-menu/hooks/use-pause-controller";
import { usePauseHotkeys } from "./pause-menu/hooks/use-pause-hotkeys";
import { useGameStore } from "../../store/store";
import { GameOverModal } from "./game-over";
import { useGameOverController } from "./game-over/hooks/use-game-over-controller";
import { InventoryMenu } from "./inventory/components/inventory-menu";
import { useInventoryMenuController } from "./inventory/hooks/use-inventory-menu-controller";
import { useEffect, useRef } from "react";

export const ArcadeLayer = () => {
	const pauseController = usePauseController();
	const gameOverController = useGameOverController();
	const currentUI = useGameStore((state) => state.currentUI);
	const isGameOver = currentUI?.scope === "arcade" && currentUI.layer === "gameOverMenu";
	const isInventory = currentUI?.scope === "arcade" && currentUI.layer === "inventoryMenu";
	const previousUIRef = useRef(currentUI);

	useEffect(() => {
		return () => {
			previousUIRef.current = currentUI;
		};
	}, [currentUI]);

	usePauseHotkeys({
		isPauseMenuVisible: pauseController.isPauseMenuVisible,
		isTransitionLocked: pauseController.isTransitionLocked || isGameOver || isInventory,
		onTogglePauseMenu: pauseController.togglePauseMenu,
		onPauseOnVisibilityLoss: pauseController.pauseOnVisibilityLoss,
		onResumeAfterVisibilityRestore: pauseController.resumeAfterVisibilityRestore,
	});

	const inventoryController = useInventoryMenuController();

	return (
		<div className="w-full h-full flex items-center justify-center">
			<AnimatePresence
				mode="wait"
				onExitComplete={() => {
					if (
						previousUIRef.current?.scope === "arcade" &&
						previousUIRef.current.layer === "inventoryMenu"
					) {
						inventoryController.handleExitComplete();
					}
					if (
						previousUIRef.current?.scope === "arcade" &&
						previousUIRef.current.layer === "pauseMenu"
					) {
						pauseController.handlePauseMenuExitComplete();
					}
				}}
			>
				{pauseController.isPauseMenuVisible && (
					<PauseMenuLayer
						key="pause-menu"
						onEnterComplete={pauseController.handlePauseMenuEnterComplete}
						onResume={pauseController.closePauseMenuAndResume}
						onMainMenu={pauseController.goToMainMenu}
					/>
				)}
				{isGameOver && (
					<GameOverModal
						key="pause-menu"
						onRestart={gameOverController.restart}
						onMainMenu={gameOverController.goToMainMenu}
					/>
				)}
				{inventoryController.visible && (
					<InventoryMenu
						key="inventory-menu"
					/>
				)}
			</AnimatePresence>
		</div>
	);
};
