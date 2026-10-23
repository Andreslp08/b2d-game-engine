import { ScriptComponent } from "@b2d-engine/core/scripts/script-component";
import { HealthComponent } from "../shared/health-component";
import { Cameras } from "@b2d-engine/core/graphics/cameras/camera-manager";
import { MathUtil } from "@b2d-engine/core/math/math-util";
import { Time } from "@b2d-engine/core/common/interfaces/time";
import { PlayerInputController } from "./player-input-controller";
import { ShieldComponent } from "../shared/shield-component";
import { DamageFlashEffect } from "../shared/damage-flash-effect";
import { GameEvent } from "@b2d-engine/core/common/events/game-event";
import { useGameStore } from "../../../store/store";
import { PlayerSpriteController } from "./sprite-controller";
import { GAME_FOV } from "../../config/constants";
import { Engine } from "@b2d-engine/core";

type DamageMode = "shield-first" | "health-only";

export class PlayerLifeController extends ScriptComponent {
	private grayscaleValue: number = 0;
	private fov: number = 1;
	private cameraShakeTimer: number = 0;
	private damageShakeTimer = 0;
	private isDamageShakeActive = false;
	private readonly damageShakeDuration = 0.3;
	private readonly damageShakeOscillations = 4; // Idas y vueltas de la cámara
	private readonly damageShakeAmplitude = 2; // Rotación máxima
	prevHealth = -1;
	prevShield = -1;
	private disableInputStartTime = 0;
	private disableInputDuration = 0.3;
	private damageInputLocked = false;
	private controllerDisabledOnDeath = false;

	isDead = false;
	onPlayerDie = new GameEvent<void>();
	onPlayerDamaged = new GameEvent<number>();

	onStart(): void {
		this.grayscaleValue = 0;
		this.fov = 1;
		this.cameraShakeTimer = 0;
		this.damageShakeTimer = 0;
		this.isDamageShakeActive = false;
		Engine.canvas.style.filter = "";
	}

	private changeCameraFOV(fov: number) {
		Cameras.currentCamera.setFieldOfView(fov);
	}

	private changeCameraRotation(rotation: number) {
		Cameras.currentCamera.setRotation(rotation);
	}

	setDamage(damage: number, mode: DamageMode = "shield-first") {
		if (this.isDead) return;

		const entity = this.getEntity();
		if (!entity) return;

		const shieldComponent = entity.getComponent(ShieldComponent);
		const healthComponent = entity.getComponent(HealthComponent);

		if (mode === "health-only") {
			if (healthComponent) {
				healthComponent.setDamage(damage);
			}
		} else if (shieldComponent && shieldComponent.getShield() > 0) {
			shieldComponent.setDamage(damage);
		} else if (healthComponent) {
			healthComponent.setDamage(damage);
		}

		this.entity.getComponent(DamageFlashEffect)?.play();
		this.onPlayerDamaged.emit(this.damageShakeDuration);

		if (healthComponent && healthComponent.getHealth() <= 0) {
			this.isDead = true;
			entity.getComponent(PlayerSpriteController)?.showDeathPose();
			const playerInput = entity.getComponent(PlayerInputController);
			if (playerInput && !this.controllerDisabledOnDeath) {
				playerInput.disableAll();
				this.controllerDisabledOnDeath = true;
			}
			this.onPlayerDie.emit();
			useGameStore.getState().setCurrentUI("arcade", "gameOverMenu");
		} else {
			this.damageShakeTimer = 0;
			this.isDamageShakeActive = true;
		}
	}

	handleDamageCoolDown() {
		const entity = this.entity;
		const playerInput = entity.getComponent(PlayerInputController);
		if (!playerInput) return;

		const healthC = entity.getComponent(HealthComponent);
		const health = healthC.getHealth();
		const shieldC = entity.getComponent(ShieldComponent);
		const shield = shieldC.getShield();

		if (this.prevHealth !== -1 && this.prevHealth > health) {
			playerInput.disableAll();
			this.disableInputStartTime = Time.time;
			this.damageInputLocked = true;
		}

		if (this.prevShield !== -1 && this.prevShield > shield) {
			playerInput.disableAll();
			this.disableInputStartTime = Time.time;
			this.damageInputLocked = true;
		}

		if (this.damageInputLocked) {
			const elapsed = Time.time - this.disableInputStartTime;
			if (elapsed >= this.disableInputDuration) {
				playerInput.enableAll();
				this.damageInputLocked = false;
			}
		}

		this.prevHealth = health;
		this.prevShield = shield;
	}

	onUpdate(): void {
		const entity = this.getEntity();
		if (!entity) return;

		const health = entity.getComponent(HealthComponent);
		if (!health) return;

		const scene = entity.getScene();
		if (!scene) return;
		if (!this.isDead) {
			const healthRatio = health.getHealth() / health.getMaxHealth();
			Engine.canvas.style.filter = healthRatio > 0 && healthRatio < 0.4 ? "grayscale(40%)" : "";
		}
		if (this.isDamageShakeActive && !this.isDead) {
			this.damageShakeTimer += Time.unscaledDeltaTime;
			const shakeProgress = this.damageShakeTimer / this.damageShakeDuration;
			if (shakeProgress >= 1) {
				this.isDamageShakeActive = false;
				this.changeCameraRotation(0);
			} else {
				const oscillationAngle = shakeProgress * Math.PI * 2 * this.damageShakeOscillations;
				const oscillation = Math.sin(oscillationAngle);
				const remainingIntensity = 1 - shakeProgress;
				const shake = oscillation * this.damageShakeAmplitude * remainingIntensity;
				this.changeCameraRotation(shake);
			}
		}

		if (health.getHealth() <= 0) {
			const playerInput = entity.getComponent(PlayerInputController);
			if (playerInput && !this.controllerDisabledOnDeath) {
				playerInput.disableAll();
				this.controllerDisabledOnDeath = true;
			}

			this.cameraShakeTimer += Time.unscaledDeltaTime;
			const shakeSpeed = 1.5; // Oscilaciones por segundo
			const shakeAmount = 5; // Rango de movimiento (radianes)

			const shake =
				Math.sin((this.cameraShakeTimer * shakeSpeed * Math.PI) / 2) * shakeAmount;

			this.changeCameraRotation(shake);
			this.grayscaleValue = MathUtil.lerp(
				this.grayscaleValue,
				100,
				Time.unscaledDeltaTime * 2,
			);
			this.grayscaleValue = Math.min(this.grayscaleValue, 100);
			Engine.canvas.style.filter = `grayscale(${this.grayscaleValue}%)`;

			if (this.fov <=4 ) {
				this.fov += 0.1 * Time.unscaledDeltaTime;
				this.changeCameraFOV(this.fov);
			}
		}

		if (!this.isDead) this.handleDamageCoolDown();
	}
}
