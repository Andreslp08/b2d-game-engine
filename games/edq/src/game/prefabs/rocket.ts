import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { GameObject } from "engine/common/entities/game-object";
import type { Entity } from "engine/ecs/entity";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";
import { KinematicBody } from "engine/physics/components/kinematic-body";
import { ScriptComponent } from "engine/scripts/script-component";
import { ParticleEmitter } from "engine/particle-system/component/particle-emitter";
import { ParticleRenderType } from "engine/particle-system/enum/enum";
import { Time } from "engine/common/interfaces/time";
import { Transform } from "engine/common/components/transform";
import { CullingConfigComponent } from "engine/performance/culling";
import { CullingType } from "engine/performance/enum/culling-type";
import { VIEWPORT_WIDTH_IN_METERS } from "engine/common/constants";
import { Damageable } from "../script-components/shared/damageable";
import type { ProjectileDefinition } from "../items/definitions/item-definition";
import type { GameSound } from "engine/common/assets-manager/game-sound";

/** Handles rocket movement, impact effects, and area damage. */
class RocketController extends ScriptComponent {
	private startPosition = new Vector2(0, 0);
	private collisionDetected = false;
	private explosionSound:GameSound;
	private explosionSoundPlayed = false;

	constructor(
		private readonly damage: number,
		private readonly maxDistance: number,
		private readonly explosionRadius: number,
		private readonly projectileDefinition: ProjectileDefinition
	) {
		super();
	}

	onStart(): void {
		const shootSound = AssetsManager.getSoundByName(this.projectileDefinition.sound);
		this.explosionSound = AssetsManager.getSoundByName("sound:explosion");
		shootSound.volume(1);
		shootSound.play("shot");
		this.startPosition = this.entity.getComponent(Transform).position.clone();
	}

	private emitExplosionEffect(): void {
		const scene = this.entity.getScene();
		if (!scene) return;
		const effect = new GameObject({
			position: this.entity.getComponent(Transform).position.clone(),
			rotation: 0,
			size: new Vector2(1, 1),
		});
		const emitter = new ParticleEmitter();
		emitter.particleRenderType = ParticleRenderType.CIRCLE;
		emitter.maxParticles = 28;
		emitter.burstCount = emitter.maxParticles;
		emitter.duration = 0.7;
		emitter.loop = false;
		emitter.playing = true;
		emitter.localSpace = true;
		emitter.destroyOnComplete = true;
		emitter.lifetime = { min: 0.15, max: 0.7 };
		emitter.speed = { min: 0.8, max: 2.2 };
		emitter.angle = { min: 0, max: 360 };
		emitter.gravity = new Vector2(0, 2);
		emitter.size = {
		startMin: new Vector2(1, 1),
		startMax: new Vector2(2, 2),
		endMin: new Vector2(0.005, 0.005),
		endMax: new Vector2(0.03, 0.03),
	};
		emitter.opacity = { start: 1, end: 0 };
		emitter.startColors = ["#fff2a8", "#ff9f1c"];
		emitter.endColors = ["#ff3b1f", "#7f1d1d"];
		effect.addComponent(emitter);
		scene.addEntity(effect);
	}

	private applyExplosionDamage(): void {
		const scene = this.entity.getScene();
		const center = this.entity.getComponent(Transform).position;
		for (const target of scene.getEntitiesAsArray()) {
			if (!target.hasTag("enemy") && !target.hasTag("enemy-projectile")) continue;
			const damageable = target.getComponent(Damageable);
			const targetTransform = target.getComponent(Transform);
			if (!damageable || !targetTransform) continue;

			const distance = Vector2.distance(center, targetTransform.position);
			if (distance > this.explosionRadius) continue;
			const falloff = 1 - (distance / this.explosionRadius) * 0.5;
			damageable.applyDamage({
				damage: this.damage * falloff,
				source: this.entity,
				type: "explosion",
			});
		}
	}

	private destroyRocket(): void {
		this.entity.getScene()?.destroyEntity(this.entity);
	}

	onCollisionEnter(_entity: Entity): void {
		if (this.collisionDetected) return;
		this.collisionDetected = true;
		if(!this.explosionSoundPlayed && this.explosionSound) this.explosionSound.play("explosion1");
		this.emitExplosionEffect();
		this.applyExplosionDamage();
		this.destroyRocket();
	}

	onFixedUpdate(): void {
		const rocket = this.entity;
		const culling = rocket.getComponent(CullingConfigComponent);
		const transform = rocket.getComponent(Transform);
		const body = rocket.getComponent(KinematicBody);
		if (culling) culling.cullingType = CullingType.NONE;
		if (!transform || !body) return;

		transform.position = body.move(transform.position, Time.fixedDeltaTime);
		const distance = Vector2.distance(this.startPosition, transform.position);
		if (distance > Math.min(VIEWPORT_WIDTH_IN_METERS, this.maxDistance)) this.destroyRocket();
	}
}

export const createRocket = (
	position: Vector2,
	damage: number,
	maxDistance: number,
	definition: ProjectileDefinition,
	explosionRadius: number,
) => {
	const image = AssetsManager.getImageByName(definition.image);
	const imageSize = {
		w: image.nativeElement.naturalWidth,
		h: image.nativeElement.naturalHeight,
	};
	const sprite = new Sprite({
		image,
		framePosition: new Vector2(0, 0),
		frameSize: imageSize,
		sourceSize: imageSize,
		spriteSourceSize: { x: 0, y: 0, ...imageSize },
		scale: new Vector2(definition.visual.scale.x, definition.visual.scale.y),
		direction: { x: 1, y: 1 },
		rotation: 0,
		anchor: new Vector2(definition.visual.anchor.x, definition.visual.anchor.y),
		pivot: new Vector2(definition.visual.pivot.x, definition.visual.pivot.y),
	});
	const rocket = new GameObject({
		position: position.clone(),
		size: new Vector2(definition.visual.size.x, definition.visual.size.y),
		rotation: 0,
	}, sprite);
	rocket.addTag("rocket");
	rocket.addTag("bullet");
	rocket.addComponent(new RocketController(damage, maxDistance, explosionRadius, definition));
	rocket.addComponent(new Collider(
		new Vector2(definition.collider.offset.x, definition.collider.offset.y),
		new Vector2(definition.collider.size.x, definition.collider.size.y),
	));
	rocket.addComponent(new KinematicBody());
	return rocket;
};
