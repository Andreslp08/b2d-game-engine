import type { Entity } from "engine/ecs/entity";
import Vector2 from "engine/math/vector2";
import { createThrowableBomb } from "./shared/throwable-bomb";

export const createTailGunnerBomb = (position: Vector2, targetPosition: Vector2, owner: Entity) =>
	createThrowableBomb(position, targetPosition, owner, {
		damage:30,
		tags: ["tail-gunner-bomb", "enemy-projectile"],
	});
