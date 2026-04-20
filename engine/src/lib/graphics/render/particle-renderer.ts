import { Transform } from "../../common/components/transform";
import { ParticleEmitter } from "../../particle-system/component/particle-emitter";
import { ParticleRenderType } from "../../particle-system/enum/enum";
import { Particle } from "../../particle-system/particle";
import { Renderer } from "./render";

export class ParticleRenderer extends Renderer {
	render(renderingContext: CanvasRenderingContext2D): void {
		if (!this.entity) return;
		const transform = this.entity.getComponent(Transform);
		if (!transform) return;

		const particleEmitters = this.entity.getComponents(ParticleEmitter);
		for (const particleEmitter of particleEmitters) {
			for (const particle of particleEmitter.particles) {
				if (!particle.active) continue;
				this.renderParticle(renderingContext, transform, particleEmitter, particle);
			}
		}
	}

	private renderParticle(
		renderingContext: CanvasRenderingContext2D,
		transform: Transform,
		emitter: ParticleEmitter,
		particle: Particle
	): void {
		const position = emitter.localSpace
			? transform.position.clone().add(particle.position)
			: particle.position;

		renderingContext.save();
		renderingContext.globalAlpha = particle.opacity;
		renderingContext.fillStyle = particle.color;
		renderingContext.translate(position.x, position.y);
		renderingContext.rotate((particle.rotation * Math.PI) / 180);

		if (emitter.particleRenderType === ParticleRenderType.CIRCLE) {
			this.renderCircle(renderingContext, particle);
		} else {
			this.renderRectangle(renderingContext, particle);
		}

		renderingContext.restore();
	}

	private renderCircle(renderingContext: CanvasRenderingContext2D, particle: Particle): void {
		const radius = Math.max(particle.size.x, particle.size.y) / 2;
		renderingContext.beginPath();
		renderingContext.arc(0, 0, radius, 0, Math.PI * 2);
		renderingContext.fill();
	}

	private renderRectangle(renderingContext: CanvasRenderingContext2D, particle: Particle): void {
		renderingContext.fillRect(
			-particle.size.x / 2,
			-particle.size.y / 2,
			particle.size.x,
			particle.size.y
		);
	}
}
