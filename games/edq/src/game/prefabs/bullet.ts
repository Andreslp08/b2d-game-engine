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

export class BulletController extends ScriptComponent {
	private shooted = false;
	private shootStartTime = 0;

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
	}
	onCollisionEnter(entity: Entity): void {
        this.destroyBullet();
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

	onUpdate(deltaTime: number): void {
		if (this.shootStartTime > 2) {
            this.destroyBullet();
		}
		if (this.shooted) {
			this.shootStartTime += deltaTime;
		}
	}
}

export const createBullet = (position: Vector2) => {
	const obj = new GameObject(
		{
			position: position.clone(),
			size: new Vector2(0.15, 0.15),
			rotation: 0,
		},
		new Sprite("bullet", AssetsManager.getImage("/assets/textures/WaterBullet.png"), {
			position: new Vector2(0, 0),
			rotation: 0,
			size: new Vector2(500, 500),
		})
	);
    obj.addTag("bullet");
	obj.addComponent(new BulletController(obj));
	obj.addComponent(new Collider(new Vector2(0, 0), new Vector2(0.2, 0.2)));
	obj.addComponent(new DynamicBody(obj));
	obj.getComponent(DynamicBody).bounciness = new Vector2(0.6, 0.6);
	return obj;
};
