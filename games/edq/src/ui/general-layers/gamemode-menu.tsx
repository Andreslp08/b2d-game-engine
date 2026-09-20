import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DefaultMenuHeader } from "./default-menu-header";
import { useEscapeBack } from "../shared/hooks/use-escape-back";
import { useGameStore } from "../../store/store";
import { BackButton } from "../shared/components/back-button";
import { FramedPanel } from "../shared/components/framed-panel";

enum GameModeStatus {
	available = "available",
	comingSoon = "coming soon",
}

export const GameModeMenu = () => {
	const sectionRef = useRef(null);
	const [close, setClose] = useState(false);
	useEscapeBack({
		onBack: () => {
			handleBack();
		},
		enabled: !close,
	});
	const setCurrentUI = useGameStore((state) => state.setCurrentUI);
	const clearCurrentUI = useGameStore((state) => state.clearCurrentUI);
	const onExitCompleteRef = useRef<() => void>(() => {});

	const goToMainMenu = () => {
		clearCurrentUI();
		setCurrentUI("global", "mainMenu");
	};

	const gamemodesData = [
		{
			id: "arcade",
			title: "Arcade",
			description: "Play standalone levels, survive challenges, and improve your skills.",
			gameModeStatus: GameModeStatus.available,
			icon: (
				<svg
					width="124"
					height="124"
					viewBox="0 0 124 124"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M0.836445 0L16.6983 14.9768L6.33984 22.1939L27.8277 40.6453C28.7771 36.2531 30.8295 32.1985 33.7212 28.6636L22.9734 20.0017L29.8814 12.7768L0.836445 0ZM123.73 0.763191L108.752 16.6331L101.536 6.26685L88.4341 21.5203C92.1659 23.9257 95.3517 26.8922 97.7857 30.2874L103.728 22.9082L110.953 29.8159L123.73 0.762672V0.763191ZM64.544 19.7019C46.3484 19.9664 32.0894 32.074 32.0894 46.2383C32.0894 52.9044 35.2092 59.0271 40.4507 63.7564L41.2136 64.4382L41.2464 65.4609L41.8633 81.4365C43.0426 82.1067 45.7011 83.484 49.5913 84.7161V74.1384H54.4464V85.9905C57.0848 86.543 60.0776 86.9534 63.3836 87.0784V76.1277H68.2381V87.0456C71.7023 86.8729 74.7686 86.3884 77.4109 85.7632V74.1387H82.2654V84.3345C85.3385 83.2323 87.415 82.0849 88.4105 81.4856L88.8728 65.656L88.9053 64.6092L89.6846 63.9104C95.054 59.1523 98.1997 53.0073 98.1997 46.263C98.1997 31.94 83.6399 19.7019 65.1445 19.7019H64.5445H64.544ZM44.4527 42.8211C50.5226 42.7444 59.6165 47.6345 59.6165 47.6345C59.6165 53.2901 55.0277 57.8792 49.3718 57.8792C43.7115 57.8792 39.1355 53.2901 39.1355 47.6345C39.2441 44.0809 41.4885 42.858 44.4529 42.8211H44.4527ZM85.8528 42.8211C88.8172 42.858 91.0616 44.0809 91.1702 47.6345C91.1702 53.2901 86.5892 57.8792 80.9334 57.8792C75.2777 57.8792 70.689 53.2901 70.689 47.6345C70.689 47.6345 79.7829 42.7444 85.8528 42.8211ZM65.1365 55.3548L70.4212 67.1494H59.8513L65.1362 55.3545L65.1365 55.3548ZM93.4024 76.7361L93.2236 82.9549L93.1912 84.1802L92.1765 84.8784C92.1765 84.8784 89.197 86.9228 83.9124 88.8154L90.2522 94.2549L81.3635 103.542L122.958 123.73L98.3291 100.716L111.65 91.4297L93.4018 76.7366L93.4024 76.7361ZM20.189 81.3069L0 122.886L23.0139 98.2647L32.3006 111.585L49.8503 89.7981C42.5353 87.7257 38.1775 84.9192 38.1775 84.9192L37.114 84.2376L37.0652 82.9793L37.0085 81.4129L29.4753 90.18L20.1887 81.3072L20.189 81.3069Z"
						fill="#27171B"
					/>
				</svg>
			),
			onClick: () => {
				setClose(true);
				onExitCompleteRef.current = () => {
					clearCurrentUI();
					setCurrentUI("global", "levelsMenu");
				};
			},
		},
		{
			id: "story",
			title: "Story",
			description: "Follow Smoke’s journey through a world consumed by chaos and ash.",
			gameModeStatus: GameModeStatus.comingSoon,
			icon: (
				<svg
					width="102"
					height="123"
					viewBox="0 0 102 123"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M53.6494 0C66.2324 18.5743 48.8575 37.8104 37.114 15.3179C44.2043 52.8545 20.1721 58.5291 17.6965 34.7353C-1.41027 51.6349 2.27736 72.965 12.3874 89.4809L24.2961 82.6377C21.1779 77.8793 19.6217 71.5971 20.3191 65.4365C26.992 75.6791 48.0764 68.057 45.5486 49.8667C48.3268 58.1984 55.3683 57.3921 62.636 44.5415C52.7506 71.2236 68.3054 88.5307 78.7173 80.5434C79.0992 83.6528 77.951 87.2083 75.9659 90.4309L88.1665 93.6858C102.485 81.3461 108.872 58.3654 87.1763 48.0891C97.3279 63.7992 83.7734 75.3811 71.4033 58.8611C61.3904 40.1234 92.7992 29.4052 53.6502 0H53.6494ZM25.6846 6.41257C9.02634 14.8116 21.8811 22.131 22.0401 30.4004C33.5015 20.2864 21.0732 16.5011 25.6846 6.41257ZM45.0293 76.3139L0 102.201C0.703965 106.978 2.3327 111.142 4.88697 114.8L28.7854 103.354L8.34497 118.907C9.22558 119.785 10.1719 120.627 11.1863 121.44L30.5952 110.287C30.5892 110.095 30.5796 109.903 30.5796 109.71C30.5796 100.041 38.5012 92.1602 48.1943 92.1602C50.8425 92.1573 53.457 92.7538 55.8418 93.905C55.2384 90.4205 53.9507 86.8643 52.0181 83.7014L27.3564 94.1243L48.7793 79.4561C47.6519 78.2741 46.3983 77.2117 45.0288 76.3145L45.0293 76.3139ZM60.3228 91.2827C60.741 93.1395 60.9982 95.0012 61.0935 96.8188L61.1507 97.8418C64.0418 100.97 65.8101 105.139 65.8101 109.71C65.8102 111.679 65.4752 113.633 64.8196 115.489L88.5479 121.822C89.7537 120.178 90.7787 118.505 91.6245 116.789L75.2183 110.376L93.4343 112.154C93.6593 111.388 93.8525 110.615 94.011 109.832L68.7974 100.943L94.5547 104.961C94.5952 103.462 94.5279 101.93 94.3435 100.358L60.3228 91.2835V91.2827ZM48.1943 97.0136C41.1131 97.0136 35.4336 102.677 35.4336 109.71C35.4336 116.744 41.1131 122.406 48.1946 122.406C55.2766 122.406 60.9558 116.744 60.9558 109.71C60.9558 102.677 55.2766 97.0142 48.1948 97.0142L48.1943 97.0136ZM46.9121 100.074C58.2841 100.074 62.0915 118.672 46.9121 118.672C53.8276 112.668 54.6557 106.492 46.9121 100.074V100.074ZM46.9607 102.631C41.3456 107.285 41.9462 111.769 46.9607 116.123C35.9531 116.123 38.7144 102.631 46.9607 102.631Z"
						fill="#27171B"
					/>
				</svg>
			),
		},
	];

	const handleBack = () => {
		onExitCompleteRef.current = () => goToMainMenu();
		setClose(true);
	};

	return (
		<div
			className="relative w-full h-full flex flex-col items-center overflow-hidden"
			ref={sectionRef}
		>
			<AnimatePresence
				mode="wait"
				onExitComplete={() => {
					if (onExitCompleteRef.current) {
						onExitCompleteRef.current();
					}
				}}
			>
				{!close && (
					<div className="relative w-full h-full flex flex-col min-h-0 overflow-auto">
						<DefaultMenuHeader />
						<div className="general-menu-content !h-auto flex-1 min-h-0 flex flex-col">
							<BackButton onClick={handleBack} text="Play" />

							<motion.div
								key="gamemodes"
								initial={{ opacity: 0, y: -30 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 30 }}
								transition={{ duration: 0.3 }}
								className="container mx-auto mt-10 flex flex-col lg:flex-row items-center lg:justify-center gap-10"
							>
								{gamemodesData.map((gameMode) => {
									const isComingSoon =
										gameMode.gameModeStatus === GameModeStatus.comingSoon;
									return (
										<button
											key={gameMode.id}
											className={`${isComingSoon ? "cursor-not-allowed hover:grayscale " : ""} relative max-w-[400px] flex justify-center group transition-all duration-300 hover:shadow-[0_0_5px_5px_rgba(255,0,0,0.5)]`}
											onClick={gameMode.onClick}
											disabled={isComingSoon}
										>
											{isComingSoon && (
												<p className="absolute top-0 translate-y-[-40%] z-20 p-3 rounded-full bg-[#FFDA56] text-black uppercase">
													Coming soon
												</p>
											)}
											<FramedPanel contentClassName="flex flex-col items-center gap-8">
												<p className="heading-font-variant uppercase text-2xl md:text-3xl lg:text-5xl transition-colors duration-300 group-hover:text-red-400">
													{gameMode.title}
												</p>
												<div className="transition duration-300 ease-in-out group-hover:scale-[1.2]">
													{gameMode.icon}
												</div>
												<p>{gameMode.description}</p>
											</FramedPanel>
										</button>
									);
								})}
							</motion.div>
						</div>
					</div>
				)}
			</AnimatePresence>
		</div>
	);
};
