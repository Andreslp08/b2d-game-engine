import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { Transform } from "engine/common/components/transform";
import { GameObject } from "engine/common/entities/game-object";
import { Time } from "engine/common/interfaces/time";
import type { Entity } from "engine/ecs/entity";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { ScriptComponent } from "engine/scripts/script-component";
import { PlayerLifeController } from "../script-components/player/player-life-controller";
import { DeathParticleEffect } from "../script-components/shared/death-particle-effect";
import { ParticleEmitter } from "engine/particle-system/component/particle-emitter";
import { ParticleRenderType } from "engine/particle-system/enum/enum";
import { Damageable } from "../script-components/shared/damageable";
import { HealthComponent } from "../script-components/shared/health-component";

export class SoldierBombController extends ScriptComponent {
	private spawnTime = 0;
	private exploded = false;
	private readonly lifetime = 3;
	private readonly rotationSpeed = 540;

	constructor(private owner: Entity) {
		super();
	}

	onStart(): void {
		this.spawnTime = Time.time;
		const collider = this.entity.getComponent(Collider);
		if (collider) collider.ignoreEntity(this.owner);
	}

	onUpdate(): void {
		if (Time.time - this.spawnTime >= this.lifetime) {
			this.explode();
			return;
		}

		const transform = this.entity.getComponent(Transform);
		const body = this.entity.getComponent(DynamicBody);
		if (!transform || !body) return;

		const direction = body.velocity.x >= 0 ? 1 : -1;
		const speedFactor = Math.max(0.35, Math.min(Math.abs(body.velocity.x), 10) / 10);
		transform.rotation += direction * this.rotationSpeed * speedFactor * Time.deltaTime;
	}

	onCollisionEnter(entity: Entity): void {
		if (entity.hasTag("player")) {
			const playerLifeController = entity.getComponent(PlayerLifeController);
			if (playerLifeController) playerLifeController.setDamage(25);
			this.explode();
		}
	}

	private explode(): void {
		if (this.exploded) return;

		this.exploded = true;
		const particle = this.entity.getComponent(DeathParticleEffect);
		if (particle) particle.play();
		this.entity.destroy();
	}
}

export const createSoldierBomb = (position: Vector2, targetPosition: Vector2, owner: Entity) => {
	const bomb = new GameObject(
		{
			position: position.clone(),
			rotation: 0,
			size: new Vector2(0.6, 0.6),
		},
		new Sprite({
			image: AssetsManager.getImageByName("spritesheet:virus"),
			framePosition: new Vector2(0, 0),
			frameSize: { w: 500, h: 500 },
		}),
	);

	const body = new DynamicBody();
	const collider = new Collider(new Vector2(0, 0), new Vector2(0.35, 0.35));
	const directionX = targetPosition.x > position.x ? 1 : -1;

	body.mass = 10;
	body.gravity = 60;
	body.friction = 2;
	body.dragScale = 2;
	body.bounciness = new Vector2(0.7, 0.7);
	body.velocity = new Vector2(directionX * 8, -10);

	bomb.addTag("soldier-bomb");
	bomb.addComponent(new SoldierBombController(owner));
	bomb.addComponent(collider);
	bomb.addComponent(body);
	bomb.addComponent(new HealthComponent(100, 100, false));
	bomb.addComponent(new Damageable({resolve:(payload)=>payload.damage * 100}));
	bomb.addComponent(new DeathParticleEffect(createSoldierBombExplosionEmitter));

	return bomb;
};

function createSoldierBombExplosionEmitter(): ParticleEmitter {
	const emitter = new ParticleEmitter();
	emitter.particleRenderType = ParticleRenderType.CIRCLE;
	emitter.maxParticles = 10;
	emitter.burstCount = 10;
	emitter.duration = 2;
	emitter.loop = false;
	emitter.playing = true;
	emitter.localSpace = true;
	emitter.destroyOnComplete = true;
	emitter.positionOffset = new Vector2(0, 0);
	emitter.lifetime = { min: 0.25, max: 2 };
	emitter.speed = { min: 1, max: 3 };
	emitter.angle = { min: 0, max: 360 };
	emitter.gravity = new Vector2(0, 8);
	emitter.size = {
		startMin: new Vector2(0.08, 0.08),
		startMax: new Vector2(0.22, 0.22),
		endMin: new Vector2(0.01, 0.01),
		endMax: new Vector2(0.04, 0.04),
	};
	emitter.opacity = { start: 1, end: 0 };
	emitter.startColors = ["ff0000"];
	emitter.endColors = ["ff0000"];

	return emitter;
}
