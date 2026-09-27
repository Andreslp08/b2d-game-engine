import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import type { InventoryItemView, InventoryView } from "../hooks/use-inventory";
import { getProjectileDefinition } from "../../../../game/items/item-catalog";
import type { AmmoDefinition } from "../../../../game/items/definitions/item-definition";
import { useMemo } from "react";

type Props = {
    isActive:boolean,
	inventoryView: InventoryView;
	item: InventoryItemView;
	onClick?: () => void;
};
export const ItemCard = ({  isActive,inventoryView, item, onClick }: Props) => {
	const isWeapon = item.definition.type === "weapon";
	const isConsumable = item.definition.type === "consumable";
    const isAmmo = item.definition.type === "ammo";
	const imageUrl = useMemo(()=>{
            if(isAmmo){
                const projectileDefinition = getProjectileDefinition(item.definition.projectileId)
                return AssetsManager.getImageByName(projectileDefinition.image)?.path ?? ""
            }
         return AssetsManager.getImageByName(item.definition.icon)?.path ?? ""

    },[item, isWeapon, isConsumable, isAmmo]);

	const currentWeaponAmmo = () => {
		if (item.definition.type !== "weapon") return null;

		const inventory = inventoryView.inventoryComponent?.inventory;
        const currentAmmo = item.instance?.state?.currentAmmo ?? 0;
		// const magazineAmmo = item.definition.magazineSize ?? 0;
		// const reserveAmmo = inventory?.countAmmo(item.definition.ammoId) ?? 0;
		// const totalAmmo = magazineAmmo + reserveAmmo;

		const ammoDefinition = inventory.getDefinition(item.definition.ammoId) as AmmoDefinition;
		const projectileDefinition = getProjectileDefinition(ammoDefinition.projectileId);
		const projectileImg = AssetsManager.getImageByName(projectileDefinition.image);

		return (
			<div className="flex items-center gap-2">
				<img
					src={projectileImg.path}
					alt={ammoDefinition.name}
					className="w-[20px] h-[20px] object-contain object-center -rotate-90"
				/>
				<p className="text-white">
					{currentAmmo}
				</p>
			</div>
		);
	};

	const currentQuantity = () => {
		return <p className="text-white">x{item.quantity}</p>;
	};
	return (
		<button
			className={`w-full p-2 transition-all duration-300 rounded-md border-3 border-[rgba(255,255,255,0.07)]  ${isActive ? "bg-[rgba(255,255,255,0.5)]  border-b-[#f00]" : "bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.17)] "}`}
			onClick={onClick}
		>
			<img
				src={imageUrl}
				alt={item.definition.name}
				className="w-[80%] max-w-[200px] mx-auto aspect-[366/124] object-contain "
			/>
			<div className="w-full flex items-center justify-between mt-2">
				{isWeapon && currentWeaponAmmo()}
				{isConsumable && currentQuantity()}
				{isAmmo && currentQuantity()}
			</div>
		</button>
	);
};
