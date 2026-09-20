import type { Inventory } from "./inventory";

/** Reusable condition for doors, quests, puzzles, shops, and crafting. */
export interface ItemRequirement {
	readonly definitionId: string;
	readonly quantity: number;
	readonly consume: boolean;
}

/** Checks all requirements without mutating the inventory. */
export function meetsRequirements(inventory: Inventory, requirements: readonly ItemRequirement[]): boolean {
	return requirements.every((requirement) => inventory.has(requirement.definitionId, requirement.quantity));
}

/** Validates and consumes all requirements marked with `consume`. */
export function consumeRequirements(inventory: Inventory, requirements: readonly ItemRequirement[]): boolean {
	if (!meetsRequirements(inventory, requirements)) return false;
	for (const requirement of requirements) {
		if (requirement.consume && !inventory.remove(requirement.definitionId, requirement.quantity)) return false;
	}
	return true;
}
