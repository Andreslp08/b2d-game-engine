import { Entity } from "../../ecs/entity";
import { System } from "../../ecs/system";
import { Collider } from "../components/collider";
import { RigidBody } from "../components/rigid-body";
import { BodyType } from "../enum/body-type";
import { CollisionDirection } from "../enum/collision-direction";
import { getCollisionDirection } from "../util/direction";

export class CollisionResolutionSystem extends System {
	update(deltaTime: number, entities: Set<Entity>): void {
		const entityList = Array.from(entities);

		for (const entity of entityList) {
			if (!entity.hasComponent(RigidBody) || !entity.hasComponent(Collider)) continue;

			const rigidBody = entity.getComponent(RigidBody);
			const colliderA = entity.getComponent(Collider);
			const gameObjectA = rigidBody.gameObject;

			if (rigidBody.bodyType !== BodyType.Dynamic) continue;

			rigidBody.isOnGround = false;

			// MOVER EN EJE X Y RESOLVER
			gameObjectA.transform.position.x += rigidBody.movement.x;
			for (const other of entityList) {
				if (other === entity || !other.hasComponent(Collider)) continue;

				const colliderB = other.getComponent(Collider);
				if (!colliderA.intersects(colliderB)) continue;

				const penetrationX = this.getHorizontalPenetration(colliderA, colliderB);
				if (penetrationX !== 0) {
					gameObjectA.transform.position.x -= penetrationX;
					rigidBody.velocity.x = 0;
					rigidBody.acceleration.x = 0;
				}
			}

			// MOVER EN EJE Y Y RESOLVER
			gameObjectA.transform.position.y += rigidBody.movement.y;
			for (const other of entityList) {
				if (other === entity || !other.hasComponent(Collider)) continue;

				const colliderB = other.getComponent(Collider);
				if (!colliderA.intersects(colliderB)) continue;

				const penetrationY = this.getVerticalPenetration(colliderA, colliderB);
				if (penetrationY !== 0) {
					gameObjectA.transform.position.y -= penetrationY;
					rigidBody.velocity.y = 0;
					rigidBody.acceleration.y = 0;
					if (penetrationY > 0) {
						rigidBody.isOnGround = true;
					}
				}
			}
		}
	}

	getHorizontalPenetration(a: Collider, b: Collider): number {
		const leftA = a.getPosition().x - a.getSize().x / 2;
		const rightA = a.getPosition().x + a.getSize().x / 2;
		const leftB = b.getPosition().x - b.getSize().x / 2;
		const rightB = b.getPosition().x + b.getSize().x / 2;

		if (rightA <= leftB || leftA >= rightB) return 0;

		const overlapLeft = rightA - leftB;
		const overlapRight = rightB - leftA;

		return overlapLeft < overlapRight ? overlapLeft : -overlapRight;
	}

	getVerticalPenetration(a: Collider, b: Collider): number {
		const topA = a.getPosition().y - a.getSize().y / 2;
		const bottomA = a.getPosition().y + a.getSize().y / 2;
		const topB = b.getPosition().y - b.getSize().y / 2;
		const bottomB = b.getPosition().y + b.getSize().y / 2;

		if (bottomA <= topB || topA >= bottomB) return 0;

		const overlapTop = bottomA - topB;
		const overlapBottom = bottomB - topA;

		return overlapTop < overlapBottom ? overlapTop : -overlapBottom;
	}
}
