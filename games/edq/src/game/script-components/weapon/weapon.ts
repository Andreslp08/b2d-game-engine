import { Transform } from "engine/common/components/transform";
import { GameObject } from "engine/common/entities/game-object";
import { MouseManager } from "engine/input/mouse-manager";
import { MathUtil } from "engine/math/math-util";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";
import { ScriptComponent } from "engine/scripts/script-component";
import { BulletController, createBullet } from "../../prefabs/bullet";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import { Time } from "engine/common/interfaces/time";
import { PlayerAimingArm } from "../player/player-aiming-arm";
import { AimingController } from "../player/aiming-controller";
import { KinematicBody } from "engine/physics/components/kinematic-body";

export class WeaponHolder extends ScriptComponent {
	weapon: GameObject | null = null;

	attachWeapon(weapon: GameObject) {
		// console.log(weapon)
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
	shooting: boolean = false;
	fireCooldown: number = 0;
	enableController: boolean = true;

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
		const angle = aimingController.getAngleInDeg();
		if (!aimingController) return;

		const holderBody = holderGameObject.getComponent(DynamicBody);
		const holderVelocity = holderBody?.velocity ?? new Vector2(0, 0);

		// Dirección del disparo
		const directionX = aimingController.getAimingDirection().x;
		const aimDir = new Vector2(
			Math.cos(MathUtil.degToRad(directionX * weaponTransform.rotation + 45)),
			Math.sin(MathUtil.degToRad(directionX * weaponTransform.rotation + 45)),
		).normalize();

		// 💡 Compensar posición inicial con el movimiento del jugador
		// Si el jugador se mueve hacia la derecha, la bala nacerá unos píxeles más adelante
		const compensation = holderVelocity.clone().multiplyBy(Time.deltaTime);
		const spawnPosition = weaponTransform.position.clone().add(compensation);

		// Crear bala con cuerpo Kinematic
		const bullet = createBullet(spawnPosition);
		bullet.setZindex(0);
		bullet.getComponent(Transform).rotation = directionX == 1 ? angle : angle - 180;
		const kinematic = bullet.getComponent(KinematicBody);
		const bulletSpeed = 20;
		kinematic.velocity = aimDir.multiply(new Vector2(directionX * bulletSpeed, bulletSpeed));

		// Colisiones
		const collider = bullet.getComponent(Collider);
		collider.ignoreZIndex = true;
		collider.ignoreEntity(this.weaponHolder);
		const holderCollider = this.weaponHolder.getComponent(Collider);
		if (holderCollider) holderCollider.ignoreEntity(bullet);

		// Añadir al mundo
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
		if (!holderGameObject) return;
		const holderTransform = holderGameObject.getComponent(Transform);
		if (!holderTransform) return;
		const weaponSprite = weaponObject.getComponent(Sprite);
		if (!weaponSprite) return;
		const arm = holderGameObject.getComponent(PlayerAimingArm)?.arm;
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

		// Offset local de la mano (en el espacio del brazo)
		const handOffset = new Vector2(0.4 * aimingDirectionInX, 0.4); // ajusta visualmente

		// Rota el offset según la rotación actual del brazo
		const rotatedOffset = handOffset.rotate(MathUtil.degToRad(armTransform.rotation));

		// Aplica posición y rotación finales
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
