import { useEffect, useRef, useState } from "react";
import { Button } from "../shared/components/button";
import gsap from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import { EnemyCarousel } from "./enemy-carousel";
import { useGameStore } from "../../store/store";
import { DefaultMenuHeader } from "./default-menu-header";

export const MainMenu = () => {
	const sectionRef = useRef(null);
	const [close, setClose] = useState(false);
	const setCurrentUI = useGameStore((state) => state.setCurrentUI);
	const clearCurrentGame = useGameStore((state) => state.clearCurrentGame);
	const currentTriggeredOption = useRef<(() => void) | null>(null);

	const options = [
		{
			id: "play",
			text: "Play",
			waitForExitAnimation: true,
			onClick: () => {
				clearCurrentGame();
				setCurrentUI("global", "gameModeMenu");
			},
		},
		{
			id: "player",
			text: "Player",
			waitForExitAnimation: true,
			onClick: () => {
				clearCurrentGame();
				setCurrentUI("global", "customPlayerMenu");
			},
		},
		{
			id: "settings",
			text: "Settings",
			onClick: () => {
				clearCurrentGame();
				setCurrentUI("global", "settingsMenu");
			},
		},
		{
			id: "quit",
			text: "Quit",
			onClick: () => {
				window.location.replace("https://www.andreslp.com.co/projects/bound-to-red-skies");
			},
		},
	];

	const executeQueuedOption = () => {
		if (currentTriggeredOption.current) currentTriggeredOption.current();
	};

	const handleOptionClick = (option: (typeof options)[number]) => {
		if (!option.onClick || close) return;

		if (!option.waitForExitAnimation) {
			option.onClick();
			return;
		}

		currentTriggeredOption.current = option.onClick;
		setClose(true);
	};

	useEffect(() => {
		gsap.context(() => {
			gsap.fromTo(
				".button-wrapper",
				{ opacity: 0, x: -16 },
				{ opacity: 1, x: 0, duration: 0.3, stagger: 0.2, delay: 0.2 },
			);
		}, sectionRef);
	}, []);

	return (
		<div
			className="relative w-full h-full flex flex-col items-center overflow-hidden"
			ref={sectionRef}
		>
			<AnimatePresence mode="wait" onExitComplete={executeQueuedOption}>
				{!close && (
					<motion.div key="main-menu-content" className="relative w-full h-full overflow-y-auto  lg:overflow-y-hidden overflow-x-hidden">
						<DefaultMenuHeader />
						<div className="flex flex-col w-full h-full items-center justify-center">
							<motion.div
								key="buttons"
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{ duration: 0.8, ease: [0.48, -0.27, 0.8, 0.68] }}
								className="flex flex-col"
							>
								{options.map((option, index) => (
									<div key={index} className="button-wrapper grid grid-cols-1">
										<Button
											key={index}
											onClick={() => handleOptionClick(option)}
											text={option.text}
										/>
									</div>
								))}
							</motion.div>
						</div>

						<div
							key="characters-view"
							className="absolute w-full h-[70%] bg left-0 bottom-0 pointer-events-none flex justify-between items-end z-[-1]"
						>
							<motion.div
								key="player-vs-solider"
								initial={{ translateX: "-100%", opacity: 0 }}
								animate={{ translateX: "0", opacity: 1 }}
								exit={{
									translateX: "-100%",
									opacity: 0,
									transition: {
										duration: 1.2,
										ease: [0.48, -0.27, 1, 0.68],
									},
								}}
								transition={{
									duration: 1.2,
									ease: [0.28, -0.03, 0.16, 1.38],
								}}
								className="aspect-[0.61] w-[600px]"
							>
								<img
									src="/assets/ui/player.png"
									className=""
								/>
							</motion.div>
							<EnemyCarousel isActive={!close} />
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
