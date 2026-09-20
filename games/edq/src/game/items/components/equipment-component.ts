import { Component } from "engine/ecs/component";
import type { Inventory } from "../runtime/inventory";

/** References the item currently selected/equipped from an inventory. */
export class EquipmentComponent extends Component {
	private equippedReferenceId?: string;

	/** Selects an existing inventory entry without taking ownership of it. */
	equip(inventoryReferenceId: string): void {
		this.equippedReferenceId = inventoryReferenceId;
	}

	/** Clears the current equipment reference. */
	unequip(): void {
		this.equippedReferenceId = undefined;
	}

	getEquippedReferenceId(): string | undefined {
		return this.equippedReferenceId;
	}

	/** Clears equipment when its referenced inventory entry was removed. */
	clearIfMissing(inventory: Inventory): void {
		if (this.equippedReferenceId && !inventory.get(this.equippedReferenceId)) this.unequip();
	}
}
