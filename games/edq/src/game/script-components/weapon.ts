import { Transform } from "engine/common/components/transform";
import { GameObject } from "engine/common/entities/game-object";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import { MouseManager } from "engine/input/mouse-manager";
import { MathUtil } from "engine/math/math-util";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";
import { ScriptComponent } from "engine/scripts/script-component";
import { BulletController, createBullet } from "../prefabs/bullet";
import { WorldCameras } from "engine/graphics/cameras/camera-managers";
import type { WorldCamera } from "engine/graphics/cameras/world-camera";
import { DynamicBody } from "engine/physics/components/dynamic-body";

export class WeaponHolder extends ScriptComponent {
	weapon: GameObject | null = null;

	attachWeapon(weapon: GameObject) {
		if (!weapon.hasTag("weapon")) return;
		if (!weapon.hasComponent(WeaponController)) return;
		this.weapon = weapon;
		const weaponController = this.weapon.getComponent(WeaponController);
		weaponController.setWeaponHolder(this.entity as GameObject);
	}

	onStart(): void {}

	onUpdate(deltaTime: number): void {}

	onDestroy(): void {
		const scene = this.entity.getScene();
		if (scene) scene.destroyEntity(this.weapon);
	}
}

export class WeaponController extends ScriptComponent {
	weaponHolder: GameObject | null = null;
	weaponPosition = new Vector2(0, 0);
	shooting: boolean = false;
	currentAimAngle: number = 0;
	fireCooldown: number = 0;

	onStart(): void {}
	setWeaponHolder(weaponHolder: GameObject) {
		if (weaponHolder.hasTag("weapon")) return;
		if (weaponHolder.hasComponent(WeaponController)) return;
		if (!weaponHolder.hasComponent(WeaponHolder)) return;
		this.weaponHolder = weaponHolder;
	}

	private attachmentOffset: Vector2 = new Vector2(0.1, 0);

	setAttachmentOffset(offset: Vector2) {
		this.attachmentOffset = offset;
	}

	shot() {
		if (this.shooting) return;
		const directionX = this.weaponHolder?.getComponent(Sprite)?.direction.x ?? 1;
		const rotatedOffset = this.attachmentOffset.clone().rotate(this.currentAimAngle);
		const spawnPosition = this.weaponPosition
			.clone()
			.add(rotatedOffset.multiply(new Vector2(directionX, 1)));

		const obj = createBullet(spawnPosition);
		const bulletController = obj.getComponent(BulletController);
		obj.setZindex(-1);
		const collider = obj.getComponent(Collider);
		collider.ignoreZIndex = true;
		collider.ignoreEntity(this.entity);
		collider.ignoreEntity(this.weaponHolder);
		const holderCollider = this.weaponHolder?.getComponent(Collider);
		if (holderCollider) {
			holderCollider.ignoreEntity(obj);
		}
		const scene = this.entity.getScene();
		if (scene) {
			this.entity.getScene()?.addEntity(obj);
			const dynamicBody = obj.getComponent(DynamicBody);
			dynamicBody.gravity = 0.5;
			dynamicBody.mass = 7;
			dynamicBody.friction = 0.1;
			dynamicBody.dragScale = 0;
			const force = new Vector2(1, 0)
				.rotate(this.currentAimAngle)
				.multiply(new Vector2(directionX, 1))
				.multiplyBy(8000);
			dynamicBody.addForce(force);
			if (bulletController) {
				bulletController.setShooted(true);
			}
		}
	}

	onLateUpdate(deltaTime: number): void {
		if (!this.weaponHolder) return;
		const weaponObject = this.entity as GameObject;
		const weaponTransform = weaponObject.getComponent(Transform);
		if (!weaponTransform) return;
		if (!weaponTransform) return;
		const holderGameObject = this.weaponHolder as GameObject;
		const holderTransform = holderGameObject.getComponent(Transform);
		if (!holderTransform) return;
		const weaponSprite = weaponObject.getComponent(Sprite);
		const holderSprite = holderGameObject.getComponent(Sprite);
		if (!weaponSprite || !holderSprite) return;
		weaponSprite.direction = holderSprite.direction;
		const base = holderTransform.position.clone();
		const offsetX = Math.abs(
			holderTransform.size.x / 2 - weaponTransform.size.x / 2 + this.attachmentOffset.x
		);
		const offsetY =
			holderTransform.size.y / 2 - weaponTransform.size.y + this.attachmentOffset.y;

		weaponTransform.position = base.add(
			new Vector2(holderSprite.direction.x * offsetX, offsetY)
		);

		const mousePos = MouseManager.getPosition(); // ← posición en PANTALLA
		const mouseWorldPos = (
			WorldCameras.currentCamera as WorldCamera
		).getWorldPositionFromScreenPosition(mousePos);
		if (!mouseWorldPos) {
			return;
		}
		// Diferencia entre mouse y centro
		const dir = mouseWorldPos.clone().substract(weaponTransform.position).normalize();
		// Ángulo en radianes, luego a grados
		let angleRad = Math.atan2(dir.y, dir.x * weaponSprite.direction.x);
		// Limitar a ±90 grados (es decir, entre -PI/2 y +PI/2 radianes)
		const minAngle = -Math.PI / 2;
		const maxAngle = Math.PI / 2;
		angleRad = Math.max(minAngle, Math.min(maxAngle, angleRad));
		const angleDeg = MathUtil.radToDeg(angleRad);

		// Asignar rotación
		weaponTransform.rotation = angleDeg;
		this.weaponPosition = weaponTransform.position.clone();
		this.currentAimAngle = angleRad;

	}

	onFixedUpdate(deltaTime: number): void {
		const fireRate = 0.3;
		this.fireCooldown -= deltaTime;
		if (MouseManager.isLeftClickDown() && this.fireCooldown <= 0) {
			this.shot();
			this.fireCooldown = fireRate;
		}
	}
}
