import { ItemRegistry } from "./item-registry";
import { AMMO_DEFINITIONS } from "./ammo-catalog";
import { CONSUMABLE_DEFINITIONS } from "./consumable-catalog";
import { WEAPON_DEFINITIONS } from "./weapons-catalog";

/** Shared registry containing every static item definition. */
export const itemRegistry = new ItemRegistry();

itemRegistry.registerMany(WEAPON_DEFINITIONS);
itemRegistry.registerMany(AMMO_DEFINITIONS);
itemRegistry.registerMany(CONSUMABLE_DEFINITIONS);

export { AMMO_DEFINITIONS, CONSUMABLE_DEFINITIONS, WEAPON_DEFINITIONS };
export { getProjectileDefinition } from "./projectile-catalog";
