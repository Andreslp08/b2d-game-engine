import { Transform } from "../../common/components/transform";
import { Entity } from "../../ecs/entity";
import { System } from "../../ecs/system";
import { Scene } from "../../graphics/scenes/scene";
import Vector2 from "../../math/vector2";
import { ScriptComponent } from "../../scripts/script-component";
import { Collider } from "../components/collider";
import { DynamicBody } from "../components/dynamic-body";
import { KinematicBody } from "../components/kinematic-body";
import { StaticBody } from "../components/static-body";
import { BodyType } from "../enum/body-type";
import { CollisionDirection } from "../enum/collision-direction";
import { CollisionUtil } from "../util/collision-util";

export class PhysicsSystem extends System {
	constructor(scene: Scene) {
		super(scene);
	}

	private reflect(velocity: Vector2, normal: Vector2, restitution: number): Vector2 {
		const dot = velocity.dot(normal);
		const reflection = normal.clone().scale((1 + restitution) * dot);
		return velocity.clone().substract(reflection);
	}

	private isCollision(entity1: Entity, entity2: Entity) {
		if (entity1 === entity2) return false;
		const collider1 = entity1.getComponent(Collider);
		const collider2 = entity2.getComponent(Collider);
		if (!collider1 || !collider2) return false;
		if (!collider1.collidable || !collider2.collidable) return false;
		if (
			entity1.getZindex() !== entity2.getZindex() &&
			!collider1.ignoreZIndex &&
			!collider2.ignoreZIndex
		)
			return false;
		if (collider1.isIgnoringEntity(entity2) || collider2.isIgnoringEntity(entity1))
			return false;
		return collider1.intersects(collider2);
	}

	private dynamicCollisionResolver(targetEntity: Entity, entities: Entity[]) {
		const targetTransform = targetEntity.getComponent(Transform);
		const targetDynamicBody = targetEntity.getComponent(DynamicBody);
		const targetCollider = targetEntity.getComponent(Collider);

		targetDynamicBody.isOnGround = false;
		targetCollider.isColliding = false;
		if (!targetDynamicBody || !targetCollider || !targetTransform) return;
		if (!targetCollider.collidable) return;

		const steps = 10;
		const stepX = targetDynamicBody.movement.x / steps;
		const stepY = targetDynamicBody.movement.y / steps;

		// --- RESOLUCIÓN EN EJE X (por pasos) ---
		for (let i = 0; i < steps; i++) {
			targetTransform.position.x += stepX;
			let collided = false;
			for (const entity of entities) {
				if (!this.isCollision(targetEntity, entity)) continue;
				collided = true;
				targetCollider.isColliding = true;
				this.notifyCollision(targetEntity, entity);

				const colliderA = targetCollider;
				const colliderB = entity.getComponent(Collider);
				const penetrationX = CollisionUtil.getHorizontalCollisionPenetration(
					colliderA,
					colliderB
				);

				if (penetrationX !== 0) {
					targetTransform.position.x -= stepX;
					const normalX = penetrationX > 0 ? Vector2.RIGHT : Vector2.LEFT;
					if (
						(penetrationX > 0 && targetDynamicBody.velocity.x > 0) ||
						(penetrationX < 0 && targetDynamicBody.velocity.x < 0)
					) {
						targetDynamicBody.velocity = this.reflect(
							targetDynamicBody.velocity,
							normalX,
							targetDynamicBody.bounciness.x
						);
					}
					break;
				}
			}
			if (collided) break;
		}

		// --- RESOLUCIÓN EN EJE Y (por pasos) ---
		for (let i = 0; i < steps; i++) {
			targetTransform.position.y += stepY;
			let collided = false;
			for (const entity of entities) {
				if (!this.isCollision(targetEntity, entity)) continue;
				collided = true;
				targetCollider.isColliding = true;
				this.notifyCollision(targetEntity, entity);

				const colliderA = targetCollider;
				const colliderB = entity.getComponent(Collider);
				const penetrationY = CollisionUtil.getVerticalCollisionPenetration(
					colliderA,
					colliderB
				);

				if (penetrationY !== 0) {
					targetTransform.position.y -= stepY;
					const normalY = penetrationY > 0 ? Vector2.DOWN : Vector2.UP;
					if (
						(penetrationY > 0 && targetDynamicBody.velocity.y > 0) ||
						(penetrationY < 0 && targetDynamicBody.velocity.y < 0)
					) {
						targetDynamicBody.velocity = this.reflect(
							targetDynamicBody.velocity,
							normalY,
							targetDynamicBody.bounciness.y
						);
					}

					if (penetrationY > 0) {
						targetDynamicBody.isOnGround = true;
						targetCollider.collisionDirection.y = CollisionDirection.BOTTOM;
					} else {
						targetCollider.collisionDirection.y = CollisionDirection.TOP;
					}
					break;
				}
			}
			if (collided) break;
		}
	}

