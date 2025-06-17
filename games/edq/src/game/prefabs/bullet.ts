import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { GameObject } from "engine/common/entities/game-object";
import type { Entity } from "engine/ecs/entity";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";
import { ScriptComponent } from "engine/scripts/script-component";
import { HealthComponent } from "../script-components/health-component";
import { ShieldComponent } from "../script-components/shield-component";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { Time } from "engine/common/interfaces/time";

export class BulletController extends ScriptComponent {
	private shooted = false;
	private shootStartTime = 0;
	private shouldDestroy = false;
	private collisionStartTime = 0;
	private collisionDetected = false;

	setShooted(shooted: boolean) {
		this.shooted = shooted;
	}

	isShooted() {
		return this.shooted;
	}
	onStart(): void {}

	private destroyBullet() {
		const scene = this.entity.getScene();
		if (scene) scene.destroyEntity(this.entity);
		this.shouldDestroy = true;
	}
	onCollisionEnter(entity: Entity): void {
		this.collisionStartTime = Time.time;
		this.collisionDetected = true;
		const shieldComponent = entity.getComponent(ShieldComponent);
		const healthComponent = entity.getComponent(HealthComponent);
		const damage = 10;
		if (shieldComponent && healthComponent) {
			if (shieldComponent.getShield() > 0) {
				shieldComponent.setDamage(damage);
			} else {
				healthComponent.setDamage(damage);
			}
		} else if (shieldComponent && !healthComponent) {
			shieldComponent.setDamage(damage);
		} else if (!shieldComponent && healthComponent) {
			healthComponent.setDamage(damage);
		}
	}

	onUpdate(): void {
		if (this.shouldDestroy) {
			this.destroyBullet();
		}

		if (this.shooted) {
			this.shootStartTime += Time.deltaTime;
		}
		if (this.collisionDetected) {
			this.collisionStartTime += Time.deltaTime;
		}
		if (this.collisionStartTime > 1.8 || this.shootStartTime > 5) {
			this.shouldDestroy = true;
		}
	}
}

export const createBullet = (
	position: Vector2,
	rotation: number,
	direction: { x: -1 | 1; y: -1 | 1 }
) => {
	const sprite = new Sprite({
		id: "bullet",
		image: AssetsManager.getImageByName("spritesheet:desert-eagle-bullet"),
		framePosition: new Vector2(0, 0),
		frameSize: { w: 500, h: 500 },
	});
	sprite.setDirection({ x: direction.x, y: direction.y });
	const obj = new GameObject(
		{
			position: position.clone(),
			size: new Vector2(0.2, 0.2),
			rotation: rotation,
		},
		sprite
	);
	obj.addTag("bullet");
	obj.addComponent(new BulletController(obj));
	obj.addComponent(new Collider(new Vector2(0, 0), new Vector2(0.2, 0.2)));
	obj.addComponent(new DynamicBody(obj));
	obj.getComponent(DynamicBody).bounciness = new Vector2(0.6, 0.6);
	return obj;
};
