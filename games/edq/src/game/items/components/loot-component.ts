import { Component } from "engine/ecs/component";
import type { ItemInstance } from "../runtime/item-instance";

/** ECS data for an item currently present in the world and available for pickup. */
export class LootComponent extends Component {
	constructor(
		readonly definitionId: string,
		readonly quantity = 1,
		readonly instance?: ItemInstance,
	) {
		super();
		if (quantity <= 0) throw new Error("Loot quantity must be positive");
	}
}
