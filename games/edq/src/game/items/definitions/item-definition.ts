import type { WeaponId } from "./weapons-ids";
import type { ProjectileId } from "./projectile-ids";
import type { AmmoId } from "./ammo-ids";

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
export type AmmoFamily =
	| "light"
	| "medium"
	| "shells"
	| "heavy"
	| "explosive";

/** Describes the effect family of a throwable item. */
export type ThrowableType = "explosive" | "incendiary" | "flash" | "smoke";

/** Static data shared by every item definition. */
export interface ItemDefinitionBase {
	id: string;
	name: string;
	description: string;
	icon: string;
	type: ItemType;
	stackable: boolean;
	maxStack: number;
	droppable: boolean;
	sellable: boolean;
	equippable: boolean;
	quickAssignable: boolean;
}

/** Static visual and attachment data for an equipped weapon. */
export interface WeaponVisualDefinition {
	image: string;
	size: { x: number; y: number };
	scale: { x: number; y: number };
	anchor: { x: number; y: number };
	pivot: { x: number; y: number };
	handOffset: { x: number; y: number };
	rotationOffsetDegrees: number;
	/** Normalized image coordinate where projectiles leave the weapon. */
	projectileSpawnPoint: { x: number; y: number };
}

/** Static design data for a weapon item. */
export interface WeaponDefinition extends ItemDefinitionBase {
	type: "weapon";
	weaponId: WeaponId;
	weaponType: WeaponType;
	ammoId: AmmoId;
	magazineSize: number;
	baseDamage: number;
	fireRate: number;
	range: number;
	projectileCount: number;
	spreadDegrees: number;
	projectileSpeed: number;
	reloadTime: number;
	weaponVisual: WeaponVisualDefinition;
}

/** Static design data for stackable ammunition. */
export interface AmmoDefinition extends ItemDefinitionBase {
	type: "ammo";
	id: AmmoId;
	ammoFamily: AmmoFamily;
	projectileId: ProjectileId;
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
