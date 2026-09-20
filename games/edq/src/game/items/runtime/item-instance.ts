import type { WeaponDefinition } from "../definitions/item-definition";

/** Mutable state shared by one concrete weapon instance. */
export interface WeaponInstanceState {
	currentAmmo: number;
	durability?: number;
	upgrades: readonly string[];
	attachments: readonly string[];
}

/** Runtime identity and mutable state of one owned item. */
export interface ItemInstance {
	readonly instanceId: string;
	readonly definitionId: string;
	readonly state?: WeaponInstanceState;
}

let nextInstanceId = 0;

/** Creates a unique item instance and initializes weapon magazine state. */
export function createItemInstance(
	definitionId: string,
	definition?: WeaponDefinition,
): ItemInstance {
	return {
		instanceId: `item-instance-${nextInstanceId++}`,
		definitionId,
		...(definition?.type === "weapon"
			? {
					state: {
						currentAmmo: definition.magazineSize,
						upgrades: [],
						attachments: [],
					},
				}
				: {}),
	};
}
