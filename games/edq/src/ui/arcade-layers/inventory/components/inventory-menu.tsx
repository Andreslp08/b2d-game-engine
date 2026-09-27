import { motion, type Variants } from "framer-motion";
import { Button } from "../../../shared/components/button";
import { FramedPanel } from "../../../shared/components/framed-panel";
import { useEffect, useMemo, useState } from "react";
import {
	useInventory,
	type InventoryItemView,
	type UIInventoryCategory,
} from "../hooks/use-inventory";
import { CategorySelector } from "./category-selector";
import { Grid, GridCell } from "./grid";
import { ItemCard } from "./item-card";

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

export const InventoryMenu = () => {
	const inventory = useInventory();
	const [currentCategory, setCurrentCategory] = useState<UIInventoryCategory>("items");
	const currentItems = useMemo(() => {
		const items = Array.isArray(inventory.uiInventory[currentCategory])
			? inventory.uiInventory[currentCategory]
			: [];
		return items;
	}, [inventory.uiInventory, currentCategory]);

	const [currentItemPreview, setCurrentItemPreview] = useState<InventoryItemView | null>(null);

	console.log("Inventory", inventory);

	useEffect(()=>{
		setCurrentItemPreview(null);
	},[currentCategory])

	return (
		<motion.div
			key="pause-menu-backdrop"
			variants={backdropVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			className="w-full h-screen flex overflow-hidden"
		>
			<motion.div
				className="w-full p-10 flex flex-col container mx-auto"
				key="pause-menu-modal"
				variants={modalVariants}
			>
				<h1 className="modal-title">Inventory</h1>
				<FramedPanel>
					<div className="flex flex-col items-center justify-center w-full">
						<CategorySelector
							currentCategory={currentCategory}
							setCurrentCategory={setCurrentCategory}
						/>
						<hr className="mt-5 lg:mt-10 2xl:mt-20" />
						<Grid>
							{currentItems.map((item: InventoryItemView, i) => {
								return (
									<GridCell key={i}>
										<ItemCard
											isActive={item?.entryId === currentItemPreview?.entryId}
											inventoryView={inventory}
											item={item}
											onClick={() => setCurrentItemPreview(item)}
										/>
									</GridCell>
								);
							})}
						</Grid>
					</div>
				</FramedPanel>
			</motion.div>
		</motion.div>
	);
};
