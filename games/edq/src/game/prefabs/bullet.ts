import { AssetsManager } from "@b2d-engine/core/common/assets-manager/assets-manager";
import { GameObject } from "@b2d-engine/core/common/entities/game-object";
import type { Entity } from "@b2d-engine/core/ecs/entity";
import { Sprite } from "@b2d-engine/core/graphics/sprites/components/sprite";
import Vector2 from "@b2d-engine/core/math/vector2";
import { Collider } from "@b2d-engine/core/physics/components/collider";
import { ScriptComponent } from "@b2d-engine/core/scripts/script-component";
import { HealthComponent } from "../script-components/shared/health-component";
import { ShieldComponent } from "../script-components/shared/shield-component";
import { Time } from "@b2d-engine/core/common/interfaces/time";
import { KinematicBody } from "@b2d-engine/core/physics/components/kinematic-body";
import { Transform } from "@b2d-engine/core/common/components/transform";
import { CullingConfigComponent } from "@b2d-engine/core/performance/culling";
import { CullingType } from "@b2d-engine/core/performance/enum/culling-type";
import { ParticleEmitter } from "@b2d-engine/core/particle-system/component/particle-emitter";
import { ParticleRenderType } from "@b2d-engine/core/particle-system/enum/enum";
import { VIEWPORT_WIDTH_IN_WORLD_UNITS } from "@b2d-engine/core/common/constants";
import { Damageable } from "../script-components/shared/damageable";
import type { ProjectileDefinition } from "../items/definitions/projectile-definition";

/** Moves a projectile, applies weapon damage, and destroys it on collision/range expiry. */
export class BulletController extends ScriptComponent {
	private shooted = false;
	private startPosition = new Vector2(0, 0);
	private collisionDetected = false;

	/** Creates a projectile controller with weapon-specific damage and range. */
	constructor(
		private readonly damage = 10,
		private readonly maxDistance = VIEWPORT_WIDTH_IN_WORLD_UNITS,
		private readonly projectileDefinition: ProjectileDefinition
	) {
		super();
	}

	onStart(): void {
		const shootSound = AssetsManager.getSoundByName(this.projectileDefinition.sound);
		shootSound.volume(1);
		shootSound.play("shot");
		this.startPosition = this.entity.getComponent(Transform).position.clone();
		this.shooted = true;
	}

	private emitFlashParticle(): void {
		const scene = this.entity.getScene();
		if (!scene) return;
		const flashEntity = new GameObject({
			position: this.entity.getComponent(Transform).position.clone(),
			rotation: this.entity.getComponent(Transform).rotation,
			size: new Vector2(1, 1),
		});
		const emitter = new ParticleEmitter();
		emitter.particleRenderType = ParticleRenderType.CIRCLE;
		emitter.maxParticles = 10;
		emitter.burstCount = emitter.maxParticles;
		emitter.duration = 1;
		emitter.loop = false;
		emitter.playing = true;
		emitter.localSpace = true;
		emitter.destroyOnComplete = true;
		emitter.positionOffset = new Vector2(0, 0);
		emitter.lifetime = { min: 0.1, max: 1 };
		emitter.speed = { min: 0.25, max: 0.8 };
		emitter.angle = { min: 0, max: 360 };
		emitter.gravity = new Vector2(0, 2);
		emitter.size = {
			startMin: new Vector2(0, 0),
			startMax: new Vector2(0.07, 0.07),
			endMin: new Vector2(0.005, 0.005),
			endMax: new Vector2(0.01, 0.01),
		};
		emitter.opacity = { start: 1, end: 1 };
		emitter.startColors = ["#fff2a8"];
		emitter.endColors = ["#ff3b1f"];
		flashEntity.addComponent(emitter);
		scene.addEntity(flashEntity);
	}

	private destroyBullet() {
		const scene = this.entity.getScene();
		if (!scene) return;
		scene.destroyEntity(this.entity);
	}
	onCollisionEnter(entity: Entity): void {
		if (this.collisionDetected) return;
		this.collisionDetected = true;
		this.emitFlashParticle();
		const damageable = entity.getComponent(Damageable);
		if (damageable) {
			damageable.applyDamage({ damage: this.damage, source: this.entity, type: "bullet" });
		}
		this.destroyBullet();
	}

	onFixedUpdate(): void {
		const bullet = this.entity;
		const culling = bullet.getComponent(CullingConfigComponent);
		culling.cullingType = CullingType.NONE;
		const transform = bullet.getComponent(Transform);
		const body = bullet.getComponent(KinematicBody);
		if (!transform || !body) return;
		transform.position = body.move(transform.position, Time.fixedDeltaTime);
		const distance = Vector2.distance(this.startPosition, transform.position);
		const MAX_DISTANCE = VIEWPORT_WIDTH_IN_WORLD_UNITS;
		if (distance > Math.min(MAX_DISTANCE, this.maxDistance)) {
			this.destroyBullet();
		}
	}
}

/** Creates a projectile entity configured for a particular weapon shot. */
export const createBullet = (
	position: Vector2,
	damage = 10,
	maxDistance = VIEWPORT_WIDTH_IN_WORLD_UNITS,
	definition: ProjectileDefinition,
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
	const obj = new GameObject(
		{
			position: position.clone(),
			size: new Vector2(definition.visual.size.x, definition.visual.size.y),
			rotation: 0,
		},
		sprite,
	);
	obj.addTag("bullet");
	obj.addComponent(new BulletController(damage, maxDistance, definition ));
	obj.addComponent(new Collider(
		new Vector2(definition.collider.offset.x, definition.collider.offset.y),
		new Vector2(definition.collider.size.x, definition.collider.size.y),
	));
	obj.addComponent(new KinematicBody());
	return obj;
};
