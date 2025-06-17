import  { Entity } from "engine/ecs/entity";
import { ScriptComponent } from "engine/scripts/script-component";

export class ShieldComponent extends ScriptComponent {
	constructor(
		entity: Entity,
		private shield: number = 100,
		private maxShield: number = 100,
	) {
		super(entity);
		this.shield = shield;
	}

	public setShield(shield: number) {
		if (shield < 0.1) {
			shield = 0;
		}
		if (shield > this.maxShield) {
			shield = this.maxShield;
		}
		this.shield = shield;
	}


	public setDamage(damage: number) {
		this.setShield(this.shield - damage);
	}
	
	public getShield(): number {
		return this.shield;
	}

	public getMaxShield(): number {
		return this.maxShield;
	}

	public setMaxShield(max: number) {
		this.maxShield = max;
	}

	onUpdate(): void {
	
	}


	onLateUpdate(): void {}
}
