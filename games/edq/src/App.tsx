import { useEffect } from "react";
import { useGameStore } from "./store/store";
import { AnimatePresence, motion } from "framer-motion";
import { InGameLayer } from "./ui/in-game-layers";
import { GeneralLayer } from "./ui/general-layers";
import { MouseManager } from "engine/input/mouse-manager";
function App() {
	const runningGame = useGameStore((state) => state.runningGame);
	const generalLayer = useGameStore((state) => state.uiLayers.generalLayer);
	const showGeneralLayer = useGameStore((state) => state.uiLayers.generalLayer.setVisible);
	const inGameLayer = useGameStore((state) => state.uiLayers.inGameLayer);
	const showInGameLayer = useGameStore((state) => state.uiLayers.inGameLayer.setVisible);

	useEffect(() => {
		if (runningGame) {
			MouseManager.setCursorRenderMode("hidden");
			showGeneralLayer(false);
			showInGameLayer(true);
		} else {
			MouseManager.setCursorRenderMode("system");
			showGeneralLayer(true);
			showInGameLayer(false);
		}
	}, [runningGame]);

	return (
		<>

		{
			!runningGame && <div className=" fixed top-0 left-0 w-full h-screen">
				<div className="bg-ui-gradient w-full h-full">

				</div>
			</div>
		}
			<AnimatePresence mode="wait">
				{generalLayer.visible && (
					<motion.div
						key="general-layer"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="w-full h-screen bg-ui-gradient flex items-center justify-center"
					>
						<GeneralLayer />
					</motion.div>
				)}

				{inGameLayer.visible && (
					<div
						key="in-game-layer"
						className="w-full h-screen  flex items-center justify-center"
					>
						<InGameLayer />
					</div>
				)}
			</AnimatePresence>
		</>
	);
}

export default App;
