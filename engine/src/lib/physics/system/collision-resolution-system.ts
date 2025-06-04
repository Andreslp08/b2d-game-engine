import { Entity } from "../../ecs/entity";
import { System } from "../../ecs/system";
import { Collider } from "../components/collider";
import { RigidBody } from "../components/rigid-body";
import { BodyType } from "../enum/body-type";
import { CollisionDirection } from "../enum/collision-direction";
import { getCollisionDirection } from "../util/direction";

export class CollisionResolutionSystem extends System {
	update(deltaTime: number, entities: Set<Entity>): void {
		for (const entity of entities) {
			if (!entity.hasComponent(RigidBody) || !entity.hasComponent(Collider)) {
				continue;
			}
			const rigidBodyA = entity.getComponent(RigidBody);
			rigidBodyA.isOnGround = false;
			const gameObjectA = entity.getComponent(RigidBody).gameObject;
			const colliderA = entity.getComponent(Collider);
			for (const other of entities) {
				if (!other.hasComponent(RigidBody) || !other.hasComponent(Collider)) {
					continue;
				}
				const rigidBodyB = other.getComponent(RigidBody);
				const colliderB = other.getComponent(Collider);
				const gameObjectB = other.getComponent(RigidBody).gameObject;
				if (rigidBodyA === rigidBodyB) {
					continue;
				}
				if (!colliderA.collidable || !colliderB.collidable) {
					continue;
				}
				if (colliderA.isColliding === true) {
					const collisionDirection = getCollisionDirection(gameObjectA, gameObjectB);
					if (rigidBodyA.bodyType === BodyType.Dynamic) {
						let penetration = 0;
						switch (collisionDirection) {
							case CollisionDirection.BOTTOM: {
								const bottomA =
									colliderA.getPosition().y + colliderA.getSize().y / 2;
								const topB = colliderB.getPosition().y - colliderB.getSize().y / 2;

								penetration = bottomA - topB;

								if (penetration > 0) {
									gameObjectA.transform.position.y -= penetration;
									rigidBodyA.velocity.y = 0;
									rigidBodyA.acceleration.y = 0;
									rigidBodyA.isOnGround = true;
								}
								break;
							}
							case CollisionDirection.TOP: {
								const topA = colliderA.getPosition().y - colliderA.getSize().y / 2;
								const bottomB =
									colliderB.getPosition().y + colliderB.getSize().y / 2;
								penetration = bottomB - topA;

								if (penetration > 0) {
									gameObjectA.transform.position.y += penetration;
									rigidBodyA.velocity.y = 0;
									rigidBodyA.acceleration.y = 0;
								}
								break;
							}
							case CollisionDirection.LEFT: {
								const leftA = colliderA.getPosition().x - colliderA.getSize().x / 2;
								const rightB =
									colliderB.getPosition().x + colliderB.getSize().x / 2;
								penetration = rightB - leftA;

								if (penetration > 0) {
									gameObjectA.transform.position.x += penetration;
									rigidBodyA.velocity.x = 0;
									rigidBodyA.acceleration.x = 0;
								}
								break;
							}
							case CollisionDirection.RIGHT: {
								const rightA =
									colliderA.getPosition().x + colliderA.getSize().x / 2;
								const leftB = colliderB.getPosition().x - colliderB.getSize().x / 2;
								penetration = rightA - leftB;

								if (penetration > 0) {
									gameObjectA.transform.position.x -= penetration;
									rigidBodyA.velocity.x = 0;
									rigidBodyA.acceleration.x = 0;
								}
								break;
							}
						}
						if (rigidBodyA.velocity.x !== 0 || rigidBodyA.velocity.y !== 0) {
							rigidBodyA.isMoving = true;
						} else {
							rigidBodyA.isMoving = false;
						}
					}
				}
			}
		}
	}
}
