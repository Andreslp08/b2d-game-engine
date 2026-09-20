import { motion } from "framer-motion";
import { GAME_VERSION } from "../../game/config/constants";
import { Logo } from "../shared/components/logo";

export const DefaultMenuHeader = () => {
	return (
		<div className="w-full flex items-center flex-col">
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
		</div>
	);
};
