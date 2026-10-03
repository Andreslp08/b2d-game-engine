import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { GameObject } from "engine/common/entities/game-object";
import type { Entity } from "engine/ecs/entity";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { ParticleEmitter } from "engine/particle-system/component/particle-emitter";
import { ParticleRenderType } from "engine/particle-system/enum/enum";
import { Damageable } from "../../script-components/shared/damageable";
import { DeathParticleEffect } from "../../script-components/shared/death-particle-effect";
import { HealthComponent } from "../../script-components/shared/health-component";
import {
	ThrowableBombController,
	type ThrowableBombControllerConfig,
} from "../../script-components/shared/throwable-bomb-controller";

export interface ThrowableBombConfig {
	size: Vector2;
	colliderSize: Vector2;
	mass: number;
	gravity: number;
	friction: number;
	dragScale: number;
	bounciness: Vector2;
	horizontalSpeed: number;
	horizontalDirection?: 1 | -1;
	verticalSpeed: number;
	damage: number;
	health: number;
	damageMultiplier: number;
	controller: ThrowableBombControllerConfig;
	tags: string[];
	explosionEmitter: () => ParticleEmitter;
}

const defaultThrowableBombConfig: ThrowableBombConfig = {
	size: new Vector2(0.6, 0.6),
	colliderSize: new Vector2(0.35, 0.35),
	mass: 10,
	gravity: 60,
	friction: 2,
	dragScale: 2,
	bounciness: new Vector2(0.7, 0.7),
	horizontalSpeed: 8,
	verticalSpeed: -10,
	damage: 25,
	health: 100,
	damageMultiplier: 100,
	controller: {
		lifetime: 3,
		rotationSpeed: 540,
		damage: 25,
		targetTag: "player",
	},
	tags: ["enemy-projectile"],
	explosionEmitter: createThrowableBombExplosionEmitter,
};

export const createThrowableBomb = (
	position: Vector2,
	targetPosition: Vector2,
	owner: Entity,
	config: Partial<ThrowableBombConfig> = {},
): GameObject => {
	const resolvedConfig: ThrowableBombConfig = {
		...defaultThrowableBombConfig,
		...config,
		controller: { ...defaultThrowableBombConfig.controller, ...config.controller },
		bounciness: config.bounciness?.clone() ?? defaultThrowableBombConfig.bounciness.clone(),
		size: config.size?.clone() ?? defaultThrowableBombConfig.size.clone(),
		colliderSize: config.colliderSize?.clone() ?? defaultThrowableBombConfig.colliderSize.clone(),
		tags: config.tags ?? [...defaultThrowableBombConfig.tags],
	};

	const horizontalDirection = resolvedConfig.horizontalDirection ??
		(targetPosition.x >= position.x ? 1 : -1);

	const bomb = new GameObject(
		{ position: position.clone(), rotation: 0, size: resolvedConfig.size },
		new Sprite({
			image: AssetsManager.getImageByName("spritesheet:virus"),
			framePosition: new Vector2(0, 0),
			frameSize: { w: 500, h: 500 },
		}),
	);

	const body = new DynamicBody();
	body.mass = resolvedConfig.mass;
	body.gravity = resolvedConfig.gravity;
	body.friction = resolvedConfig.friction;
	body.dragScale = resolvedConfig.dragScale;
	body.bounciness = resolvedConfig.bounciness;
	body.velocity = new Vector2(
		horizontalDirection * resolvedConfig.horizontalSpeed,
		resolvedConfig.verticalSpeed,
	);

	const collider = new Collider(new Vector2(0, 0), resolvedConfig.colliderSize);
	bomb.addComponent(new ThrowableBombController(owner, resolvedConfig.controller));
	bomb.addComponent(collider);
	bomb.addComponent(body);
	bomb.addComponent(new HealthComponent(resolvedConfig.health, resolvedConfig.health, false));
	bomb.addComponent(new Damageable({ resolve: (payload) => payload.damage * resolvedConfig.damageMultiplier }));
	bomb.addComponent(new DeathParticleEffect(resolvedConfig.explosionEmitter));
	resolvedConfig.tags.forEach((tag) => bomb.addTag(tag));

	return bomb;
};

function createThrowableBombExplosionEmitter(): ParticleEmitter {
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
