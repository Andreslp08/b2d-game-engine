import { Time } from "engine/common/interfaces/time";
import { Transform } from "engine/common/components/transform";
import { GameObject } from "engine/common/entities/game-object";
import { Cameras } from "engine/graphics/cameras/camera-manager";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import { MouseManager } from "engine/input/mouse-manager";
import { MathUtil } from "engine/math/math-util";
import Vector2 from "engine/math/vector2";
import { OrthographicCamera } from "engine/graphics/cameras/orthographic-camera";
import { Collider } from "engine/physics/components/collider";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { KinematicBody } from "engine/physics/components/kinematic-body";
import { ScriptComponent } from "engine/scripts/script-component";
import { createBullet } from "../../prefabs/bullet";
import { AimingController } from "../player/aiming-controller";
import { PlayerAimingArm } from "../player/player-aiming-arm";

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

	onUpdate(): void {}

	onDestroy(): void {
		const scene = this.entity.getScene();
		if (scene) scene.destroyEntity(this.weapon);
	}
}

export class WeaponController extends ScriptComponent {
	weaponHolder: GameObject | null = null;
	shooting = false;
	fireCooldown = 0;
	enableController = true;

	onStart(): void {}

	setWeaponHolder(weaponHolder: GameObject) {
		if (weaponHolder.hasTag("weapon")) return;
		if (weaponHolder.hasComponent(WeaponController)) return;
		if (!weaponHolder.hasComponent(WeaponHolder)) return;
		this.weaponHolder = weaponHolder;
	}

	shot() {
		if (this.shooting) return;
		if (!this.weaponHolder) return;

		const weaponObject = this.entity as GameObject;
		const weaponTransform = weaponObject.getComponent(Transform);
		if (!weaponTransform) return;

		const holderGameObject = this.weaponHolder as GameObject;
		const aimingController = holderGameObject.getComponent(AimingController);
		if (!aimingController) return;

		const holderBody = holderGameObject.getComponent(DynamicBody);
		const holderVelocity = holderBody?.velocity ?? new Vector2(0, 0);

		const compensation = holderVelocity.clone().multiplyBy(Time.deltaTime);
		const spawnPosition = weaponTransform.position.clone().add(compensation);
		const mousePosition = MouseManager.getRelativePosition();
		const targetWorldPosition = Cameras.currentCamera
			? (Cameras.currentCamera as OrthographicCamera).getWorldPositionFromScreenPosition(
					mousePosition,
				)
			: null;
		if (!targetWorldPosition) return;

		const distanceToMouse = Vector2.distance(spawnPosition, targetWorldPosition);
		const minPreciseDistance = 0.75;
		let aimDir: Vector2;
		let angleInRads: number;

		if (distanceToMouse <= minPreciseDistance) {
			angleInRads = aimingController.getAngleInRads();
			aimDir = new Vector2(Math.cos(angleInRads), Math.sin(angleInRads)).normalize();
		} else {
			aimDir = targetWorldPosition.clone().substract(spawnPosition).normalize();
			angleInRads = Math.atan2(aimDir.y, aimDir.x);
		}

		const angle = MathUtil.radToDeg(angleInRads);
		const directionX = aimDir.x >= 0 ? 1 : -1;

		const bullet = createBullet(spawnPosition);
		bullet.setZindex(0);
		bullet.getComponent(Transform).rotation = angle;

		const kinematic = bullet.getComponent(KinematicBody);
		const bulletSpeed = 20;
		kinematic.velocity = aimDir.clone().multiplyBy(bulletSpeed);

		const collider = bullet.getComponent(Collider);
		collider.ignoreZIndex = true;
		collider.ignoreEntity(this.weaponHolder);

		const scene = this.entity.getScene();
		if (scene) scene.addEntity(bullet);

		const sprite = bullet.getComponent(Sprite);
		if (sprite) sprite.setDirection({ x: directionX, y: 1 });
	}

	onLateUpdate(): void {
		if (!this.weaponHolder) return;
		const weaponObject = this.entity as GameObject;
		const weaponTransform = weaponObject.getComponent(Transform);
		if (!weaponTransform) return;

		const holderGameObject = this.weaponHolder as GameObject;
		const weaponSprite = weaponObject.getComponent(Sprite);
		if (!weaponSprite) return;

		const arm = holderGameObject.getComponent(PlayerAimingArm)?.getArm();
		if (!arm) return;

		const armTransform = arm.getComponent(Transform);
		const aimingController = holderGameObject.getComponent(AimingController);
		if (!aimingController) return;

		const isAiming = aimingController.isAiming();
		if (!isAiming) {
			this.enableController = false;
			weaponSprite.setVisible(false);
		} else {
			this.enableController = true;
			weaponSprite.setVisible(true);
		}

		const aimingDirectionInX = aimingController.getAimingDirection().x;
		const handOffset = new Vector2(0.4 * aimingDirectionInX, 0.4);
		const rotatedOffset = handOffset.rotate(MathUtil.degToRad(armTransform.rotation));

		weaponTransform.position = armTransform.position.clone().add(rotatedOffset);
		weaponTransform.rotation = armTransform.rotation;
		weaponSprite.setDirection({ x: aimingDirectionInX, y: 1 });
		weaponSprite.setRotation(45 * aimingDirectionInX);
		weaponSprite.setPivot(new Vector2(0.5, 0.2));
		weaponObject.setZindex(1);
	}

	onFixedUpdate(): void {
		if (!this.enableController) return;
		const fireRate = 0.4;
		this.fireCooldown -= Time.fixedDeltaTime;
		if (MouseManager.isLeftClickDown() && this.fireCooldown <= 0) {
			this.shot();
			this.fireCooldown = fireRate;
		}
	}
}
