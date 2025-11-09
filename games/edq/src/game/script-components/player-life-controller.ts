import { ScriptComponent } from "engine/scripts/script-component";
import { HealthComponent } from "./health-component";
import {
	BackgroundCameras,
	EffectsCameras,
	ForegroundCameras,
	WorldCameras,
} from "engine/graphics/cameras/camera-managers";
import { MathUtil } from "engine/math/math-util";
import { Time } from "engine/common/interfaces/time";
import { PlayerController } from "./player-controller";
import { ShieldComponent } from "./shield-component";

export class PlayerLifeController extends ScriptComponent {
	private grayscaleValue: number = 0;
	private fov: number = 1;
	private cameraShakeTimer: number = 0;
	prevHealth = -1;
	prevShield = -1;
	private disableInputStartTime = 0;
	private disableInputDuration = 0.3;
	onStart(): void {
		this.grayscaleValue = 0;
		this.fov = 1;
		this.cameraShakeTimer = 0;
	}

	private changeAllCamerasFOV(fov: number) {
		WorldCameras.currentCamera.setFieldOfView(fov);
		BackgroundCameras.currentCamera.setFieldOfView(fov);
		ForegroundCameras.currentCamera.setFieldOfView(fov);
		EffectsCameras.currentCamera.setFieldOfView(fov);
	}

	private changeAllCamerasRotation(rotation: number) {
		WorldCameras.currentCamera.setRotation(rotation);
		BackgroundCameras.currentCamera.setRotation(rotation);
		ForegroundCameras.currentCamera.setRotation(rotation);
		EffectsCameras.currentCamera.setRotation(rotation);
	}

	setDamage(damage: number) {
		const entity = this.getEntity();
		if (!entity) return;
		const shieldComponent = entity.getComponent(ShieldComponent);
		const healthComponent = entity.getComponent(HealthComponent);
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

	handleDamageCoolDown() {
		const entity = this.entity;
		const playerController = entity.getComponent(PlayerController);
		if (!playerController) return;

		const healthC = entity.getComponent(HealthComponent);
		const health = healthC.getHealth();
		const shieldC = entity.getComponent(ShieldComponent);
		const shield = shieldC.getShield();

		if (this.prevHealth !== -1 && this.prevHealth > health) {
			playerController.enableInputController = false;
			this.disableInputStartTime = Time.time;
		}

		if (this.prevShield !== -1 && this.prevShield > shield) {
			playerController.enableInputController = false;
			this.disableInputStartTime = Time.time;
		}

		if (!playerController.enableInputController) {
			const elapsed = Time.time - this.disableInputStartTime;
			if (elapsed >= this.disableInputDuration) {
				playerController.enableInputController = true;
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

		if (health.getHealth() <= 0) {
			const playerController = entity.getComponent(PlayerController);
			playerController.enabled = false;

			this.cameraShakeTimer += Time.unscaledDeltaTime;
			const shakeSpeed = 1.5; // Oscilaciones por segundo
			const shakeAmount = 5; // Rango de movimiento (radianes)

			const shake =
				Math.sin((this.cameraShakeTimer * shakeSpeed * Math.PI) / 2) * shakeAmount;

			this.changeAllCamerasRotation(shake);
			this.grayscaleValue = MathUtil.lerp(
				this.grayscaleValue,
				100,
				Time.unscaledDeltaTime * 2
			);
			this.grayscaleValue = Math.min(this.grayscaleValue, 100);
			scene.setRenderFilters(`grayscale(${this.grayscaleValue}%)`);

			// Movimiento de cámara de lado a lado
			if (this.grayscaleValue >= 90) {
				// Lento al morir
				const newTimeScale = MathUtil.lerp(Time.timeScale, 0, Time.unscaledDeltaTime * 2);
				Time.timeScale = newTimeScale < 0.01 ? 0 : newTimeScale;
			}

			// FOV zoom suave
			if (this.fov <= 3 && this.grayscaleValue >= 20) {
				this.fov += 0.3 * Time.unscaledDeltaTime;
				this.changeAllCamerasFOV(this.fov);
			}
		}
		this.handleDamageCoolDown();
	}
}
