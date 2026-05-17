import { AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/store";
import { useEffect, useRef } from "react";
import { Engine } from "engine";
import { PauseMenuLayer } from "./pause-menu";
import { MouseManager } from "engine/input/mouse-manager";
export const InGameLayer = () => {
	const ui = useGameStore((state) => state.uiLayers.inGameLayer);
	const pauseMenu = ui.pauseMenu;
	const setPaused = useGameStore((state) => state.setPaused);
	const pendingResumeRef = useRef(false);
	const transitionLockRef = useRef(false);
	const autoPausedByVisibilityRef = useRef(false);

	const openPauseMenu = () => {
		if (pauseMenu.visible || transitionLockRef.current) return;
		transitionLockRef.current = true;
		MouseManager.setCursorRenderMode("system");
		setPaused(true);
		pauseMenu.setVisible(true);
	};

	const closePauseMenuAndResume = () => {
		if (!pauseMenu.visible || transitionLockRef.current) return;
		transitionLockRef.current = true;
		MouseManager.setCursorRenderMode("custom");
		pendingResumeRef.current = true;
		pauseMenu.setVisible(false);
	};

	const pauseGameListener = (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			if (pauseMenu.visible) {
				autoPausedByVisibilityRef.current = false;
				closePauseMenuAndResume();
			} else {
				openPauseMenu();
			}
		}
	};

	const pauseGameOnLeave = () => {
		if (document.hidden) {
			if (!pauseMenu.visible && !Engine.isPaused) {
				autoPausedByVisibilityRef.current = true;
				openPauseMenu();
			}
			return;
		}

		if (autoPausedByVisibilityRef.current && pauseMenu.visible) {
			autoPausedByVisibilityRef.current = false;
			closePauseMenuAndResume();
		}
	};

	useEffect(() => {
		window.addEventListener("keydown", pauseGameListener);
	
		return () => {
			window.removeEventListener("keydown", pauseGameListener);
	
		};
	}, [pauseMenu.visible]);

	useEffect(() => {
	
		window.addEventListener("visibilitychange", pauseGameOnLeave);
		return () => {
		
			window.removeEventListener("visibilitychange", pauseGameOnLeave);
		};
	}, [pauseMenu.visible]);

	return (
		<div className="w-full h-full flex items-center justify-center">
			<AnimatePresence
				mode="wait"
				onExitComplete={() => {
					if (pendingResumeRef.current) {
						pendingResumeRef.current = false;
						transitionLockRef.current = false;
						setPaused(false);
					}
				}}
			>
				{pauseMenu.visible && (
					<PauseMenuLayer
						key="pause-menu"
						onEnterComplete={() => {
							transitionLockRef.current = false;
						}}
						onRequestResume={() => {
							autoPausedByVisibilityRef.current = false;
							MouseManager.setCursorRenderMode("custom");
							pendingResumeRef.current = true;
							transitionLockRef.current = true;
						}}
					/>
				)}
			</AnimatePresence>
		</div>
	);
};
