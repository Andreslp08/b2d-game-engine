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
import { createRocket } from "../../prefabs/rocket";
import { AimingController } from "../player/aiming-controller";
import { PlayerAimingArm } from "../player/player-aiming-arm";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { InventoryComponent } from "../../items/components/inventory-component";
import { EquipmentComponent } from "../../items/components/equipment-component";
import { itemRegistry } from "../../items/item-catalog";
import type { WeaponDefinition } from "../../items/definitions/item-definition";
import { KeyBoardManager } from "engine/input/interfaces/keyboard-manager";
import { ParticleEmitter } from "engine/particle-system/component/particle-emitter";
import { ParticleRenderType } from "engine/particle-system/enum/enum";

/** Synchronizes the equipped inventory weapon with its visual GameObject. */
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

	onUpdate(): void {
		if (!this.weapon) return;
		const inventory = this.entity.getComponent(InventoryComponent);
		const equipment = this.entity.getComponent(EquipmentComponent);
		const referenceId = equipment?.getEquippedReferenceId();
		const entry = referenceId && inventory ? inventory.inventory.get(referenceId) : undefined;
		const definition = entry && inventory
			? inventory.inventory.getDefinition(entry.definitionId)
			: undefined;
		const weaponController = this.weapon.getComponent(WeaponController);
		if (!weaponController) return;
		if (definition?.type === "weapon") weaponController.setDefinition(definition.id);
		weaponController.setActive(definition?.type === "weapon");
	}

	onDestroy(): void {
		const scene = this.entity.getScene();
		if (scene) scene.destroyEntity(this.weapon);
	}
}

/** Handles weapon aiming, firing, projectile creation, ammo, and reloads. */
export class WeaponController extends ScriptComponent {
	weaponHolder: GameObject | null = null;
	fireCooldown = 0;
	enableController = true;
	private weaponEffectDuration = 0.1;
	private weaponEffectRemainingTime = 0;
	private reloadRemainingTime = 0;
	private reloading = false;
	private reloadDefinitionId?: string;
	private previousReloadKey = false;
	definitionId: string;

	constructor(definitionId = "desert_eagle") {
		super();
		this.definitionId = definitionId;
	}
	weaponEffectSprite:Sprite = new Sprite({
		image: AssetsManager.getImageByName("spritesheet:gunfire-effect1"),
		framePosition: new Vector2(0, 0),
		frameSize: { w: 951, h: 616 },
		scale: new Vector2(0.7, 0.7),
	});

	onStart(): void {
		this.entity.addComponent(this.weaponEffectSprite);
		this.weaponEffectSprite.setVisible(false);
	}

	setWeaponHolder(weaponHolder: GameObject) {
		if (weaponHolder.hasTag("weapon")) return;
		if (weaponHolder.hasComponent(WeaponController)) return;
		if (!weaponHolder.hasComponent(WeaponHolder)) return;
		this.weaponHolder = weaponHolder;
	}

	/** Enables or disables the visual weapon and its firing behavior. */
	setActive(active: boolean): void {
		this.enableController = active;
		if (!active) {
			this.cancelReload();
			this.weaponEffectRemainingTime = 0;
			this.weaponEffectSprite.setVisible(false);
			this.entity.getComponent(Sprite)?.setVisible(false);
		}
	}

	/** Changes the data definition used by the shared temporary weapon visual. */
	setDefinition(definitionId: string): void {
		if (this.definitionId !== definitionId) this.cancelReload();
		this.definitionId = definitionId;
	}

	private getDefinition(): WeaponDefinition {
		const definition = itemRegistry.get(this.definitionId);
		if (definition.type !== "weapon") throw new Error(`${this.definitionId} is not a weapon`);
		return definition;
	}

	private getEquippedWeaponState() {
		const inventory = this.weaponHolder?.getComponent(InventoryComponent);
		const equipment = this.weaponHolder?.getComponent(EquipmentComponent);
		const referenceId = equipment?.getEquippedReferenceId();
		const entry = referenceId && inventory ? inventory.inventory.get(referenceId) : undefined;
		return { inventory, entry, state: entry?.instance?.state };
	}

	private consumeRound(definition: WeaponDefinition): boolean {
		const { state } = this.getEquippedWeaponState();
		if (!state || state.currentAmmo <= 0) {
			this.startReload(definition);
			console.log("[Weapon] No ammunition in magazine", {
				definitionId: definition.id,
				name: definition.name,
				currentAmmo: state?.currentAmmo ?? 0,
			});
			return false;
		}
		state.currentAmmo -= 1;
		return true;
	}

