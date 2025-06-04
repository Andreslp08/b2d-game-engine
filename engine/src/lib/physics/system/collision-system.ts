import { Entity } from "../../ecs/entity";
import { System } from "../../ecs/system";
import { ScriptComponent } from "../../scripts/script-component";
import { Collider } from "../components/collider";
import { RigidBody } from "../components/rigid-body";

export class CollisionSystem extends System {
	update(deltaTime: number, entities: Set<Entity>): void {
		for (const entity of entities) {
			if (!entity.hasComponent(RigidBody) || !entity.hasComponent(Collider)) {
				continue;
			}
			const rigidBodyA = entity.getComponent(RigidBody);
			const colliderA = entity.getComponent(Collider);
			const scriptComponentA = entity.getComponent(ScriptComponent);
			colliderA.isColliding = false;
			for (const other of entities) {
				if (!other.hasComponent(RigidBody) || !other.hasComponent(Collider)) {
					continue;
				}
				const rigidBodyB = other.getComponent(RigidBody);
				const colliderB = other.getComponent(Collider);
				if (rigidBodyA === rigidBodyB) {
					continue;
				}
				if (!colliderA.collidable || !colliderB.collidable) {
					continue;
				}
				const scriptComponetB = other.getComponent(ScriptComponent);
				if (colliderA.intersects(colliderB)) {
					colliderA.isColliding = true;
					if (scriptComponentA) {
						scriptComponentA.onCollisionEnter(other);
					}
					if (scriptComponetB) {
						scriptComponetB.onCollisionEnter(entity);
					}
				}
			}
		}
	}
}
