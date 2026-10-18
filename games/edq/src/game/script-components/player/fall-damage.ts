
import { GameObject } from "@b2d-engine/core/common/entities/game-object";
import { ScriptComponent } from "@b2d-engine/core/scripts/script-component";
import { HealthComponent } from "../shared/health-component";
import { DynamicBody } from "@b2d-engine/core/physics/components/dynamic-body";
import { Transform } from "@b2d-engine/core/common/components/transform";
import { PlayerLifeController } from "./player-life-controller";

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
				playerLife.setDamage(damage, "health-only");
			}
		}
		if (!isOnground && this.wasOnGround == true) {
			this.startFallPosition = currentPosition.y;
		}
		this.wasOnGround = isOnground;
	}
}