	private logShot(definition: WeaponDefinition): void {
		const { inventory, state } = this.getEquippedWeaponState();
		console.log("[Weapon] Shot", {
			id: definition.id,
			name: definition.name,
			type: definition.type,
			weaponType: definition.weaponType,
			ammoType: definition.ammoType,
			baseDamage: definition.baseDamage,
			fireRate: definition.fireRate,
			range: definition.range,
			projectileCount: definition.projectileCount,
			spreadDegrees: definition.spreadDegrees,
			projectileSpeed: definition.projectileSpeed,
			reloadTime: definition.reloadTime,
			magazineSize: definition.magazineSize,
			currentAmmo: state?.currentAmmo ?? 0,
			remainingAmmo: inventory?.inventory.countAmmo(definition.ammoType) ?? 0,
		});
	}

	/** Returns whether the current weapon is in its timed reload phase. */
	isReloading(): boolean {
		return this.reloading;
	}

	/** Returns whether the equipped weapon has no magazine or reserve ammunition. */
	isOutOfAmmo(): boolean {
		if (!this.enableController) return false;
		const definition = this.getDefinition();
		const { inventory, state } = this.getEquippedWeaponState();
		return !!state &&
			state.currentAmmo === 0 &&
			(inventory?.inventory.countAmmo(definition.ammoType) ?? 0) === 0;
	}

	private cancelReload(): void {
		this.reloading = false;
		this.reloadRemainingTime = 0;
		this.reloadDefinitionId = undefined;
	}

	/** Starts a timed reload when the magazine and reserve allow it. */
	private startReload(definition: WeaponDefinition): void {
		if (this.reloading) return;
		const { inventory, state } = this.getEquippedWeaponState();
		const reserveAmmo = inventory?.inventory.countAmmo(definition.ammoType) ?? 0;
		if (!state || state.currentAmmo >= definition.magazineSize || reserveAmmo <= 0) {
			console.log("[Weapon] Reload unavailable", {
				id: definition.id,
				currentAmmo: state?.currentAmmo ?? 0,
				magazineSize: definition.magazineSize,
				remainingAmmo: reserveAmmo,
			});
			return;
		}
		this.reloading = true;
		this.reloadRemainingTime = definition.reloadTime;
		this.reloadDefinitionId = definition.id;
		console.log("[Weapon] Reload started", {
			id: definition.id,
			name: definition.name,
			reloadTime: definition.reloadTime,
			currentAmmo: state.currentAmmo,
			remainingAmmo: reserveAmmo,
		});
	}

	/** Transfers reserve ammunition into the equipped weapon instance. */
	private finishReload(): void {
		const definition = this.getDefinition();
		const { inventory, state } = this.getEquippedWeaponState();
		if (!state || this.reloadDefinitionId !== definition.id || !inventory) {
			this.cancelReload();
			return;
		}
		const missingAmmo = definition.magazineSize - state.currentAmmo;
		const availableAmmo = inventory.inventory.countAmmo(definition.ammoType);
		const loadedAmmo = Math.min(missingAmmo, availableAmmo);
		if (loadedAmmo > 0) {
			inventory.inventory.removeAmmo(definition.ammoType, loadedAmmo);
			state.currentAmmo += loadedAmmo;
		}
		this.cancelReload();
		console.log("[Weapon] Reload completed", {
			id: definition.id,
			name: definition.name,
			currentAmmo: state.currentAmmo,
			remainingAmmo: inventory.inventory.countAmmo(definition.ammoType),
		});
	}

	/** Applies the equipped weapon's visual definition to the shared weapon entity. */
	private applyWeaponVisual(
		definition: WeaponDefinition,
		weaponTransform: Transform,
		weaponSprite: Sprite,
	): void {
		const visual = definition.weaponVisual;
		const image = AssetsManager.getImageByName(visual.image);
		const imageSize = { w: image.nativeElement.naturalWidth, h: image.nativeElement.naturalHeight };
		weaponTransform.size = new Vector2(visual.size.x, visual.size.y);
		weaponSprite.setImage(image);
		weaponSprite.setFramePosition(new Vector2(0, 0));
		weaponSprite.setFrameSize(imageSize);
		weaponSprite.setSourceSize(imageSize);
		weaponSprite.setSpriteSourceSize({ x: 0, y: 0, ...imageSize });
		weaponSprite.setScale(new Vector2(visual.scale.x, visual.scale.y));
		weaponSprite.setAnchor(new Vector2(visual.anchor.x, visual.anchor.y));
		weaponSprite.setPivot(new Vector2(visual.pivot.x, visual.pivot.y));
	}

