import { useEffect } from "react";
import { useGameStore } from "./store/store";
import { AnimatePresence, motion } from "framer-motion";
import { ArcadeLayer } from "./ui/arcade-layers";
import { GeneralLayer } from "./ui/general-layers";
import { MouseManager } from "engine/input/mouse-manager";
function App() {
	const currentGame = useGameStore((state) => state.currentGame);
	const currentUI = useGameStore((state) => state.currentUI);

	useEffect(() => {
		if (currentGame) {
			MouseManager.setCursorRenderMode("hidden");
		} else {
			MouseManager.setCursorRenderMode("system");
		}
	}, [currentGame]);

	return (
		<>
			{currentUI?.scope === "global" && <div className=" fixed top-0 left-0 w-full h-screen">
				<div className="bg-ui-gradient w-full h-full">

				</div>
			</div>
			}
			<AnimatePresence mode="wait">
				{currentUI?.scope === "global" && (
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

				{currentGame === "arcade" && (
					<div
						key="arcade-layer"
						className="w-full h-screen  flex items-center justify-center"
					>
						<ArcadeLayer />
					</div>
				)}
			</AnimatePresence>
		</>
	);
}

export default App;
