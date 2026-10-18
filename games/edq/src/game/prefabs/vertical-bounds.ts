import { GameObject } from "@b2d-engine/core/common/entities/game-object";
import { Sprite } from "@b2d-engine/core/graphics/sprites/components/sprite";
import type { ITranform } from "@b2d-engine/core/common/interfaces/transform";
import Vector2 from "@b2d-engine/core/math/vector2";
import { Collider } from "@b2d-engine/core/physics/components/collider";

export const createVerticalBounds = (
	transform: ITranform,
	direction: "left" | "right" = "left",
) => {
	const obj = new GameObject(transform);
	obj.deleteallComponentsByClass(Sprite);
	obj.addComponent(new Collider(new Vector2(0, 0), transform.size));
	obj.addTag(`main-${direction}-bound`);
	return obj;
};
