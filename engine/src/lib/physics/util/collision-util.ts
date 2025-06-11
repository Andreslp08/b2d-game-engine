import { GameObject } from "../../common/entities/game-object";
import { Collider } from "../components/collider";
import { CollisionDirection } from "../enum/collision-direction";

const getCollisionDirection = (a: GameObject, b: GameObject): CollisionDirection => {
	if (!a.hasComponent(Collider) || !b.hasComponent(Collider)) return CollisionDirection.UNKNOWN;

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
			return deltaX > 0 ? CollisionDirection.LEFT : CollisionDirection.RIGHT;
		} else {
			return deltaY > 0 ? CollisionDirection.TOP : CollisionDirection.BOTTOM;
		}
	}

	return CollisionDirection.UNKNOWN;
};

const getHorizontalCollisionPenetration = (a: Collider, b: Collider): number => {
	if(!a || !b) return 0;
	if(!a.getPosition() || !a.getSize() || !b.getPosition() || !b.getSize()) return 0;
	const leftA = a.getPosition().x - a.getSize().x / 2;
	const rightA = a.getPosition().x + a.getSize().x / 2;
	const leftB = b.getPosition().x - b.getSize().x / 2;
	const rightB = b.getPosition().x + b.getSize().x / 2;

	if (rightA <= leftB || leftA >= rightB) return 0;

	const overlapLeft = rightA - leftB;
	const overlapRight = rightB - leftA;

	return overlapLeft < overlapRight ? overlapLeft : -overlapRight;
};

const getVerticalCollisionPenetration = (a: Collider, b: Collider): number => {
	if(!a || !b) return 0;
	if(!a.getPosition() || !a.getSize() || !b.getPosition() || !b.getSize()) return 0;
	const topA = a.getPosition().y - a.getSize().y / 2;
	const bottomA = a.getPosition().y + a.getSize().y / 2;
	const topB = b.getPosition().y - b.getSize().y / 2;
	const bottomB = b.getPosition().y + b.getSize().y / 2;

	if (bottomA <= topB || topA >= bottomB) return 0;

	const overlapTop = bottomA - topB;
	const overlapBottom = bottomB - topA;

	return overlapTop < overlapBottom ? overlapTop : -overlapBottom;
};

export const CollisionUtil = {
	getCollisionDirection,
	getHorizontalCollisionPenetration,
	getVerticalCollisionPenetration,
};
