import { Component } from "engine/ecs/component";
import type { Inventory } from "../runtime/inventory";

/** Keyboard binding associated with an item quick slot. */
export const QUICK_SLOT_BINDINGS = [
	{ slot: 0, key: "f" },
	{ slot: 1, key: "1" },
	{ slot: 2, key: "2" },
	{ slot: 3, key: "3" },
	{ slot: 4, key: "4" },
	{ slot: 5, key: "5" },
] as const;

/** Stores references to inventory entries; it never owns item data. */
export class QuickSlotsComponent extends Component {
	private readonly references = new Map<number, string | null>();
	private activeSlot = 0;

	/** Assigns an inventory reference or `null` for an empty-hand slot. */
	set(slot: number, inventoryReferenceId: string | null): void {
		this.references.set(slot, inventoryReferenceId);
	}

	/** Returns the assigned reference, explicit empty hand, or no assignment. */
	get(slot: number): string | null | undefined {
		return this.references.get(slot);
	}

	/** Returns the keyboard binding for the slot containing this inventory entry. */
	getKeyForReference(inventoryReferenceId: string): string | undefined {
		const binding = QUICK_SLOT_BINDINGS.find(
			({ slot }) => this.references.get(slot) === inventoryReferenceId,
		);
		return binding?.key;
	}

	/** Marks the slot most recently selected by the player. */
	setActiveSlot(slot: number): void {
		this.activeSlot = slot;
	}

	/** Returns the key assigned to the most recently selected slot. */
	getActiveKey(): string | undefined {
		return QUICK_SLOT_BINDINGS.find(({ slot }) => slot === this.activeSlot)?.key;
	}

	/** Returns the assignment for the selected slot: null means empty hand. */
	getActiveReference(): string | null | undefined {
		return this.references.get(this.activeSlot);
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
