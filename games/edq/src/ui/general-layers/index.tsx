import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "../../store/store";
import { GENERAL_VIEWS_ROUTER } from "./router";
export const GeneralLayer = () => {
	const currentUI = useGameStore((state) => state.currentUI);
	const activeLayer = currentUI?.scope === "global" ? currentUI.layer : null;
	const ActiveView = activeLayer ? GENERAL_VIEWS_ROUTER[activeLayer] : null;

	return (
		<motion.div
			key="general-layer"
			initial={{ opacity: 1 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3 }}
			className="w-full h-screen flex items-center justify-center"
		>
			<AnimatePresence mode="popLayout">
				{activeLayer && (
					<motion.div
						key={activeLayer}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="flex justify-center items-center w-full h-full  text-white"
					>
						<ActiveView />
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
};
