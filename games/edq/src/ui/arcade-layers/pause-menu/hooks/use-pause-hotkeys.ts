import { useEffect } from "react";

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
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape" || isTransitionLocked) return;
			onTogglePauseMenu();
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isTransitionLocked, onTogglePauseMenu]);

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
