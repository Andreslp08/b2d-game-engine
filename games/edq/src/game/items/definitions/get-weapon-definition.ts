import type { WeaponVisualDefinition } from "./item-definition";
import type { WeaponId } from "./weapons-ids";


const weapons = new Map<WeaponId, WeaponVisualDefinition>();

weapons.set("desert-eagle", {
	image: "spritesheet:weapons:desert-eagle",
	size: { x: 0.35, y: 0.35 },
	scale: { x: 1, y: 1 },
	anchor: { x: 0, y: 0 },
	pivot: { x: 0.5, y: 0.2 },
	handOffset: { x: 0.35, y: 0.35 },
	rotationOffsetDegrees: 45,
	projectileSpawnPoint: { x: 0.5, y: 0.2 },
});

weapons.set("m4", {
	image: "spritesheet:weapons:m4",
	size: { x: 0.7, y: 0.4 },
	scale: { x: 1, y: 1 },
	anchor: { x: 0, y: 0 },
	pivot: { x: 0.5, y: 0.4 },
	handOffset: { x: 0.3, y: 0.4 },
	rotationOffsetDegrees: 45,
	projectileSpawnPoint: { x: 0.5, y: 0.3 },
});
weapons.set("shotgun", {
	image: "spritesheet:weapons:shotgun",
	size: { x: 0.7, y: 0.4 },
	scale: { x: 1, y: 1 },
	anchor: { x: 0, y: 0 },
	pivot: { x: 0.5, y: 0.4 },
	handOffset: { x: 0.3, y: 0.4 },
	rotationOffsetDegrees: 45,
	projectileSpawnPoint: { x: 0.5, y: 0.3 },
});
weapons.set("rocket_launcher", {
	image: "spritesheet:weapons:rocket-launcher",
	size: { x: 0.7, y: 0.4 },
	scale: { x: 1, y: 1 },
	anchor: { x: 0, y: 0 },
	pivot: { x: 0.5, y: 0.4 },
	handOffset: { x: 0.3, y: 0.4 },
	rotationOffsetDegrees: 45,
	projectileSpawnPoint: { x: 0.5, y: 0.3 },
});

export const getWeaponVisualDefinition = (weaponId: WeaponId) => {
    return weapons.get(weaponId);
};
