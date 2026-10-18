import type { Entity } from "@b2d-engine/core/ecs/entity";
import Vector2 from "@b2d-engine/core/math/vector2";
import { createThrowableBomb } from "./shared/throwable-bomb";

export const createSoldierBomb = (position: Vector2, targetPosition: Vector2, owner: Entity) =>
	createThrowableBomb(position, targetPosition, owner, {
		tags: ["soldier-bomb", "enemy-projectile"],
	});
