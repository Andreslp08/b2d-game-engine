import { Transform } from "engine/common/components/transform";
import { GameObject } from "engine/common/entities/game-object";
import { RenderLayerTypes } from "engine/graphics/enum/render-layer-types.enum";
import Vector2 from "engine/math/vector2";
import { ParticleEmitter } from "engine/particle-system/component/particle-emitter";
import { ParticleRenderType } from "engine/particle-system/enum/enum";
import { ScriptComponent } from "engine/scripts/script-component";
import type { VisualEffect } from "../../interfaces/visual-effect";

type ParticleEmitterFactory = () => ParticleEmitter;

export class DeathParticleEffect extends ScriptComponent implements VisualEffect {
	constructor(private particleEmitterFactory: ParticleEmitterFactory = createDefaultDeathEmitter) {
		super();
	}

	play() {
		const transform = this.entity.getComponent(Transform);
		if (!transform) return;

		const explosion = new GameObject({
			position: transform.position.clone(),
			rotation: 0,
			size: new Vector2(1, 1),
		});
		explosion.renderLayer = RenderLayerTypes.World;

		explosion.addComponent(this.particleEmitterFactory());
		const scene = this.entity.getScene();
		if (scene) scene.addEntity(explosion);
	}
}

export function createDefaultDeathEmitter(): ParticleEmitter {
	const emitter = new ParticleEmitter();
	emitter.particleRenderType = ParticleRenderType.CIRCLE;
	emitter.maxParticles = 48;
	emitter.burstCount = 48;
	emitter.duration = 2;
	emitter.loop = false;
	emitter.playing = true;
	emitter.localSpace = true;
	emitter.destroyOnComplete = true;
	emitter.positionOffset = new Vector2(0, 0);
	emitter.lifetime = { min: 0.25, max: 2 };
	emitter.speed = { min: 2.5, max: 7.5 };
	emitter.angle = { min: 0, max: 360 };
	emitter.gravity = new Vector2(0, 8);
	emitter.size = {
		startMin: new Vector2(0.08, 0.08),
		startMax: new Vector2(0.22, 0.22),
		endMin: new Vector2(0.01, 0.01),
		endMax: new Vector2(0.04, 0.04),
	};
	emitter.opacity = { start: 1, end: 0 };
	emitter.startColors = ["#fff2a8", "#ffd447", "#ff3b1f"];
	emitter.endColors = ["#ff3b1f", "#8f1208", "#2b0500"];

	return emitter;
}
