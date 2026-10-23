import { useEffect } from "react";
import { useGameStore } from "./store/store";
import { AnimatePresence, motion } from "framer-motion";
import { ArcadeLayer } from "./ui/arcade-layers";
import { GeneralLayer } from "./ui/general-layers";
import { MouseManager } from "@b2d-engine/core/input/mouse-manager";
import { useGamepadUINavigation } from "./ui/shared/hooks/use-gamepad-ui-navigation";
function App() {
	const currentGame = useGameStore((state) => state.currentGame);
	const currentUI = useGameStore((state) => state.currentUI);
	useGamepadUINavigation(
		currentUI ? `${currentUI.scope}:${currentUI.layer}` : null,
	);

	useEffect(() => {
		if (currentGame) {
			MouseManager.setCursorRenderMode("hidden");
		} else {
			MouseManager.setCursorRenderMode("system");
		}
	}, [currentGame]);

	return (
		<>
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
					
						<ArcadeLayer />
					
				)}
			</AnimatePresence>
		</>
	);
}

export default App;
