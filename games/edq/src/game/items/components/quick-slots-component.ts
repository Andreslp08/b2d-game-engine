import { Component } from "@b2d-engine/core/ecs/component";
import { PhysicalKey } from "@b2d-engine/core/input/keyboard-manager";
import type { Inventory } from "../runtime/inventory";

/** Keyboard binding associated with an item quick slot. */
export const QUICK_SLOT_BINDINGS = [
	{ slot: 0, code: PhysicalKey.F, label: "F" },
	{ slot: 1, code: PhysicalKey.Digit1, label: "1" },
	{ slot: 2, code: PhysicalKey.Digit2, label: "2" },
	{ slot: 3, code: PhysicalKey.Digit3, label: "3" },
	{ slot: 4, code: PhysicalKey.Digit4, label: "4" },
	{ slot: 5, code: PhysicalKey.Digit5, label: "5" },
] as const;

/** Stores references to inventory entries; it never owns item data. */
export class QuickSlotsComponent extends Component {
	private readonly references = new Map<number, string | null>();
	private activeSlot = 0;

	/** Assigns an inventory reference or `null` for an empty-hand slot. */
	set(slot: number, inventoryReferenceId: string | null): void {
		this.references.set(slot, inventoryReferenceId);
	}

	assignFirstAvailable(inventoryReferenceId: string): boolean {
		if (Array.from(this.references.values()).includes(inventoryReferenceId)) return false;

		const binding = QUICK_SLOT_BINDINGS.find(
			({ slot }) => slot !== 0 && this.references.get(slot) === undefined,
		);
		if (!binding) return false;

		this.set(binding.slot, inventoryReferenceId);
		return true;
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
		return binding?.label;
	}

	/** Marks the slot most recently selected by the player. */
	setActiveSlot(slot: number): void {
		this.activeSlot = slot;
	}

	/** Returns the key assigned to the most recently selected slot. */
	getActiveKey(): string | undefined {
		return QUICK_SLOT_BINDINGS.find(({ slot }) => slot === this.activeSlot)?.label;
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
