import { GameObject } from "engine/common/entities/game-object";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import type { ITranform } from "engine/input/interfaces/transform.interface";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";

export const createVerticalBounds = (transform: ITranform, direction:'left' | 'right' = 'left') => {
	const obj = new GameObject(transform);
	obj.deleteallComponentsByClass(Sprite);
	obj.addComponent(new Collider(new Vector2(0, 0), transform.size));
    obj.addTag(`main-${direction}-bound`);
	return obj;
};
