import { Entity } from "../ecs/entity";
import Vector2 from "../math/vector2";
import { ParticleEmitter } from "./component/particle-emitter";
import { ParticleRenderType } from "./enum/enum";

export type ParticleVectorDefinition = { x: number; y: number };

export type ParticleEmitterDefinition = {
	particleRenderType: "circle" | "rectangle";
	emissionRate: number;
	burstCount: number;
	duration: number;
	maxParticles: number;
	timeScale?: number;
	prewarm: boolean;
	localSpace: boolean;
	lifetime: { min: number; max: number };
	speed: { min: number; max: number };
	angle: { min: number; max: number };
	size: { startMin: ParticleVectorDefinition; startMax: ParticleVectorDefinition; endMin: ParticleVectorDefinition; endMax: ParticleVectorDefinition };
	opacity: { start: number; end: number };
	gravity: ParticleVectorDefinition;
	positionOffset: ParticleVectorDefinition;
	startColors: string[];
	endColors: string[];
};

export type ParticleEffectDefinition = {
	format: "b2d-particle-effect";
	version: 1;
	systems: Array<{ name: string; emitter: ParticleEmitterDefinition }>;
};

/** Creates a runtime emitter from a serializable particle asset definition. */
export const createParticleEmitterFromDefinition = (definition: ParticleEmitterDefinition): ParticleEmitter => {
	const emitter = new ParticleEmitter();
	emitter.particleRenderType = definition.particleRenderType === "circle" ? ParticleRenderType.CIRCLE : ParticleRenderType.RECTANGLE;
	emitter.emissionRate = definition.emissionRate;
	emitter.burstCount = definition.burstCount;
	emitter.duration = definition.duration;
	emitter.loop = false;
	emitter.maxParticles = definition.maxParticles;
	emitter.timeScale = definition.timeScale ?? 1;
	emitter.prewarm = definition.prewarm;
	emitter.localSpace = definition.localSpace;
	emitter.lifetime = { ...definition.lifetime };
	emitter.speed = { ...definition.speed };
	emitter.angle = { ...definition.angle };
	emitter.size = {
		startMin: new Vector2(definition.size.startMin.x, definition.size.startMin.y),
		startMax: new Vector2(definition.size.startMax.x, definition.size.startMax.y),
		endMin: new Vector2(definition.size.endMin.x, definition.size.endMin.y),
		endMax: new Vector2(definition.size.endMax.x, definition.size.endMax.y),
	};
	emitter.opacity = { ...definition.opacity };
	emitter.gravity = new Vector2(definition.gravity.x, definition.gravity.y);
	emitter.positionOffset = new Vector2(definition.positionOffset.x, definition.positionOffset.y);
	emitter.startColors = [...definition.startColors];
	emitter.endColors = [...definition.endColors];
	return emitter;
};

/** Attaches every emitter in an exported particle effect to an entity. */
export const applyParticleEffect = (entity: Entity, effect: ParticleEffectDefinition): ParticleEmitter[] =>
	effect.systems.map(({ emitter }) => {
		const runtimeEmitter = createParticleEmitterFromDefinition(emitter);
		entity.addComponent(runtimeEmitter);
		return runtimeEmitter;
	});
