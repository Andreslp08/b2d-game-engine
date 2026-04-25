import { GameEvent } from "engine/common/events/game-event";
import type { Entity } from "engine/ecs/entity";
import { ScriptComponent } from "engine/scripts/script-component";
import { ShieldComponent } from "../shared/shield-component";
import { HealthComponent } from "../shared/health-component";
import { DeathParticleEffect } from "../shared/death-particle-effect";
import { DamageFlashEffect } from "../shared/damage-flash-effect";

interface DamageResolver {
	resolve(payload: DamagePayload, entity: Entity): number;
}

type DamagePayload = {
	damage: number;
	source: Entity;
	type: string;
};

type DamageTakenPayload = DamagePayload & {
	target: Entity;
	finalDamage: number;
};

type DeathPayload = {
	killer: Entity;
	target: Entity;
};

export class Damageable extends ScriptComponent {
	onDamageTaken = new GameEvent<DamageTakenPayload>();
	onDeath = new GameEvent<DeathPayload>();
	private readonly damageTakenListener = () => {
		this.handleDamageTaken();
	};
	private readonly deathListener = () => {
		this.handleDeath();
	};

	constructor(private resolver?: DamageResolver) {
		super();

		this.onDamageTaken.subscribe(this.damageTakenListener);
		this.onDeath.subscribe(this.deathListener);
	}

	private handleDeath() {
		const deathParticleEffect = this.entity.getComponent(DeathParticleEffect);
		if (!deathParticleEffect) return;
		deathParticleEffect.play();
		this.entity.destroy();
	}

	private handleDamageTaken() {
		const damageFlashEffect = this.entity.getComponent(DamageFlashEffect);
		if (!damageFlashEffect) return;
		damageFlashEffect.play();
	}

	applyDamage(payload: DamagePayload) {
		if (!this.entity) return;

		const finalDamage = this.resolver
			? this.resolver.resolve(payload, this.entity)
			: payload.damage;

		const shield = this.entity.getComponent(ShieldComponent);
		const health = this.entity.getComponent(HealthComponent);

		if (shield && shield.getShield() > 0) {
			shield.setDamage(finalDamage);
		} else if (health) {
			health.setDamage(finalDamage);
		}

		this.onDamageTaken.emit({
			...payload,
			target: this.entity,
			finalDamage,
		});

		if (health && health.getHealth() <= 0) {
			this.onDeath.emit({ killer: payload.source, target: this.entity });
		}
	}

	onDestroy(): void {
		this.onDamageTaken.unsubscribe(this.damageTakenListener);
		this.onDeath.unsubscribe(this.deathListener);
	}
}
