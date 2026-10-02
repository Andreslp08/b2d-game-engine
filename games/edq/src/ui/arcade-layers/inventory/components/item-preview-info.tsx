import type { InventoryItemView } from "../hooks/use-inventory";

type Props = {
	item: InventoryItemView;
};

export const ItemPreviewInfo = ({ item }: Props) => (
	<div>
		<p className="text-[#FF8383] uppercase">{item.definition.type}</p>
		<p className="text-white uppercase my-3 heading-font-variant text-base md:text-3xl">
			{item.definition.name}
		</p>
		<p className="text-white uppercase">{item.definition.description}</p>
	</div>
);