	/** Returns the configured projectile spawn point using the weapon sprite's transform. */
	private getMuzzlePosition(
		weapon: Transform,
		sprite: Sprite,
		definition: WeaponDefinition,
	): Vector2 {
		const pivot = sprite.getPivot();
		const scale = sprite.getScale();
		const flip = sprite.getDirection();
		const spawnPoint = definition.weaponVisual.projectileSpawnPoint;
		return new Vector2(
			(spawnPoint.x - pivot.x) * weapon.size.x * scale.x * flip.x,
			(spawnPoint.y - pivot.y) * weapon.size.y * scale.y * flip.y,
		).rotate(MathUtil.degToRad(weapon.rotation + sprite.getRotation()))
			.add(weapon.position).substract(sprite.getAnchor());
	}

	private emitRocketMuzzleEffect(position: Vector2, rotation: number): void {
		const scene = this.entity.getScene();
		if (!scene) return;

		const effect = new GameObject({
			position: position.clone(),
			rotation,
			size: new Vector2(1, 1),
		});
		const emitter = new ParticleEmitter();
		emitter.particleRenderType = ParticleRenderType.CIRCLE;
		emitter.maxParticles = 18;
		emitter.burstCount = emitter.maxParticles;
		emitter.duration = 0.35;
		emitter.loop = false;
		emitter.playing = true;
		emitter.localSpace = true;
		emitter.destroyOnComplete = true;
		emitter.lifetime = { min: 0.08, max: 0.3 };
		emitter.speed = { min: 1.2, max: 3 };
		emitter.angle = { min: -25, max: 25 };
		emitter.gravity = new Vector2(0, 0);
		emitter.size = {
			startMin: new Vector2(0.06, 0.06),
			startMax: new Vector2(0.16, 0.16),
			endMin: new Vector2(0.01, 0.01),
			endMax: new Vector2(0.03, 0.03),
		};
		emitter.opacity = { start: 0.9, end: 0 };
		emitter.startColors = ["#fff2a8", "#ff9f1c"];
		emitter.endColors = ["#ef4444", "#7f1d1d"];
		effect.addComponent(emitter);
		scene.addEntity(effect);
	}

	/** Fires one weapon action and consumes one round from the magazine. */
	shot() {
		if (!this.weaponHolder) return;

		const weaponObject = this.entity as GameObject;
		const weaponTransform = weaponObject.getComponent(Transform);
		if (!weaponTransform) return;
		const weaponSprite = weaponObject.getComponent(Sprite);
		if (!weaponSprite) return;
		const definition = this.getDefinition();
		console.log("[Weapon] Firing", definition);
		this.applyWeaponVisual(definition, weaponTransform, weaponSprite);

		const holderGameObject = this.weaponHolder as GameObject;
		const aimingController = holderGameObject.getComponent(AimingController);
		if (!aimingController) return;

		const holderBody = holderGameObject.getComponent(DynamicBody);
		const holderVelocity = holderBody?.velocity ?? new Vector2(0, 0);

		const compensation = holderVelocity.clone().multiplyBy(Time.deltaTime);
		const spawnPosition = this.getMuzzlePosition(weaponTransform, weaponSprite, definition).add(compensation);
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
		if (!this.consumeRound(definition)) return;
		this.logShot(definition);
		const { state } = this.getEquippedWeaponState();
		if (state?.currentAmmo === 0) this.startReload(definition);
		const scene = this.entity.getScene();
		if (!scene) return;
		const projectileCount = Math.max(1, definition.projectileCount);
		for (let index = 0; index < projectileCount; index++) {
			const spread = projectileCount === 1
				? 0
				: -definition.spreadDegrees / 2 + (definition.spreadDegrees * index) / (projectileCount - 1);
			const direction = aimDir.clone().rotate(MathUtil.degToRad(spread)).normalize();
			const projectileAngle = angleInRads + MathUtil.degToRad(spread);
			const bullet = definition.weaponType === "rocket_launcher"
				? createRocket(
					spawnPosition.clone(),
					definition.baseDamage,
					definition.range,
					definition.projectile,
					definition.explosionRadius ?? 2.5,
				)
				: createBullet(
					spawnPosition.clone(),
					definition.baseDamage,
					definition.range,
					definition.projectile,
				);
			bullet.setZindex(0);
			bullet.getComponent(Transform).rotation = MathUtil.radToDeg(projectileAngle);

			const kinematic = bullet.getComponent(KinematicBody);
			kinematic.velocity = direction.multiplyBy(definition.projectileSpeed);

			const collider = bullet.getComponent(Collider);
			collider.ignoreZIndex = true;
			collider.ignoreEntity(this.weaponHolder);
			for (const existingEntity of scene.getEntitiesAsArray()) {
				if (!existingEntity.hasTag("bullet")) continue;
				const existingCollider = existingEntity.getComponent(Collider);
				if (!existingCollider) continue;
				collider.ignoreEntity(existingEntity);
				existingCollider.ignoreEntity(bullet);
			}
			scene.addEntity(bullet);

			// Transform.rotation already supplies the projectile's full rotation.
		}

		this.weaponEffectRemainingTime = this.weaponEffectDuration;
		this.weaponEffectSprite.setVisible(true);
		if (definition.weaponType === "rocket_launcher") {
			this.emitRocketMuzzleEffect(spawnPosition, angleInRads);
		}
	}

