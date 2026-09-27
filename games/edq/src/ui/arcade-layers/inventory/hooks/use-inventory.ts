import { useCallback, useEffect, useMemo, useState } from "react";
import { GameObject } from "engine/common/entities/game-object";
import { currentGameInstance } from "../../../../game/game";
import { EquipmentComponent } from "../../../../game/items/components/equipment-component";
import type { AnyItemDefinition } from "../../../../game/items/definitions/item-definition";
import { InventoryComponent } from "../../../../game/items/components/inventory-component";
import type { InventoryEntry } from "../../../../game/items/runtime/inventory";
import type { ItemInstance } from "../../../../game/items/runtime/item-instance";

export type InventoryItemView = {
	readonly entryId: string;
	readonly definitionId: string;
	readonly quantity: number;
	readonly definition: AnyItemDefinition;
	readonly instance?: ItemInstance;
};

export type UIInventoryCategory = "items" | "treasures" | "key_items";

export type UIInventory = Record<UIInventoryCategory, InventoryItemView[]>;

export type InventoryView = {
	readonly entries: readonly InventoryItemView[];
	readonly uiInventory: UIInventory;
	readonly equippedReferenceId?: string;
	readonly equippedEntry?: InventoryItemView;
	readonly equippedDefinition?: AnyItemDefinition;
	/** Runtime component used for inventory mutations and utility methods. */
	readonly inventoryComponent?: InventoryComponent;
	/** Runtime component used to equip or unequip inventory entries. */
	readonly equipmentComponent?: EquipmentComponent;
	readonly isReady: boolean;
};

const EMPTY_INVENTORY: InventoryView = {
	uiInventory: {
		items: [],
		treasures: [],
		key_items: [],
	},
	entries: [],
	isReady: false,
};

const cloneInstance = (instance?: ItemInstance): ItemInstance | undefined => {
	if (!instance) return undefined;

	return {
		...instance,
		state: instance.state
			? {
					...instance.state,
					upgrades: [...instance.state.upgrades],
					attachments: [...instance.state.attachments],
				}
			: undefined,
	};
};

const toItemView = (entry: InventoryEntry, inventory: InventoryComponent): InventoryItemView => ({
	entryId: entry.entryId,
	definitionId: entry.definitionId,
	quantity: entry.quantity,
	definition: inventory.inventory.getDefinition(entry.definitionId),
	instance: cloneInstance(entry.instance),
});

/**
 * Provides a React snapshot of the player's inventory and equipment.
 * It updates only when the runtime inventory or equipment emits a change.
 */
export const useInventory = (): InventoryView => {
	const [view, setView] = useState<InventoryView>(EMPTY_INVENTORY);

	const getInventoryCategory = (type: AnyItemDefinition["type"]): UIInventoryCategory => {
		switch (type) {
			case "treasure":
				return "treasures";

			case "key_item":
				return "key_items";

			case "weapon":
			case "ammo":
			case "consumable":
			case "throwable":
			case "material":
				return "items";
		}
	};

	const getUIInventory = (entries: InventoryItemView[], category: UIInventoryCategory) => {
		return entries.filter((entry) => getInventoryCategory(entry.definition.type) === category);
	};

	const sync = useCallback(() => {
		const scene = currentGameInstance.getScene();
		const player = scene?.getEntityByTag<GameObject>("player");
		const inventoryComponent = player?.getComponent(InventoryComponent);
		const equipmentComponent = player?.getComponent(EquipmentComponent);

		if (!inventoryComponent || !equipmentComponent) {
			setView(EMPTY_INVENTORY);
			return;
		}

		const entries = inventoryComponent.inventory
			.getEntries()
			.map((entry) => toItemView(entry, inventoryComponent));
		const equippedReferenceId = equipmentComponent.getEquippedReferenceId();
		const equippedEntry = entries.find((entry) => entry.entryId === equippedReferenceId);

		setView({
			entries,
			equippedReferenceId,
			equippedEntry,
			equippedDefinition: equippedEntry?.definition,
			inventoryComponent,
			equipmentComponent,
			isReady: true,
			uiInventory: {
				items: getUIInventory(entries, "items"),
				treasures: getUIInventory(entries, "treasures"),
				key_items: getUIInventory(entries, "key_items"),
			},
		});
	}, []);

	useEffect(() => {
		const scene = currentGameInstance.getScene();
		const player = scene?.getEntityByTag<GameObject>("player");
		const inventoryComponent = player?.getComponent(InventoryComponent);
		const equipmentComponent = player?.getComponent(EquipmentComponent);

		if (!inventoryComponent || !equipmentComponent) {
			sync();
			return;
		}

		sync();
		const unsubscribeInventory = inventoryComponent.inventory.onChanged.subscribe(sync);
		const unsubscribeEquipment = equipmentComponent.onChanged.subscribe(sync);

		return () => {
			unsubscribeInventory();
			unsubscribeEquipment();
		};
	}, [sync]);

	return view;
};
