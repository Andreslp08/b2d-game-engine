import type { ProjectileDefinition } from "./item-definition";
import type { WeaponId } from "./weapons-ids";

const projectile = new Map<WeaponId, ProjectileDefinition>();

projectile.set("desert-eagle", {
	image: "spritesheet:bullet:heavy",
	visual: {
		size: { x: 0.2, y: 0.1 },
		scale: { x: 1, y: 1 },
		anchor: { x: 0, y: 0 },
		pivot: { x: 0.5, y: 0.5 },
	},
	collider: {
		offset: { x: 0, y: 0 },
		size: { x: 0.2, y: 0.2 },
	},
	sound: "sound:weapon:shot:desert-eagle",
});
projectile.set("m4", {
	image: "spritesheet:bullet:medium",
	visual: {
		size: { x: 0.2, y: 0.1 },
		scale: { x: 1, y: 1 },
		anchor: { x: 0, y: 0 },
		pivot: { x: 0.5, y: 0.5 },
	},
	collider: {
		offset: { x: 0, y: 0 },
		size: { x: 0.2, y: 0.2 },
	},
	sound: "sound:weapon:shot:m4",
});
projectile.set("shotgun", {
	image: "spritesheet:bullet:shells",
	visual: {
		size: { x: 0.2, y: 0.1 },
		scale: { x: 1, y: 1 },
		anchor: { x: 0, y: 0 },
		pivot: { x: 0.5, y: 0.5 },
	},
	collider: {
		offset: { x: 0, y: 0 },
		size: { x: 0.2, y: 0.2 },
	},
	sound: "sound:weapon:shot:shotgun",
});
projectile.set("rocket_launcher", {
	image: "spritesheet:bullet:rocket-launcher",
	visual: {
		size: { x: 0.5, y: 0.25 },
		scale: { x: 1, y: 1 },
		anchor: { x: 0, y: 0 },
		pivot: { x: 0.5, y: 0.5 },
	},
	collider: {
		offset: { x: 0, y: 0 },
		size: { x: 0.5, y: 0.25 },
	},
	sound: "sound:weapon:shot:rocket-launcher",
});

export const getProjectileDefinition = (weaponId: WeaponId) => {
	return projectile.get(weaponId);
};
