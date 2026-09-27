import { Component } from "engine/ecs/component";
import { GameEvent } from "engine/common/events/game-event";
import type { Inventory } from "../runtime/inventory";

export interface EquipmentChangedEvent {
	readonly referenceId?: string;
}

/** References the item currently selected/equipped from an inventory. */
export class EquipmentComponent extends Component {
	readonly onChanged = new GameEvent<EquipmentChangedEvent>();

	private equippedReferenceId?: string;

	/** Selects an existing inventory entry without taking ownership of it. */
	equip(inventoryReferenceId: string): void {
		this.equippedReferenceId = inventoryReferenceId;
		this.onChanged.emit({ referenceId: inventoryReferenceId });
	}

	/** Clears the current equipment reference. */
	unequip(): void {
		this.equippedReferenceId = undefined;
		this.onChanged.emit({ referenceId: undefined });
	}

	getEquippedReferenceId(): string | undefined {
		return this.equippedReferenceId;
	}

	/** Clears equipment when its referenced inventory entry was removed. */
	clearIfMissing(inventory: Inventory): void {
		if (this.equippedReferenceId && !inventory.get(this.equippedReferenceId)) this.unequip();
	}
}
