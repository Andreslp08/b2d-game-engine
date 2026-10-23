import { useEffect } from "react";
import { InputActionPhase } from "@b2d-engine/core/input/input-manager";
import { GameplayAction, InputManagerInstance } from "../../../../game/input/input-manager";
import { InputContextPriority } from "../../../../game/input/context-priority";

type UsePauseHotkeysOptions = {
	isPauseMenuVisible: boolean;
	isTransitionLocked: boolean;
	onTogglePauseMenu: () => void;
	onPauseOnVisibilityLoss: () => void;
	onResumeAfterVisibilityRestore: () => void;
};

export const usePauseHotkeys = ({
	isPauseMenuVisible,
	isTransitionLocked,
	onTogglePauseMenu,
	onPauseOnVisibilityLoss,
	onResumeAfterVisibilityRestore,
}: UsePauseHotkeysOptions) => {
	useEffect(() => {
		const releaseContext = InputManagerInstance.pushContext({
			id: "arcade-pause-hotkey",
			priority: InputContextPriority.Menu,
			dispatchMode: "immediate",
			actions: [
				{ action: GameplayAction.Back, phases: [InputActionPhase.Pressed] },
				{ action: GameplayAction.Pause, phases: [InputActionPhase.Pressed] },
			],
			onAction: (inputEvent) => {
				if (isTransitionLocked) return;
				if (
					inputEvent.action === GameplayAction.Pause ||
					inputEvent.device === "keyboard" ||
					isPauseMenuVisible
				) {
					onTogglePauseMenu();
				}
			},
		});

		return () => {
			releaseContext();
		};
	}, [isPauseMenuVisible, isTransitionLocked, onTogglePauseMenu]);

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.hidden) {
				if (isTransitionLocked) return;
				onPauseOnVisibilityLoss();
				return;
			}

			if (isTransitionLocked || !isPauseMenuVisible) return;
			onResumeAfterVisibilityRestore();
		};

		window.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			window.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [
		isPauseMenuVisible,
		isTransitionLocked,
		onPauseOnVisibilityLoss,
		onResumeAfterVisibilityRestore,
	]);
};