	private kinematicCollisionResolver(targetEntity: Entity, entities: Entity[]) {}
	private staticCollisionResolver(targetEntity: Entity, entities: Entity[]) {}

	private notifyCollision(entity1: Entity, entity2: Entity) {
		const collider1 = entity1.getComponent(Collider);
		const collider2 = entity2.getComponent(Collider);
		if (!collider1 || !collider2) return;
		const entity1Scripts = entity1.getComponents(ScriptComponent);
		const entity2Scripts = entity2.getComponents(ScriptComponent);
		for (const scriptComponent of entity1Scripts) {
			scriptComponent.onCollisionEnter(entity2);
		}
		for (const scriptComponent of entity2Scripts) {
			scriptComponent.onCollisionEnter(entity1);
		}
	}

	private dynamicPhysics(deltaTime: number, dynamicBody: DynamicBody) {
		dynamicBody.acceleration.set(0, 0);
		dynamicBody.applyGravity(dynamicBody.gravity);
		const friction = dynamicBody.velocity.x * -dynamicBody.friction;
		dynamicBody.addForce(new Vector2(friction, 0));
		const drag = dynamicBody.velocity.clone().scale(-dynamicBody.dragScale);
		dynamicBody.addForce(drag);

		for (const force of dynamicBody.forces) {
			dynamicBody.acceleration.x += force.x / dynamicBody.mass;
			dynamicBody.acceleration.y += force.y / dynamicBody.mass;
		}

		dynamicBody.velocity.x += dynamicBody.acceleration.x * deltaTime;
		dynamicBody.velocity.y += dynamicBody.acceleration.y * deltaTime;

		const epsilon = 0.01;
		if (Math.abs(dynamicBody.velocity.x) < epsilon) dynamicBody.velocity.x = 0;
		if (Math.abs(dynamicBody.velocity.y) < epsilon) dynamicBody.velocity.y = 0;

		dynamicBody.movement = new Vector2(
			dynamicBody.velocity.x * deltaTime,
			dynamicBody.velocity.y * deltaTime
		);
		dynamicBody.forces = [];
	}

	private calculatePhysics(deltaTime: number) {
		const entities = this.getScene().getEntitiesAsArray();
		for (const entity of entities) {
			const dynamicBody = entity.getComponent(DynamicBody);
			const kinematicBody = entity.getComponent(KinematicBody);
			const staticBody = entity.getComponent(StaticBody);
			const isDynamic = dynamicBody && dynamicBody.bodyType === BodyType.Dynamic;
			const isKinematic = kinematicBody && kinematicBody.bodyType === BodyType.Kinematic;
			const isStatic = !isDynamic && !isKinematic;
			if (isDynamic) {
				this.dynamicPhysics(deltaTime, dynamicBody);
				dynamicBody.updateDirection();
				this.dynamicCollisionResolver(entity, entities);
			}
			if (isKinematic) {
				this.kinematicCollisionResolver(entity, entities);
			}
			if (isStatic) {
				this.staticCollisionResolver(entity, entities);
			}
		}
	}

	fixedUpdate(deltaTime: number): void {
		this.calculatePhysics(deltaTime);
	}

	update(deltaTime: number): void {}
}
