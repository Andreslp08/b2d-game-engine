import { GameObject } from "engine/common/entities/game-object";
import { ScriptComponent } from "engine/scripts/script-component";
import { HealthComponent } from "./health-component";
import { RigidBody } from "engine/physics/components/rigid-body";

export class FallDamage extends ScriptComponent {
	private wasOnGround: boolean = false;
	private startFallPosition = 0;
	onStart(): void {}

	onUpdate(deltaTime: number): void {
		const gameObject = this.entity as GameObject;
		if (!gameObject) return;
		const healthComponent = gameObject.getComponent(HealthComponent);
		const rb = gameObject.getComponent(RigidBody);
		if (!healthComponent || !rb) return;
		const currentPosition = gameObject.transform.position;
		const isOnground = rb.isOnGround;
		if (isOnground && this.wasOnGround == false) {
			const fallDistance = Math.abs(this.startFallPosition - currentPosition.y);
			if (fallDistance > 6) {
				const damage = fallDistance * 2.5;
				healthComponent.setHealth(healthComponent.getHealth() - damage);
			}
		}
		if (!isOnground && this.wasOnGround == true) {
			this.startFallPosition = currentPosition.y;
		}
		this.wasOnGround = isOnground;
	}
}
