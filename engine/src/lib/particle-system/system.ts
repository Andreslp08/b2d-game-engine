import { Transform } from "../common/components/transform";
import { Time } from "../common/interfaces/time";
import { Entity } from "../ecs/entity";
import { System } from "../ecs/system";
import { MathUtil } from "../math/math-util";
import Vector2 from "../math/vector2";
import { Culling } from "../performance/culling";
import { CullingTarget } from "../performance/enum/culling-type";
import { ParticleEmitter } from "./component/particle-emitter";
import { Particle } from "./particle";

export class ParticleSystem extends System {
	update(): void {
		const entities = this.getScene().getEntitiesByQuery({
			all: [ParticleEmitter],
			none: [Culling],
		});

		for (const entity of entities) {
			if (Entity.isBeingCulling(entity, [CullingTarget.ALL, CullingTarget.LOGIC])) continue;
			const transform = entity.getComponent(Transform);
			if (!transform) continue;

			const emitters = entity.getComponents(ParticleEmitter);
			for (const emitter of emitters) {
				this.ensurePool(emitter);
				this.emitParticles(transform, emitter);
				this.updateParticles(emitter);
				this.destroyIfComplete(entity, emitter);
			}
		}
	}

	fixedUpdate(): void {}

	private ensurePool(emitter: ParticleEmitter): void {
		if (emitter.particles.length === emitter.maxParticles) return;

		emitter.particles = Array.from({ length: emitter.maxParticles }, () => {
			const particle = new Particle();
			particle.position = new Vector2(0, 0);
			particle.velocity = new Vector2(0, 0);
			particle.acceleration = new Vector2(0, 0);
			particle.rotation = 0;
			particle.angularVelocity = 0;
			particle.startSize = new Vector2(0, 0);
			particle.endSize = new Vector2(0, 0);
			particle.size = new Vector2(0, 0);
			particle.startColor = "#ffffff";
			particle.endColor = "#ffffff";
			particle.color = "#ffffff";
			particle.startOpacity = 0;
			particle.endOpacity = 0;
			particle.opacity = 0;
			particle.age = 0;
			particle.lifetime = 0;
			particle.active = false;
			return particle;
		});
	}

	private emitParticles(transform: Transform, emitter: ParticleEmitter): void {
		if (!emitter.playing) return;

		if (emitter.burstCount > 0 && !emitter.hasBurst) {
			this.spawnParticles(transform, emitter, emitter.burstCount);
			emitter.hasBurst = true;
		}

		if (emitter.emissionRate > 0) {
			emitter.emissionAccumulator += emitter.emissionRate * Time.deltaTime;
			const particlesToSpawn = Math.floor(emitter.emissionAccumulator);
			if (particlesToSpawn > 0) {
				this.spawnParticles(transform, emitter, particlesToSpawn);
				emitter.emissionAccumulator -= particlesToSpawn;
			}
		}

		if (emitter.duration <= 0) return;

		emitter.elapsedTime += Time.deltaTime;
		if (emitter.elapsedTime < emitter.duration) return;

		if (emitter.loop) {
			emitter.elapsedTime = 0;
			emitter.hasBurst = false;
			return;
		}

		emitter.playing = false;
	}

	private spawnParticles(transform: Transform, emitter: ParticleEmitter, amount: number): void {
		for (let i = 0; i < amount; i++) {
			const particle = emitter.particles.find((p) => !p.active);
			if (!particle) return;
			this.spawnParticle(transform, emitter, particle);
		}
	}

	private spawnParticle(transform: Transform, emitter: ParticleEmitter, particle: Particle): void {
		const angle = this.randomRange(emitter.angle.min, emitter.angle.max) * (Math.PI / 180);
		const speed = this.randomRange(emitter.speed.min, emitter.speed.max);
		const origin = emitter.localSpace
			? emitter.positionOffset.clone()
			: transform.position.clone().add(emitter.positionOffset);

		particle.active = true;
		particle.age = 0;
		particle.lifetime = this.randomRange(emitter.lifetime.min, emitter.lifetime.max);
		particle.position = origin;
		particle.velocity = new Vector2(Math.cos(angle) * speed, Math.sin(angle) * speed);
		particle.acceleration = emitter.gravity.clone();
		particle.rotation = 0;
		particle.angularVelocity = 0;
		particle.startSize = this.randomVectorRange(emitter.size.startMin, emitter.size.startMax);
		particle.endSize = this.randomVectorRange(emitter.size.endMin, emitter.size.endMax);
		particle.size = particle.startSize.clone();
		particle.startColor = this.pickColor(emitter.startColors);
		particle.endColor = this.pickColor(emitter.endColors);
		particle.color = particle.startColor;
		particle.startOpacity = emitter.opacity.start;
		particle.endOpacity = emitter.opacity.end;
		particle.opacity = particle.startOpacity;
	}

	private updateParticles(emitter: ParticleEmitter): void {
		for (const particle of emitter.particles) {
			if (!particle.active) continue;

			particle.age += Time.deltaTime;
			if (particle.age >= particle.lifetime) {
				particle.active = false;
				continue;
			}

			const t = particle.lifetime > 0 ? particle.age / particle.lifetime : 1;
			particle.velocity.add(particle.acceleration.clone().multiplyBy(Time.deltaTime));
			particle.position.add(particle.velocity.clone().multiplyBy(Time.deltaTime));
			particle.rotation += particle.angularVelocity * Time.deltaTime;
			particle.size = MathUtil.lerpVector(particle.startSize, particle.endSize, t);
			particle.opacity = MathUtil.lerp(particle.startOpacity, particle.endOpacity, t);
			particle.color = MathUtil.lerpHexColor(particle.startColor, particle.endColor, t);
		}
	}

	private destroyIfComplete(entity: Entity, emitter: ParticleEmitter): void {
		if (!emitter.destroyOnComplete || emitter.playing) return;
		if (emitter.particles.some((particle) => particle.active)) return;
		entity.destroy();
	}

	private randomRange(min: number, max: number): number {
		return min + Math.random() * (max - min);
	}

	private randomVectorRange(min: Vector2, max: Vector2): Vector2 {
		return new Vector2(this.randomRange(min.x, max.x), this.randomRange(min.y, max.y));
	}

	private pickColor(colors: string[]): string {
		if (!colors || colors.length === 0) return "#ffffff";
		return colors[Math.floor(Math.random() * colors.length)];
	}



	

}

