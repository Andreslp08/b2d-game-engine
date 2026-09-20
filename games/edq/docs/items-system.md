# Items, Weapons, and Ammunition

This document describes the item-related architecture currently implemented in the EDQ game. It starts with the item system because it is the source of truth for weapons, ammunition, inventory ownership, equipment, quick slots, and future world interactions.

## 1. Item definitions

Item definitions describe static design data. They are not ECS components and do not represent a particular item owned by the player.

Definitions are located in:

```text
games/edq/src/game/items/definitions/
```

The base contract is `ItemDefinitionBase`. It contains common properties:

- `id`
- `name`
- `description`
- `icon`
- `type`
- `stackable`
- `maxStack`
- `droppable`
- `sellable`
- `equippable`
- `quickAssignable`

The complete item type is a discriminated union. The `type` field identifies the specific definition shape and allows TypeScript to narrow the available properties safely.

Current item categories are:

```ts
type ItemType =
  | "weapon"
  | "ammo"
  | "consumable"
  | "throwable"
  | "material"
  | "key_item"
  | "treasure";
```

Specialized definitions currently include:

- `WeaponDefinition`
- `AmmoDefinition`
- `ConsumableDefinition`
- `ThrowableDefinition`

The design intentionally avoids a large class hierarchy. New item behavior should normally be added through data definitions, capabilities, or new systems rather than subclasses such as `HandgunItem` or `ShotgunItem`.

## 2. Weapon types and ammunition types

`WeaponType` and `AmmoType` are independent concepts. Ammo types are broad compatibility families, not one type per weapon.

```ts
type WeaponType =
  | "handgun"
  | "shotgun"
  | "smg"
  | "rifle"
  | "sniper"
  | "magnum"
  | "rocket_launcher"
  | "melee";
```

```ts
type AmmoType =
  | "light"
  | "medium"
  | "shells"
  | "heavy"
  | "explosive";
```

This allows multiple concrete weapons to share ammunition, while a weapon type remains independent from its ammunition type. Melee weapons do not require ammunition.

## 3. Item registry

`ItemRegistry` is the central catalog for static definitions:

```text
games/edq/src/game/items/definitions/item-registry.ts
```

The game-level registry is created in:

```text
games/edq/src/game/items/item-catalog.ts
```

Definitions are resolved by ID instead of being copied into inventories, shops, loot objects, or UI models:

```ts
itemRegistry.get("desert_eagle");
```

The current catalog contains:

- Desert Eagle
- M4
- Shotgun
- First Aid
- Light Ammo
- Medium Ammo
- Shells
- Heavy Ammo
- Explosive Ammo

`AmmoDefinition` is used explicitly for the ammo catalog so TypeScript validates that every ammunition entry contains the correct ammo-specific fields.

## 4. Item instances

An `ItemDefinition` describes what an item is. An `ItemInstance` represents one concrete runtime item owned by the player.

The runtime model is located at:

```text
games/edq/src/game/items/runtime/item-instance.ts
```

An instance contains:

- `instanceId`
- `definitionId`
- optional mutable runtime state

Weapons currently use this runtime state:

```ts
interface WeaponInstanceState {
  currentAmmo: number;
  durability?: number;
  upgrades: readonly string[];
  attachments: readonly string[];
}
```

This means two Desert Eagles may share the same definition while having different magazines, durability, upgrades, or attachments.

Stackable items do not need unique instances. They are represented by an inventory entry containing a `definitionId` and `quantity`.

## 5. Inventory

The logical inventory is implemented in:

```text
games/edq/src/game/items/runtime/inventory.ts
```

The ECS bridge is:

```text
games/edq/src/game/items/components/inventory-component.ts
```

`Inventory` is independent from UI and grid layout. It currently supports:

- unique item instances;
- stackable items;
- quantities;
- lookup by inventory reference;
- lookup by definition ID;
- lookup by instance ID;
- `add`;
- `addInstance`;
- `remove`;
- `has`;
- `count`;
- inventory change events.

The inventory stores entries, not duplicated full definitions. Definitions are resolved through the registry when needed.

The player currently receives:

- one Desert Eagle instance;
- one M4 instance;
- one Shotgun instance;
- one First Aid instance;
- separate ammunition reserves for heavy, medium, and shells.

## 6. Loot in the world

World loot is represented by:

```text
games/edq/src/game/items/components/loot-component.ts
```

`LootComponent` stores only the data required for a world pickup:

- `definitionId`;
- `quantity`;
- optional `ItemInstance`.

It is separate from the player's inventory. A future pickup flow should be:

```text
World entity with LootComponent
    -> pickup interaction
    -> Inventory.add(...) or Inventory.addInstance(...)
    -> destroy the world entity
```

The component is ready for this flow, but a complete generic pickup/interact system is not yet implemented.

## 7. Quick slots

Quick slots are implemented in:

```text
games/edq/src/game/items/components/quick-slots-component.ts
games/edq/src/game/script-components/player/quick-slot-input-controller.ts
```

