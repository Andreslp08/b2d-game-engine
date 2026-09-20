import { GameEvent } from "engine/common/events/game-event";
import type { AnyItemDefinition } from "../definitions/item-definition";
import type { ItemRegistry } from "../definitions/item-registry";
import { createItemInstance, type ItemInstance } from "./item-instance";

/** Logical inventory entry; definitions are resolved through the registry. */
export interface InventoryEntry {
	readonly entryId: string;
	readonly definitionId: string;
	quantity: number;
	readonly instance?: ItemInstance;
}

/** Event emitted when an inventory entry quantity changes. */
export interface InventoryChangedEvent {
	readonly entry: InventoryEntry;
	readonly quantityDelta: number;
}

/** Owns item entries independently from UI layout and presentation. */
export class Inventory {
	readonly onChanged = new GameEvent<InventoryChangedEvent>();
	private readonly entries = new Map<string, InventoryEntry>();

	constructor(private readonly registry: ItemRegistry) {}

	/** Adds a stack quantity or a unique item instance. */
	add(definitionId: string, quantity = 1, instance?: ItemInstance): InventoryEntry {
		const definition = this.registry.get(definitionId);
		if (quantity <= 0 || !Number.isInteger(quantity)) throw new Error("Quantity must be a positive integer");
		if (!definition.stackable && quantity !== 1) throw new Error(`${definitionId} is not stackable`);
		if (definition.stackable && quantity > definition.maxStack) {
			throw new Error(`Stack limit exceeded for ${definitionId}`);
		}

		if (instance) {
			if (instance.definitionId !== definitionId) throw new Error("Instance and definition do not match");
			const entry: InventoryEntry = { entryId: instance.instanceId, definitionId, quantity: 1, instance };
			this.entries.set(entry.entryId, entry);
			this.onChanged.emit({ entry, quantityDelta: 1 });
			return entry;
		}

		const existing = definition.stackable
			? Array.from(this.entries.values()).find((entry) => entry.definitionId === definitionId && !entry.instance)
			: undefined;
		if (existing) {
			const space = definition.maxStack - existing.quantity;
			if (quantity > space) throw new Error(`Stack limit exceeded for ${definitionId}`);
			existing.quantity += quantity;
			this.onChanged.emit({ entry: existing, quantityDelta: quantity });
			return existing;
		}

		const entry: InventoryEntry = {
			entryId: `inventory-entry-${definitionId}`,
			definitionId,
			quantity,
		};
		this.entries.set(entry.entryId, entry);
		this.onChanged.emit({ entry, quantityDelta: quantity });
		return entry;
	}

	/** Adds an already-created unique instance. */
	addInstance(instance: ItemInstance): InventoryEntry {
		return this.add(instance.definitionId, 1, instance);
	}

	/** Removes quantity from an entry or definition and reports success. */
	remove(referenceId: string, quantity = 1): boolean {
		const entry = this.entries.get(referenceId) ?? this.findByDefinitionId(referenceId);
		if (!entry || quantity <= 0 || entry.quantity < quantity) return false;
		entry.quantity -= quantity;
		if (entry.quantity === 0) this.entries.delete(entry.entryId);
		this.onChanged.emit({ entry, quantityDelta: -quantity });
		return true;
	}

	/** Resolves either an entry ID or the first entry for a definition ID. */
	get(referenceId: string): InventoryEntry | undefined {
		return this.entries.get(referenceId) ?? this.findByDefinitionId(referenceId);
	}

	/** Resolves an item definition using this inventory's registry. */
	getDefinition(definitionId: string): AnyItemDefinition {
		return this.registry.get(definitionId);
	}

	/** Finds the first owned entry for a definition. */
	findByDefinitionId(definitionId: string): InventoryEntry | undefined {
		return Array.from(this.entries.values()).find((entry) => entry.definitionId === definitionId);
	}

	/** Finds an entry by its unique item instance ID. */
	findByInstanceId(instanceId: string): InventoryEntry | undefined {
		return Array.from(this.entries.values()).find((entry) => entry.instance?.instanceId === instanceId);
	}

	/** Checks whether the inventory owns at least the requested quantity. */
	has(definitionId: string, quantity = 1): boolean {
		return this.count(definitionId) >= quantity;
	}

	/** Returns the total quantity owned for a definition. */
	count(definitionId: string): number {
		return Array.from(this.entries.values())
			.filter((entry) => entry.definitionId === definitionId)
			.reduce((total, entry) => total + entry.quantity, 0);
	}

	/** Returns a snapshot of the logical entries. */
	getEntries(): readonly InventoryEntry[] {
		return Array.from(this.entries.values());
	}

	/** Creates a unique instance for a non-stackable definition. */
	createInstance(definition: AnyItemDefinition): ItemInstance {
		if (definition.stackable) throw new Error("Stackable items cannot create unique instances");
		return createItemInstance(definition.id, definition.type === "weapon" ? definition : undefined);
	}
}
