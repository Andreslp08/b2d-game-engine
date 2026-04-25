import { Transform } from "engine/common/components/transform";
import { GameObject } from "engine/common/entities/game-object";
import { RenderLayerTypes } from "engine/graphics/enum/render-layer-types.enum";
import Vector2 from "engine/math/vector2";
import { ParticleEmitter } from "engine/particle-system/component/particle-emitter";
import { ParticleRenderType } from "engine/particle-system/enum/enum";
import { ScriptComponent } from "engine/scripts/script-component";
import type { VisualEffect } from "../../interfaces/visual-effect";

export class DeathParticleEffect extends ScriptComponent implements VisualEffect {
	private currentParticleEmitter: ParticleEmitter;
	constructor(damageEmitter?: ParticleEmitter) {
		super();
		if (damageEmitter) {
			this.currentParticleEmitter = damageEmitter;
		}
	}

	play() {
		const transform = this.entity.getComponent(Transform);
		const explosion = new GameObject({
			position: transform.position.clone(),
			rotation: 0,
			size: new Vector2(1, 1),
		});
		explosion.renderLayer = RenderLayerTypes.World;
		this.currentParticleEmitter = new ParticleEmitter();
		this.currentParticleEmitter.particleRenderType = ParticleRenderType.CIRCLE;
		this.currentParticleEmitter.maxParticles = 48;
		this.currentParticleEmitter.burstCount = 48;
		this.currentParticleEmitter.duration = 2;
		this.currentParticleEmitter.loop = false;
		this.currentParticleEmitter.playing = true;
		this.currentParticleEmitter.localSpace = true;
		this.currentParticleEmitter.destroyOnComplete = true;
		this.currentParticleEmitter.positionOffset = new Vector2(0, 0);
		this.currentParticleEmitter.lifetime = { min: 0.25, max: 2 };
		this.currentParticleEmitter.speed = { min: 2.5, max: 7.5 };
		this.currentParticleEmitter.angle = { min: 0, max: 360 };
		this.currentParticleEmitter.gravity = new Vector2(0, 8);
		this.currentParticleEmitter.size = {
			startMin: new Vector2(0.08, 0.08),
			startMax: new Vector2(0.22, 0.22),
			endMin: new Vector2(0.01, 0.01),
			endMax: new Vector2(0.04, 0.04),
		};
		this.currentParticleEmitter.opacity = { start: 1, end: 0 };
		this.currentParticleEmitter.startColors = ["#fff2a8", "#ffd447", "#ff3b1f"];
		this.currentParticleEmitter.endColors = ["#ff3b1f", "#8f1208", "#2b0500"];

		explosion.addComponent(this.currentParticleEmitter);
		const scene = this.entity.getScene();
		if (scene) scene.addEntity(explosion);
	}
}
