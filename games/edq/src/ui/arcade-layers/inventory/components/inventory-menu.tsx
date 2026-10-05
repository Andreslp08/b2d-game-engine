import { motion, type Variants } from "framer-motion";
import { FramedPanel } from "../../../shared/components/framed-panel";
import { useEffect, useMemo, useState } from "react";
import {
	useInventory,
	type InventoryItemView,
	type UIInventoryCategory,
} from "../hooks/use-inventory";
import { CategorySelector } from "./category-selector";
import { EmptyGridCell, Grid, GridCell } from "./grid";
import { ItemCard } from "./item-card";
import { MIN_ITEMS_LENGTH } from "../constants";
import { ItemPreviewInfo } from "./item-preview-info";
import { ItemActionBar } from "./item-action-bar";

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

	useEffect(() => {
		setCurrentItemPreview(null);
	}, [currentCategory]);

	useEffect(() => {
		setCurrentItemPreview((currentItem) =>
			currentItem
				? (inventory.entries.find((item) => item.entryId === currentItem.entryId) ?? null)
				: null,
		);
	}, [inventory.entries]);

	const gridItems = useMemo(() => {
		if (currentItems.length < MIN_ITEMS_LENGTH) {
			const arr = Array.from({ length: MIN_ITEMS_LENGTH });
			return arr.map((_, index) => {
				return currentItems[index];
			});
		}
		return currentItems;
	}, [currentItems]);

	return (
		<motion.div
			key="pause-menu-backdrop"
			variants={backdropVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			className="w-full h-screen flex overflow-x-hidden overflow-y-auto pointer-events-auto"
		>
			<motion.div
				className="w-full p-10 flex flex-col container mx-auto"
				key="pause-menu-modal"
				variants={modalVariants}
			>
				<h1 className="modal-title">Inventory</h1>
				<FramedPanel className="min-h-min! grow">
					<div className="flex flex-col items-center justify-center w-full">
						<CategorySelector
							currentCategory={currentCategory}
							setCurrentCategory={setCurrentCategory}
						/>
						<hr className="mt-5 lg:mt-10 2xl:mt-20" />
						<div className="relative flex w-full max-h-[150px] md:max-h-[300px] lg:max-h-[430px] overflow-auto">
							<Grid>
								{gridItems.map((item: InventoryItemView, i) => {
									return (
										<GridCell key={i}>
											{item?.entryId ? (
												<ItemCard
													isActive={
														item?.entryId ===
														currentItemPreview?.entryId
													}
													inventoryView={inventory}
													item={item}
													onClick={() => setCurrentItemPreview(item)}
												/>
											) : (
												<EmptyGridCell />
											)}
										</GridCell>
									);
								})}
							</Grid>
						</div>
						{/* <hr className="mt-5 lg:mt-10 2xl:mt-20 w-full text-[#ba0000]" /> */}
						<section className="w-full flex flex-col justify-start mt-10">
							{currentItemPreview && (
								<>
									<ItemPreviewInfo item={currentItemPreview} />
									<ItemActionBar
										item={currentItemPreview}
										category={currentCategory}
										onAssignToQuickSlot={inventory.assignToQuickSlot}
										onRemove={inventory.removeFromInventory}
									/>
								</>
							)}
						</section>
					</div>
				</FramedPanel>
			</motion.div>
		</motion.div>
	);
};
