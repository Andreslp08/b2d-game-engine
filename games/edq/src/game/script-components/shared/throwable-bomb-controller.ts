import { Transform } from "engine/common/components/transform";
import { Time } from "engine/common/interfaces/time";
import type { Entity } from "engine/ecs/entity";
import { Collider } from "engine/physics/components/collider";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { ScriptComponent } from "engine/scripts/script-component";
import { PlayerLifeController } from "../player/player-life-controller";
import { DeathParticleEffect } from "./death-particle-effect";

export interface ThrowableBombControllerConfig {
	lifetime: number;
	rotationSpeed: number;
	damage: number;
	targetTag: string;
}

export class ThrowableBombController extends ScriptComponent {
	private spawnTime = 0;
	private exploded = false;

	constructor(
		private readonly owner: Entity,
		private readonly config: ThrowableBombControllerConfig,
	) {
		super();
	}

	onStart(): void {
		this.spawnTime = Time.time;
		this.entity.getComponent(Collider)?.ignoreEntity(this.owner);
	}

	onUpdate(): void {
		if (Time.time - this.spawnTime >= this.config.lifetime) {
			this.explode();
			return;
		}

		const transform = this.entity.getComponent(Transform);
		const body = this.entity.getComponent(DynamicBody);
		if (!transform || !body) return;

		const direction = body.velocity.x >= 0 ? 1 : -1;
		const speedFactor = Math.max(0.35, Math.min(Math.abs(body.velocity.x), 10) / 10);
		transform.rotation += direction * this.config.rotationSpeed * speedFactor * Time.deltaTime;
	}

	onCollisionEnter(entity: Entity): void {
		if (!entity.hasTag(this.config.targetTag)) return;

		const playerLifeController = entity.getComponent(PlayerLifeController);
		if (playerLifeController) playerLifeController.setDamage(this.config.damage);
		this.explode();
	}

	private explode(): void {
		if (this.exploded) return;

		this.exploded = true;
		this.entity.getComponent(DeathParticleEffect)?.play();
		this.entity.destroy();
	}
}
