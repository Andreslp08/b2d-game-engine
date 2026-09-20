/** Identifies the broad gameplay category of an item. */
export type ItemType =
	| "weapon"
	| "ammo"
	| "consumable"
	| "throwable"
	| "material"
	| "key_item"
	| "treasure";

/** Describes how a weapon is operated, independently from its ammunition. */
export type WeaponType =
	| "handgun"
	| "shotgun"
	| "smg"
	| "rifle"
	| "sniper"
	| "magnum"
	| "rocket_launcher"
	| "melee";

/** Identifies a compatible ammunition family. */
export type AmmoType =
	| "handgun"
	| "shotgun_shell"
	| "smg"
	| "rifle"
	| "sniper"
	| "magnum"
	| "rocket";

/** Describes the effect family of a throwable item. */
export type ThrowableType = "explosive" | "incendiary" | "flash" | "smoke";

/** Static data shared by every item definition. */
export interface ItemDefinitionBase {
	id: string;
	name: string;
	description: string;
	icon?: string;
	type: ItemType;
	stackable: boolean;
	maxStack: number;
	droppable: boolean;
	sellable: boolean;
	equippable: boolean;
	quickAssignable: boolean;
}

/** Static design data for a weapon item. */
export interface WeaponDefinition extends ItemDefinitionBase {
	type: "weapon";
	weaponType: WeaponType;
	ammoType: AmmoType;
	magazineSize: number;
	baseDamage: number;
	fireRate: number;
	range: number;
	projectileCount: number;
	spreadDegrees: number;
	projectileSpeed: number;
	reloadTime: number;
}

/** Static design data for stackable ammunition. */
export interface AmmoDefinition extends ItemDefinitionBase {
	type: "ammo";
	ammoType: AmmoType;
}

/** Static design data for a throwable item. */
export interface ThrowableDefinition extends ItemDefinitionBase {
	type: "throwable";
	throwableType: ThrowableType;
}

/** Static design data for a consumable item. */
export interface ConsumableDefinition extends ItemDefinitionBase {
	type: "consumable";
	effectId: string;
}

/** Static data for item categories without specialized fields yet. */
export interface ItemDefinition extends ItemDefinitionBase {
	type: Exclude<ItemType, "weapon" | "ammo" | "throwable" | "consumable">;
}

/** Union used by registries and systems that accept any item category. */
export type AnyItemDefinition =
	| WeaponDefinition
	| AmmoDefinition
	| ThrowableDefinition
	| ConsumableDefinition
	| ItemDefinition;
