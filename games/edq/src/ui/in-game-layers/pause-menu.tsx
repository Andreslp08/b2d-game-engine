import { motion, type Variants } from "framer-motion";
import { useGameStore } from "../../store/store";
import { currentGameInstance } from "../../game/game";

const backdropVariants:Variants = {
	hidden: {
		opacity: 0,
		backgroundColor: "rgba(0, 0, 0, 0)",
	},
	visible: {
		opacity: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		transition: {
			duration: 0.3,
			when: "beforeChildren" as const,
			delayChildren: 0.3,
		},
	},
	exit: {
		opacity: 0,
		backgroundColor: "rgba(0, 0, 0, 0)",
		transition: {
			duration: 0.3,
			when: "afterChildren" as const,
		},
	},
};

const modalVariants:Variants = {
	hidden: {
		opacity: 0,
		y: -24,
		scale: 0.96,
	},
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			duration: 0.35,
			ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
		},
	},
	exit: {
		opacity: 0,
		y: -24,
		scale: 0.96,
		transition: {
			duration: 0.2,
			ease: "easeIn" as const,
		},
	},
};

type PauseMenuLayerProps = {
	onEnterComplete?: () => void;
	onRequestResume?: () => void;
};

export const PauseMenuLayer = ({
	onEnterComplete,
	onRequestResume,
}: PauseMenuLayerProps) => {
	const setVisible = useGameStore((state) => state.uiLayers.inGameLayer.pauseMenu.setVisible);
	const inGameLayer = useGameStore((state) => state.uiLayers.inGameLayer);
	const generalLayer = useGameStore((state) => state.uiLayers.generalLayer);
	const setRunningGame = useGameStore((state) => state.setRunningGame);
	const setPaused = useGameStore((state) => state.setPaused);

	const resumeGame = () => {
		onRequestResume?.();
		setVisible(false);
	};

	const mainMenu = () => {
		setVisible(false);
		inGameLayer.setVisible(false);
		generalLayer.setVisible(true);
		generalLayer.mainMenu.setVisible(true);
		setPaused(false);
		setRunningGame(false);
		currentGameInstance.stop();
	};

	return (
		<motion.div
			key="pause-menu-backdrop"
			variants={backdropVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			className="w-full h-screen flex items-center justify-center"
		>
			<motion.div
				key="pause-menu-modal"
				variants={modalVariants}
				onAnimationComplete={(definition) => {
					if (definition === "visible") {
						onEnterComplete?.();
					}
				}}
				className="w-50 h-50 flex flex-col items-center justify-center bg-black rounded-lg p-4"
			>
				<button onClick={resumeGame} className="text-white">
					Resume
				</button>
				<button onClick={mainMenu} className="text-white">
					Main menu
				</button>
			</motion.div>
		</motion.div>
	);
};
