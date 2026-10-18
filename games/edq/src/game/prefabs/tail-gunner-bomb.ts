import type { Entity } from "@b2d-engine/core/ecs/entity";
import Vector2 from "@b2d-engine/core/math/vector2";
import { createThrowableBomb } from "./shared/throwable-bomb";

export const createTailGunnerBomb = (
	position: Vector2,
	targetPosition: Vector2,
	owner: Entity,
	horizontalDirection: 1 | -1 = targetPosition.x >= position.x ? 1 : -1,
) =>
	createThrowableBomb(position, targetPosition, owner, {
		damage:30,
		horizontalDirection,
		tags: ["tail-gunner-bomb", "enemy-projectile"],
	});
