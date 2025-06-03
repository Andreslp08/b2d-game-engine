import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "../../store/store";
import { useEffect } from "react";
import { LoadingScreen } from "./loading-screen";
import { MainMenu } from "./main-menu";
export const GeneralLayer = () => {
	const loadingGame = useGameStore((state) => state.loadingGame);
	const showLoadingScreen = useGameStore(
		(state) => state.uiLayers.generalLayer.loadingScreen.setVisible
	);
	const showMainMenu = useGameStore((state) => state.uiLayers.generalLayer.mainMenu.setVisible);
	const ui = useGameStore((state) => state.uiLayers.generalLayer);

	useEffect(() => {
		showLoadingScreen(loadingGame);
	}, [loadingGame]);

	useEffect(() => {
		if (!ui.loadingScreen.visible && !ui.loadingScreen.visible) {
			showMainMenu(true);
		} else {
			showMainMenu(false);
		}
	}, [loadingGame, ui.loadingScreen.visible]);

	return (
		<motion.div
			key="general-layer"
			initial={{ opacity: 1 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			className="w-full h-screen flex items-center justify-center"
		>
			<AnimatePresence mode="wait">
				{ui.loadingScreen.visible && (
					<motion.div
						key="loading"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="flex justify-center items-center w-full h-full  text-white"
					>
						<LoadingScreen />
					</motion.div>
				)}

				{ui.mainMenu.visible && !ui.loadingScreen.visible && (
					<motion.div
						key="menu"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="flex justify-center items-center w-full h-full"
					>
						<MainMenu />
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};
