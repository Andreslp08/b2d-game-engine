import { Component } from "engine/ecs/component";
import type { Inventory } from "../runtime/inventory";

/** Stores references to inventory entries; it never owns item data. */
export class QuickSlotsComponent extends Component {
	private readonly references = new Map<number, string | null>();

	/** Assigns an inventory reference or `null` for an empty-hand slot. */
	set(slot: number, inventoryReferenceId: string | null): void {
		this.references.set(slot, inventoryReferenceId);
	}

	/** Returns the assigned reference, explicit empty hand, or no assignment. */
	get(slot: number): string | null | undefined {
		return this.references.get(slot);
	}

	clear(slot: number): void {
		this.references.delete(slot);
	}

	clearReference(inventoryReferenceId: string): void {
		for (const [slot, referenceId] of this.references) {
			if (referenceId === inventoryReferenceId) this.references.delete(slot);
		}
	}

	/** Removes references whose inventory entries no longer exist. */
	removeInvalidReferences(inventory: Inventory): void {
		for (const [slot, referenceId] of this.references) {
			if (referenceId !== null && !inventory.get(referenceId)) this.references.delete(slot);
		}
	}

	getAll(): ReadonlyMap<number, string | null> {
		return new Map(this.references);
	}
}
