import { Component } from "engine/ecs/component";
import type { ItemRegistry } from "../definitions/item-registry";
import { Inventory } from "../runtime/inventory";

/** ECS bridge that gives an entity ownership of a logical inventory. */
export class InventoryComponent extends Component {
	readonly inventory: Inventory;

	/** Creates an inventory backed by the supplied item registry. */
	constructor(registry: ItemRegistry) {
		super();
		this.inventory = new Inventory(registry);
	}
}
