import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { GameObject } from "engine/common/entities/game-object";
import type { Entity } from "engine/ecs/entity";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";
import { ScriptComponent } from "engine/scripts/script-component";
import { HealthComponent } from "../script-components/shared/health-component";
import { ShieldComponent } from "../script-components/shared/shield-component";
import { Time } from "engine/common/interfaces/time";
import { KinematicBody } from "engine/physics/components/kinematic-body";
import { Transform } from "engine/common/components/transform";
import { CullingConfigComponent } from "engine/performance/culling";
import { CullingType } from "engine/performance/enum/culling-type";
import { ParticleEmitter } from "engine/particle-system/component/particle-emitter";
import { ParticleRenderType } from "engine/particle-system/enum/enum";
import { VIEWPORT_WIDTH_IN_METERS } from "engine/common/constants";
import { Damageable } from "../script-components/shared/damageable";

export class BulletController extends ScriptComponent {
	private shooted = false;
	private startPosition = new Vector2(0, 0);
	private collisionDetected = false;

	onStart(): void {
		const shootSound = AssetsManager.getSoundByName("sound:desert-eagle");
		shootSound.volume(1);
		shootSound.play("shot");
		this.startPosition = this.entity.getComponent(Transform).position.clone();
		this.shooted = true;
	}

	private emitFlashParticle() {
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
		this.emitFlashParticle();
		this.destroyBullet();
		const damageable = entity.getComponent(Damageable);
		if (!damageable) return;
		damageable.applyDamage({ damage: 10, source: this.entity, type: "bullet" });
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
		const MAX_DISTANCE = VIEWPORT_WIDTH_IN_METERS;
		if (distance > MAX_DISTANCE) {
			this.destroyBullet();
		}
	}
}

export const createBullet = (position: Vector2) => {
	const sprite = new Sprite({
		image: AssetsManager.getImageByName("spritesheet:desert-eagle-bullet"),
		framePosition: new Vector2(0, 0),
		frameSize: { w: 500, h: 500 },
	});
	// sprite.setDirection({ x: direction.x, y: direction.y });
	const obj = new GameObject(
		{
			position: position.clone(),
			size: new Vector2(0.2, 0.2),
			rotation: 0,
		},
		sprite,
	);
	obj.addTag("bullet");
	obj.addComponent(new BulletController());
	obj.addComponent(new Collider(new Vector2(0, 0), new Vector2(0.2, 0.2)));
	obj.addComponent(new KinematicBody());
	return obj;
};
