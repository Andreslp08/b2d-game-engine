import { AnimatePresence } from "framer-motion";
import { PauseMenuLayer } from "./pause-menu/components/pause-menu";
import { usePauseController } from "./pause-menu/hooks/use-pause-controller";
import { usePauseHotkeys } from "./pause-menu/hooks/use-pause-hotkeys";

export const InGameLayer = () => {
	const pauseController = usePauseController();

	usePauseHotkeys({
		isPauseMenuVisible: pauseController.isPauseMenuVisible,
		isTransitionLocked: pauseController.isTransitionLocked,
		onTogglePauseMenu: pauseController.togglePauseMenu,
		onPauseOnVisibilityLoss: pauseController.pauseOnVisibilityLoss,
		onResumeAfterVisibilityRestore: pauseController.resumeAfterVisibilityRestore,
	});

	return (
		<div className="w-full h-full flex items-center justify-center">
			<AnimatePresence
				mode="wait"
				onExitComplete={pauseController.handlePauseMenuExitComplete}
			>
				{pauseController.isPauseMenuVisible && (
					<PauseMenuLayer
						key="pause-menu"
						onEnterComplete={pauseController.handlePauseMenuEnterComplete}
						onResume={pauseController.closePauseMenuAndResume}
						onMainMenu={pauseController.goToMainMenu}
					/>
				)}
			</AnimatePresence>
		</div>
	);
};
