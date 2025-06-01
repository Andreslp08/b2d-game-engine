import { GameObject } from "../../common/entities/game-object";
import { Collider } from "../components/collider";

export const getCollisionDirection = (
	a: GameObject,
	b: GameObject
): "left" | "top" | "bottom" | "right" | "" => {
	if (!a.hasComponent(Collider) || !b.hasComponent(Collider)) return "";

	const colliderA = a.getComponent(Collider);
	const positionA = colliderA.getPosition();
	const sizeA = colliderA.getSize();
	const x_centerA = positionA.x;
	const y_centerA = positionA.y;

	const colliderB = b.getComponent(Collider);
	const positionB = colliderB.getPosition();
	const sizeB = colliderB.getSize();
	const x_centerB = positionB.x;
	const y_centerB = positionB.y;

	const deltaX = x_centerA - x_centerB;
	const deltaY = y_centerA - y_centerB;

	const x_combinedHalfWidth = (sizeA.x + sizeB.x) / 2;
	const y_combinedHalfWidth = (sizeA.y + sizeB.y) / 2;

	const overlapX = x_combinedHalfWidth - Math.abs(deltaX);
	const overlapY = y_combinedHalfWidth - Math.abs(deltaY);

	if (overlapX > 0 && overlapY > 0) {
		if (overlapX < overlapY) {
			return deltaX > 0 ? "left" : "right";
		} else {
			return deltaY > 0 ? "top" : "bottom";
		}
	}

	return "";
};
