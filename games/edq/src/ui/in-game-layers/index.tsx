

import { motion } from "framer-motion";
// import { useGameStore } from "../../store/store";
export const InGameLayer = ()=>{
    return (
        <motion.div
			key="in-game-layer"
			// initial={{ opacity: 0 }}
			// animate={{ opacity: 1 }}
			// exit={{ opacity: 0 }}
			// transition={{ duration: 0.3 }}
			className="w-full h-full flex items-center justify-center"
		>
			{/* <div>In-game Layer</div> */}
			
		</motion.div>
    )
}