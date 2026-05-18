import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "../../store/store";
import { LoadingScreen } from "./loading-screen";
import { MainMenu } from "./main-menu";
export const GeneralLayer = () => {
	const currentUI = useGameStore((state) => state.currentUI);
	const activeLayer = currentUI?.scope === "global" ? currentUI.layer : null;

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
				{activeLayer === "loadingScreen" && (
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

				{activeLayer === "mainMenu" && (
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
