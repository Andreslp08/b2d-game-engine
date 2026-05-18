import { motion, type Variants } from "framer-motion";
import { Button } from "../../../shared/components/button";
import { FramedPanel } from "../../../shared/components/framed-panel";

const backdropVariants: Variants = {
	hidden: {
		opacity: 0,
		backgroundColor: "rgba(0, 0, 0, 0)",
		backdropFilter: "blur(0px)",
	},
	visible: {
		opacity: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		backdropFilter: "blur(10px)",
		transition: {
			duration: 0.3,
			when: "beforeChildren" as const,
			delayChildren: 0.02,
		},
	},
	exit: {
		opacity: 0,
		backgroundColor: "rgba(0, 0, 0, 0)",
		backdropFilter: "blur(0px)",
		transition: {
			duration: 0.3,
			when: "afterChildren" as const,
		},
	},
};

const modalVariants: Variants = {
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
	onResume?: () => void;
	onMainMenu?: () => void;
};

export const PauseMenuLayer = ({ onEnterComplete, onResume, onMainMenu }: PauseMenuLayerProps) => {
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
			>
				<FramedPanel>
					<div className="flex flex-col items-center justify-center xl:w-[500px]">
						<h1 className="modal-title">Paused</h1>
						<div className="grid grid-cols-1 gap-3">
							<Button onClick={onResume} text="Resume" />
							<Button onClick={onMainMenu} text="Main menu" />
						</div>
					</div>
				</FramedPanel>
			</motion.div>
		</motion.div>
	);
};
