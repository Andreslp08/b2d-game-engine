import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type EnemyCarouselProps = {
	isActive: boolean;
};

const carouselImages = [
	"/assets/ui/enemies/soldier.png",
	"/assets/ui/enemies/spine-enemy.png",
	"/assets/ui/enemies/tail-gunner.png",
];
const durationInSeconds = 2.5;
export const EnemyCarousel = ({ isActive }: EnemyCarouselProps) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		if (!isActive) {
			return;
		}

		const intervalId = window.setInterval(() => {
			setCurrentIndex((previousIndex) => (previousIndex + 1) % carouselImages.length);
		}, durationInSeconds * 1000);

		return () => {
			window.clearInterval(intervalId);
		};
	}, [isActive]);

	return (
		<motion.div
			key="enemy-carousel-shell"
			initial={{ translateX: "100%", opacity: 0 }}
			animate={{ translateX: "20%", opacity: 1 }}
			exit={{
				translateX: "100%",
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
			<AnimatePresence mode="wait">
				<motion.img
					key={carouselImages[currentIndex]}
					initial={{ x: 96, opacity: 0, scale: 0.98 }}
					animate={{ x: 0, opacity: 1, scale: 1 }}
					exit={{ x: -96, opacity: 0, scale: 0.98 }}
					transition={{
						duration: 0.55,
						ease: [0.28, -0.03, 0.16, 1.08],
					}}
					src={carouselImages[currentIndex]}
					loading="lazy"
					className="scale-[1.1]"
				/>
			</AnimatePresence>
		</motion.div>
	);
};
