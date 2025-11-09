import { GameObject } from "engine/common/entities/game-object";
import { ScriptComponent } from "engine/scripts/script-component";
import { HealthComponent } from "./health-component";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { Transform } from "engine/common/components/transform";
import { PlayerLifeController } from "./player-life-controller";
import { Time } from "engine/common/interfaces/time";

export class FallDamage extends ScriptComponent {
	private wasOnGround: boolean = false;
	private startFallPosition = 0;
	onStart(): void {
		const transform = this.entity.getComponent(Transform);
		this.startFallPosition = transform.position.y;
	}

	onUpdate(): void {
		const gameObject = this.entity as GameObject;
		if (!gameObject) return;
		const healthComponent = gameObject.getComponent(HealthComponent);
		const playerLife = gameObject.getComponent(PlayerLifeController);
		const dynamicBody = gameObject.getComponent(DynamicBody);
		if (!healthComponent || !dynamicBody) return;
		const currentPosition = gameObject.transform.position;
		const isOnground = dynamicBody.isOnGround;
		if (isOnground && this.wasOnGround == false) {
			const fallDistance = Math.abs(this.startFallPosition - currentPosition.y);
			if (fallDistance > 6) {
				const damage = fallDistance * 2.5;
				healthComponent.setHealth(healthComponent.getHealth() - damage);
				playerLife.shouldEnableDamageShader = true;
				playerLife.damageShaderStartTime = Time.time;
			}
		}
		if (!isOnground && this.wasOnGround == true) {
			this.startFallPosition = currentPosition.y;
		}
		this.wasOnGround = isOnground;
	}
}