	onUpdate(): void {
		if (this.weaponEffectRemainingTime <= 0) return;

		this.weaponEffectRemainingTime -= Time.deltaTime;
		if (this.weaponEffectRemainingTime <= 0) {
			this.weaponEffectRemainingTime = 0;
			this.weaponEffectSprite.setVisible(false);
		}
	}

	onLateUpdate(): void {
		if (!this.weaponHolder) return;
		const weaponObject = this.entity as GameObject;
		const weaponTransform = weaponObject.getComponent(Transform);
		if (!weaponTransform) return;

		const holderGameObject = this.weaponHolder as GameObject;
		const weaponSprite = weaponObject.getComponent(Sprite);
		if (!weaponSprite) return;
		const definition = this.getDefinition();
		const visual = definition.weaponVisual;
		this.applyWeaponVisual(definition, weaponTransform, weaponSprite);
		if (!this.enableController) {
			weaponSprite.setVisible(false);
			return;
		}

		const arm = holderGameObject.getComponent(PlayerAimingArm)?.getArm();
		if (!arm) return;

		const armTransform = arm.getComponent(Transform);
		const aimingController = holderGameObject.getComponent(AimingController);
		if (!aimingController) return;

		const isAiming = aimingController.isAiming();
		if (!isAiming) {
			this.enableController = false;
			weaponSprite.setVisible(false);
			this.weaponEffectRemainingTime = 0;
			this.weaponEffectSprite.setVisible(false);
		} else {
			this.enableController = true;
			weaponSprite.setVisible(true);
		}

		const aimingDirectionInX = aimingController.getAimingDirection().x;
		const handOffset = new Vector2(
			visual.handOffset.x * aimingDirectionInX,
			visual.handOffset.y,
		);
		const rotatedOffset = handOffset.rotate(MathUtil.degToRad(armTransform.rotation));

		weaponTransform.position = armTransform.position.clone().add(rotatedOffset);
		weaponTransform.rotation = armTransform.rotation;
		weaponSprite.setDirection({ x: aimingDirectionInX, y: 1 });
		weaponSprite.setRotation(visual.rotationOffsetDegrees * aimingDirectionInX);
		weaponObject.setZindex(1);
		this.weaponEffectSprite.setDirection({ x: aimingDirectionInX, y: 1 });
		this.weaponEffectSprite.setRotation(45 * aimingDirectionInX);
		this.weaponEffectSprite.setPivot(new Vector2(-0.4, 0.6));
	}

	onFixedUpdate(): void {
		if (!this.enableController) return;
		const reloadKey = KeyBoardManager.keyDown("r");
		const reloadPressed = reloadKey && !this.previousReloadKey;
		this.previousReloadKey = reloadKey;
		const definition = this.getDefinition();
		if (reloadPressed) this.startReload(definition);
		if (this.reloading) {
			this.reloadRemainingTime -= Time.fixedDeltaTime;
			if (this.reloadRemainingTime <= 0) this.finishReload();
			return;
		}
		const aimingController = this.weaponHolder?.getComponent(AimingController);
		if (!aimingController?.isAiming()) return;
		const fireRate = definition.fireRate;
		this.fireCooldown -= Time.fixedDeltaTime;
		if (MouseManager.isLeftClickDown() && this.fireCooldown <= 0) {
			this.shot();
			this.fireCooldown = fireRate;
		}
	}
}