Quick slots do not own items. They store references to inventory entries.

An explicit `null` reference represents an empty hand. This is different from an invalid or missing reference.

Current player bindings are:

| Key | Selection |
|---|---|
| `1` | Empty hand |
| `2` | Desert Eagle |
| `3` | M4 |
| `4` | Shotgun |
| `5` | First Aid |

Before using a reference, the controller validates that the referenced inventory entry still exists. Missing references are removed automatically.

## 8. Equipment

Equipment is implemented in:

```text
games/edq/src/game/items/components/equipment-component.ts
```

It stores a reference to an inventory entry rather than owning the item.

When the selected quick slot contains `null`, equipment is cleared. When an item is selected, equipment stores that inventory entry reference. Equipment is also cleared if its referenced inventory entry disappears.

The current flow is:

```text
Keyboard input
    -> QuickSlotInputController
    -> resolve quick-slot reference in Inventory
    -> EquipmentComponent
    -> WeaponHolder / item-specific runtime behavior
```

## 9. Weapon presentation and behavior

The current visual weapon is still a `GameObject` created by the existing weapon prefab. The same Desert Eagle sprite is intentionally reused for all three current firearm definitions.

`WeaponHolder` now synchronizes that visual object with `EquipmentComponent`:

- empty hand hides the weapon and disables shooting;
- First Aid hides the weapon and disables shooting;
- Desert Eagle activates the weapon controller with the Desert Eagle definition;
- M4 activates the same visual with the M4 definition;
- Shotgun activates the same visual with the Shotgun definition.

This keeps item ownership and equipment selection separate from the current temporary visual asset.

## 10. Current weapon definitions

### Desert Eagle

- `weaponType`: `magnum`
- `ammoType`: `heavy`
- one projectile per shot;
- high damage;
- slow fire rate;
- short reload time.

### M4

- `weaponType`: `rifle`
- `ammoType`: `medium`
- one projectile per shot;
- faster fire rate;
- moderate damage;
- small spread;
- larger magazine.

### Shotgun

- `weaponType`: `shotgun`
- `ammoType`: `shells`
- six projectiles per shot;
- wide spread;
- close-range behavior;
- one shell consumed per trigger action;
- slower reload.

## 11. Ammunition and reloading

Each weapon instance owns its current magazine through `WeaponInstanceState.currentAmmo`.

The inventory owns reserve ammunition as stackable entries. A weapon consumes reserve ammo only when reloading.

Reloading starts automatically when a shot empties the magazine. Pressing `R` can also start a manual reload when:

- a weapon is equipped;
- the magazine is not full;
- reserve ammo exists;
- another reload is not already active.

During the configured reload duration:

- shooting is blocked;
- the weapon remains in its reload state;
- the current weapon definition is preserved.

While reloading, the crosshair displays only the large main circle. The secondary circle and center crosshair are hidden until the reload completes.

When the timer completes, the inventory transfers the required amount of reserve ammo into the weapon instance's magazine. Reload time is defined per weapon through `WeaponDefinition.reloadTime`.

Current reload times:

| Weapon | Reload time |
|---|---:|
| Desert Eagle | 1.1 seconds |
| M4 | 1.8 seconds |
| Shotgun | 2.2 seconds |

## 12. Weapon debug logs

The weapon controller logs detailed information through `console.log`.

On a successful shot, the log includes:

- item ID and name;
- item type;
- weapon type;
- ammo type;
- base damage;
- fire rate;
- range;
- projectile count;
- spread;
- projectile speed;
- magazine size;
- current magazine ammo;
- remaining reserve ammo.

Reload start, reload completion, unavailable reloads, and empty magazines are also logged.

## 13. Projectile behavior

Projectile creation now receives weapon-specific damage and range. Shotgun projectiles use independent spread directions.

Projectiles ignore other entities tagged as `bullet`, preventing shotgun pellets from destroying one another when they spawn at the same position. They still collide with valid world and enemy entities.

## 14. Removed legacy model

The old player `Loot` component was removed. It previously mixed together:

- weapon selection;
- slot ownership;
- item data;
- input state;
- weapon classification.

It was replaced by:

- `InventoryComponent` for ownership;
- `QuickSlotsComponent` for references;
- `EquipmentComponent` for the current selection;
- `QuickSlotInputController` for keyboard input;
- `WeaponHolder` and `WeaponController` for weapon presentation and behavior.

The old standalone `weapon-definition.ts` was also removed. Weapon definitions now live in the item definition system.

## 15. Current limitations and next steps

The following pieces are modeled but not yet fully connected to gameplay:

- generic world pickup interaction;
- loot table generation;
- item consumption effects such as First Aid healing;
- magazine reload animation/audio;
- weapon-specific visual prefabs;
- shop transactions;
- crafting;
- quest and door requirement consumers.

The current architecture leaves those systems able to consume the same `ItemDefinition`, `Inventory`, `ItemRequirement`, and `ItemInstance` models without duplicating item data.
