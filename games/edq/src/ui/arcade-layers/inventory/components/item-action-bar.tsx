import type { InventoryItemView, UIInventoryCategory } from "../hooks/use-inventory";
import { QUICK_SLOT_BINDINGS } from "../../../../game/items/components/quick-slots-component";

type Props = {
	item: InventoryItemView;
	category: UIInventoryCategory;
	onAssignToQuickSlot: (entryId: string, slot: number) => void;
	onRemove: (entryId: string) => void;
	onUse?: (item: InventoryItemView) => void;
};

const actionButtonClassName =
	"transition-color duration-300 text-white uppercase font-black lg:text-2xl [&:is(button:hover)]:text-[#FF8383]";

export const ItemActionBar = ({
	item,
	category,
	onAssignToQuickSlot,
	onRemove,
	onUse,
}: Props) => {
	const canEquip = item.definition.quickAssignable && category === "items";
	const canUse = category === "key_items";

	return (
		<div className="mt-10 flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:justify-between">
			<div>
				{canEquip && (
					<div className="flex flex-wrap items-center gap-3">
						<p className={actionButtonClassName}>Equip</p>
						<div className="flex gap-3">
							{QUICK_SLOT_BINDINGS.filter(({ slot }) => slot !== 0).map(
								({ key, slot }) => {
									const isActiveSlot = item.quickSlot?.slot === slot;
									return (
										<button
											key={key}
											className={`${isActiveSlot ? "bg-white text-[#ba0000]" : "bg-[#ba0000] text-white"} rounded-full w-7 h-7 flex items-center justify-center text-center`}
											onClick={() => onAssignToQuickSlot(item.entryId, slot)}
											type="button"
										>
											{key}
										</button>
									);
								},
							)
							}
						</div>
					</div>
				)}
				{canUse && (
					<button className={actionButtonClassName} onClick={() => onUse?.(item)} type="button">
						Use
					</button>
				)}
			</div>

			{category === "items" && (
				<button className={actionButtonClassName} onClick={() => onRemove(item.entryId)} type="button">
					Remove
				</button>
			)}
		</div>
	);
};
