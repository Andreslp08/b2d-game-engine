import { useEffect, useRef, useState } from "react";
import { GameSceneLoader } from "../../game/scene-loader";
import { Button } from "../shared/components/button";
import { Logo } from "../shared/components/logo";
import gsap from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import { GAME_VERSION } from "../../game/config/constants";
import { EnemyCarousel } from "./enemy-carousel";

export const MainMenu = () => {
	const sectionRef = useRef(null);
	const [close, setClose] = useState(false);

	const options = [
		{
			text: "Play",
			onClick: () => {
				setClose(true);
				setTimeout(() => {
					GameSceneLoader.loadByClassName("Level1");
				}, 1200);
			},
		},
		{
			text: "Settings",
		},
		{
			text: "Controls",
		},
		{
			text: "Quit",
			onClick: () => {
				window.location.replace("https://www.andreslp.com.co/projects/edq");
			},
		},
	];

	useEffect(() => {
		gsap.context(() => {
			gsap.fromTo(
				".button-wrapper",
				{ opacity: 0, x: -16 },
				{ opacity: 1, x: 0, duration: 0.3, stagger: 0.2, delay: 0.2 }
			);
		}, sectionRef);
	}, []);

	return (
		<div
			className="relative w-full h-full flex flex-col items-center overflow-hidden"
			ref={sectionRef}
		>
			<div className="w-full flex items-center flex-col">
				<AnimatePresence mode="wait">
					{!close && (
						<motion.div
							key="developer-info"
							initial={{ opacity: 0, y: -30 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -30 }}
							transition={{ duration: 0.8, ease: [0.48, -0.27, 0.8, 0.68] }}
							className="flex flex-col items-center main-menu-footer my-5"
						>
							<p className="text-red-400 uppercase text-[10px] md:text-[12px] lg:text-[14px]">
								{GAME_VERSION}
							</p>
							<p className="text-red-400 uppercase text-[10px] md:text-[12px] lg:text-[14px]">
								powered by b2D game engine
							</p>
						</motion.div>
					)}
				</AnimatePresence>

				<AnimatePresence mode="wait">
					{!close && (
						<motion.div
							key="logo"
							initial={{ opacity: 0, y: -30 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -30 }}
							transition={{ duration: 0.8, ease: [0.48, -0.27, 0.8, 0.68] }}
							className="w-[90%] max-w-[300px] md:max-w-[500px] lg:max-w-[700px] xl:max-w-[800px]"
						>
							<Logo />
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<div className="flex flex-col w-full h-full items-center justify-center">
				<AnimatePresence mode="wait">
					{!close && (
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
										onClick={option.onClick}
										text={option.text}
									/>
								</div>
							))}
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			<div
				key="characters-view"
				className="absolute w-full h-[70%] bg left-0 bottom-0 pointer-events-none flex justify-between items-end z-[-1]"
			>
				<AnimatePresence mode="wait">
					{!close && (
						<>
						
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
							<motion.img
								src="/assets/ui/player.png"
								loading="lazy"
								className=""
							/>
						</motion.div>
							<EnemyCarousel isActive={!close} />
						</>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};
