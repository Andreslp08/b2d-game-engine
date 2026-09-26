import type { ProjectileId } from "./projectile-ids";

export type ProjectileKind = "bullet" | "rocket";

/** Static visual and physical data for a projectile spawned by a weapon. */
export interface ProjectileDefinition {
	id: ProjectileId;
	kind: ProjectileKind;
	image: string;
	visual: {
		size: { x: number; y: number };
		scale: { x: number; y: number };
		anchor: { x: number; y: number };
		pivot: { x: number; y: number };
	};
	collider: {
		offset: { x: number; y: number };
		size: { x: number; y: number };
	};
	sound: string;
	explosionRadius?: number;
}
