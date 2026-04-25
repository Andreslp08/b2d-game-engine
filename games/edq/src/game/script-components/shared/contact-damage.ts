import type { Entity } from "engine/ecs/entity";
import { ScriptComponent } from "engine/scripts/script-component";
import { PlayerLifeController } from "../player/player-life-controller";
import { Collider } from "engine/physics/components/collider";
import { CollisionDirection } from "engine/physics/enum/collision-direction";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { Transform } from "engine/common/components/transform";
import Vector2 from "engine/math/vector2";

type DamageValue = number | (() => number);

interface ContactDamageOptions {
	damage?: DamageValue;
	horizontalForce?: number;
	verticalForce?: number;
	targetTags?: string[];
	knockback?: boolean;
}

export class ContactDamage extends ScriptComponent {
	private damage: DamageValue;
	private horizontalForce: number;
	private verticalForce: number;
	private targetTags: string[];
	private knockback: boolean;

	constructor(options: ContactDamageOptions = {}) {
		super();
		this.damage = options.damage ?? 20;
		this.horizontalForce = options.horizontalForce ?? 120000;
		this.verticalForce = options.verticalForce ?? 100000;
		this.targetTags = options.targetTags ?? [];
		this.knockback = options.knockback ?? true;
	}

	onCollisionEnter(entity: Entity): void {
		if (!this.isTarget(entity)) return;

		this.applyDamage(entity);
		if (this.knockback) this.applyKnockback(entity);
	}

	private isTarget(entity: Entity): boolean {
		return this.targetTags.some((tag) => entity.hasTag(tag));
	}

	private getDamage(): number {
		return typeof this.damage === "function" ? this.damage() : this.damage;
	}

	private applyDamage(entity: Entity): void {
		const playerLife = entity.getComponent(PlayerLifeController);
		if (!playerLife) return;

		playerLife.setDamage(this.getDamage());
	}

	private applyKnockback(entity: Entity): void {
		const collider = this.entity.getComponent(Collider);
		const playerBody = entity.getComponent(DynamicBody);
		const enemyTransform = this.entity.getComponent(Transform);
		const playerTransform = entity.getComponent(Transform);

		if (!collider || !playerBody || !enemyTransform || !playerTransform) return;

		const colDirection = collider.collisionDirection;
		const knockDir = playerTransform.position
			.clone()
			.substract(enemyTransform.position)
			.normalize();

		if (
			colDirection.x === CollisionDirection.RIGHT ||
			colDirection.x === CollisionDirection.LEFT
		) {
			playerBody.addForce(new Vector2(knockDir.x * this.horizontalForce, 0));
		}

		if (colDirection.y === CollisionDirection.TOP) {
			playerBody.addForce(new Vector2(0, -this.verticalForce));
		}
	}
}
