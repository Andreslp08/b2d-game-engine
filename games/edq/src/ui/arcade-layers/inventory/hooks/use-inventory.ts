import { useCallback, useEffect, useState } from "react";
import { GameObject } from "engine/common/entities/game-object";
import { currentGameInstance } from "../../../../game/game";
import { EquipmentComponent } from "../../../../game/items/components/equipment-component";
import type { AnyItemDefinition } from "../../../../game/items/definitions/item-definition";
import { InventoryComponent } from "../../../../game/items/components/inventory-component";
import {
	QUICK_SLOT_BINDINGS,
	QuickSlotsComponent,
} from "../../../../game/items/components/quick-slots-component";
import type { InventoryEntry } from "../../../../game/items/runtime/inventory";
import type { ItemInstance } from "../../../../game/items/runtime/item-instance";

export type InventoryItemView = {
	readonly entryId: string;
	readonly definitionId: string;
	readonly quantity: number;
	readonly definition: AnyItemDefinition;
	readonly instance?: ItemInstance;
	readonly quickSlot?: {
		readonly slot: number;
		readonly key: string;
	};
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
	/** Assigns an inventory item to a quick slot and removes its previous assignment. */
	readonly assignToQuickSlot: (entryId: string, slot: number) => void;
	/** Permanently removes an inventory entry and all its runtime references. */
	readonly removeFromInventory: (entryId: string) => void;
	readonly isReady: boolean;
};

const EMPTY_INVENTORY: InventoryView = {
	uiInventory: {
		items: [],
		treasures: [],
		key_items: [],
	},
	entries: [],
	assignToQuickSlot: () => undefined,
	removeFromInventory: () => undefined,
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

const toItemView = (
	entry: InventoryEntry,
	inventory: InventoryComponent,
	quickSlots?: QuickSlotsComponent,
): InventoryItemView => {
	const quickSlot = QUICK_SLOT_BINDINGS.find(
		({ slot }) => quickSlots?.get(slot) === entry.entryId,
	);

	return {
		entryId: entry.entryId,
		definitionId: entry.definitionId,
		quantity: entry.quantity,
		definition: inventory.inventory.getDefinition(entry.definitionId),
		instance: cloneInstance(entry.instance),
		quickSlot: quickSlot
			? {
					slot: quickSlot.slot,
					key: quickSlot.key,
				}
			: undefined,
	};
};

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
		const quickSlots = player?.getComponent(QuickSlotsComponent);

		const entries = inventoryComponent.inventory
			.getEntries()
			.map((entry) => toItemView(entry, inventoryComponent, quickSlots));
		const equippedReferenceId = equipmentComponent.getEquippedReferenceId();
		const equippedEntry = entries.find((entry) => entry.entryId === equippedReferenceId);

		setView({
			entries,
			equippedReferenceId,
			equippedEntry,
			equippedDefinition: equippedEntry?.definition,
			inventoryComponent,
			equipmentComponent,
			assignToQuickSlot,
			removeFromInventory,
			isReady: true,
			uiInventory: {
				items: getUIInventory(entries, "items"),
				treasures: getUIInventory(entries, "treasures"),
				key_items: getUIInventory(entries, "key_items"),
			},
		});
	}, []);

	const assignToQuickSlot = useCallback(
		(entryId: string, slot: number) => {
			const scene = currentGameInstance.getScene();
			const player = scene?.getEntityByTag<GameObject>("player");
			const inventoryComponent = player?.getComponent(InventoryComponent);
			const quickSlots = player?.getComponent(QuickSlotsComponent);
			const entry = inventoryComponent?.inventory.get(entryId);

			if (!inventoryComponent || !quickSlots || !entry) return;

			const definition = inventoryComponent.inventory.getDefinition(entry.definitionId);
			if (!definition.quickAssignable) return;

			for (const [assignedSlot, referenceId] of quickSlots.getAll()) {
				if (assignedSlot !== slot && referenceId === entryId) {
					quickSlots.clear(assignedSlot);
				}
			}

			quickSlots.set(slot, entryId);
			sync();
		},
		[sync],
	);

	const removeFromInventory = useCallback(
		(entryId: string) => {
			const scene = currentGameInstance.getScene();
			const player = scene?.getEntityByTag<GameObject>("player");
			const inventoryComponent = player?.getComponent(InventoryComponent);
			const equipmentComponent = player?.getComponent(EquipmentComponent);
			const quickSlots = player?.getComponent(QuickSlotsComponent);
			const entry = inventoryComponent?.inventory.get(entryId);

			if (!inventoryComponent || !entry) return;

			if (equipmentComponent?.getEquippedReferenceId() === entry.entryId) {
				equipmentComponent.unequip();
			}
			quickSlots?.clearReference(entry.entryId);

			// Remove the complete stack, or the complete unique instance.
			inventoryComponent.inventory.remove(entry.entryId, entry.quantity);
			sync();
		},
		[sync],
	);

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
