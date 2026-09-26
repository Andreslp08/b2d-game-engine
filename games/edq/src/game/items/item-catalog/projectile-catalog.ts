import type { ProjectileDefinition } from "../definitions/projectile-definition";
import type { ProjectileId } from "../definitions/projectile-ids";

const PROJECTILE_DEFINITIONS: Record<ProjectileId, ProjectileDefinition> = {
	"bullet-light": {
		id: "bullet-light", kind: "bullet", image: "spritesheet:bullet:light",
		visual: { size: { x: 0.2, y: 0.1 }, scale: { x: 1, y: 1 }, anchor: { x: 0, y: 0 }, pivot: { x: 0.5, y: 0.5 } },
		collider: { offset: { x: 0, y: 0 }, size: { x: 0.2, y: 0.2 } },
		sound: "sound:weapon:shot:light",
	},
	"bullet-heavy": {
		id: "bullet-heavy", kind: "bullet", image: "spritesheet:bullet:heavy",
		visual: { size: { x: 0.2, y: 0.1 }, scale: { x: 1, y: 1 }, anchor: { x: 0, y: 0 }, pivot: { x: 0.5, y: 0.5 } },
		collider: { offset: { x: 0, y: 0 }, size: { x: 0.2, y: 0.2 } },
		sound: "sound:weapon:shot:desert-eagle",
	},
	"bullet-medium": {
		id: "bullet-medium", kind: "bullet", image: "spritesheet:bullet:medium",
		visual: { size: { x: 0.2, y: 0.1 }, scale: { x: 1, y: 1 }, anchor: { x: 0, y: 0 }, pivot: { x: 0.5, y: 0.5 } },
		collider: { offset: { x: 0, y: 0 }, size: { x: 0.2, y: 0.2 } },
		sound: "sound:weapon:shot:m4",
	},
	shell: {
		id: "shell", kind: "bullet", image: "spritesheet:bullet:shells",
		visual: { size: { x: 0.2, y: 0.1 }, scale: { x: 1, y: 1 }, anchor: { x: 0, y: 0 }, pivot: { x: 0.5, y: 0.5 } },
		collider: { offset: { x: 0, y: 0 }, size: { x: 0.2, y: 0.2 } },
		sound: "sound:weapon:shot:shotgun",
	},
	rocket: {
		id: "rocket", kind: "rocket", image: "spritesheet:bullet:rocket-launcher",
		visual: { size: { x: 0.5, y: 0.25 }, scale: { x: 1, y: 1 }, anchor: { x: 0, y: 0 }, pivot: { x: 0.5, y: 0.5 } },
		collider: { offset: { x: 0, y: 0 }, size: { x: 0.5, y: 0.25 } },
		sound: "sound:weapon:shot:rocket-launcher", explosionRadius: 2.5,
	},
};

export const getProjectileDefinition = (projectileId: ProjectileId): ProjectileDefinition => {
	return PROJECTILE_DEFINITIONS[projectileId];
};
