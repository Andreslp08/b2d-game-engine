import type { ConsumableDefinition } from "../definitions/item-definition";

export const CONSUMABLE_DEFINITIONS: readonly ConsumableDefinition[] = [
	{
		id: "first_aid",
		name: "First Aid",
		description: "Restores health.",
		type: "consumable",
		stackable: true,
		maxStack: 3,
		droppable: true,
		sellable: true,
		equippable: false,
		quickAssignable: true,
		effectId: "restore_health",
		icon: "spritesheet:items:consumable:first_aid",
	},
];
