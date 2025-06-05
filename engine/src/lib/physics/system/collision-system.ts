import { System } from "../../ecs/system";
import { ScriptComponent } from "../../scripts/script-component";
import { Collider } from "../components/collider";
import { RigidBody } from "../components/rigid-body";
import { BodyType } from "../enum/body-type";
import { Entity } from "../../ecs/entity";

export class CollisionSystem extends System {

	
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

	update(deltaTime: number): void {
		const entities = this.getScene().getEntitiesAsArray();
		const entityList = Array.from(entities);

		for (const entity of entityList) {
			if (!entity.hasComponent(RigidBody) || !entity.hasComponent(Collider)) continue;

			const rigidBody = entity.getComponent(RigidBody);
			const colliderA = entity.getComponent(Collider);
			const gameObjectA = rigidBody.gameObject;
			if (colliderA.collidable === false) continue;

			if (rigidBody.bodyType !== BodyType.Dynamic) continue;

			rigidBody.isOnGround = false;
			colliderA.isColliding = false;
			const collisions: { a: Entity; b: Entity }[] = [];

			// MOVER EN EJE X Y RESOLVER
			gameObjectA.transform.position.x += rigidBody.movement.x;
			for (const other of entityList) {
				if (other === entity || !other.hasComponent(Collider)) continue;

				const gameObjectB = other.getComponent(Collider).getEntity();
				const colliderB = other.getComponent(Collider);
				if (gameObjectA.renderLayer !== gameObjectB.renderLayer) continue;
				if (
					gameObjectA.getZindex() !== gameObjectB.getZindex() &&
					colliderA.ignoreZIndex === false &&
					colliderB.ignoreZIndex === false
				)
					continue;
				if (gameObjectA === gameObjectB) continue;
				if (colliderA.collidable !== colliderB.collidable) continue;
				if (!colliderA.intersects(colliderB)) continue;
				colliderA.isColliding = true;
				collisions.push({ a: entity, b: other });
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

				const gameObjectB = other.getComponent(Collider).getEntity();
				const colliderB = other.getComponent(Collider);
				if (gameObjectA.renderLayer !== gameObjectB.renderLayer) continue;
				if (
					gameObjectA.getZindex() !== gameObjectB.getZindex() &&
					colliderA.ignoreZIndex === false &&
					colliderB.ignoreZIndex === false
				)
					continue;
				if (gameObjectA === gameObjectB) continue;
				if (colliderA.collidable !== colliderB.collidable) continue;
				if (!colliderA.intersects(colliderB)) continue;
				colliderA.isColliding = true;
				collisions.push({ a: entity, b: other });
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

			// 	DETECT OVERLAP
			for (const collision of collisions) {
				const gameObjectA = collision.a.getComponent(Collider).getEntity();
				const gameObjectB = collision.b.getComponent(Collider).getEntity();

				const scriptComponentsA: ScriptComponent[] =
					gameObjectA.getComponents<ScriptComponent>(
						ScriptComponent
					) as unknown as ScriptComponent[];
				for (const scriptComponent of scriptComponentsA) {
					scriptComponent.onCollisionEnter(gameObjectB);
				}
				const scriptComponentsB: ScriptComponent[] =
					gameObjectB.getComponents<ScriptComponent>(
						ScriptComponent
					) as unknown as ScriptComponent[];
				for (const scriptComponent of scriptComponentsB) {
					scriptComponent.onCollisionEnter(gameObjectA);
				}
			}
		}
	}

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {}
}
