import type { ParticleEmitterDefinition, ParticleSystemDefinition } from "@/features/particle-editor/model/particle-types";

export const createParticleEmitterDefinition = (): ParticleEmitterDefinition => ({
	particleRenderType: "circle", emissionRate: 32, burstCount: 0, duration: 0, maxParticles: 140, timeScale: 0.55, prewarm: false, localSpace: true,
	lifetime: { min: 0.45, max: 0.9 }, speed: { min: 0.8, max: 2.1 }, angle: { min: 235, max: 305 },
	size: { startMin: { x: 0.18, y: 0.18 }, startMax: { x: 0.35, y: 0.35 }, endMin: { x: 0.03, y: 0.03 }, endMax: { x: 0.08, y: 0.08 } },
	opacity: { start: 1, end: 0 }, gravity: { x: 0, y: 1.4 }, positionOffset: { x: 0, y: 0 },
	startColors: ["#fff7a1", "#ffd166", "#ff9f1c"], endColors: ["#ff5a1f", "#d62828", "#6a040f"],
});

export const cloneParticleEmitterDefinition = (emitter: ParticleEmitterDefinition): ParticleEmitterDefinition => ({
	...emitter, lifetime: { ...emitter.lifetime }, speed: { ...emitter.speed }, angle: { ...emitter.angle },
	size: { startMin: { ...emitter.size.startMin }, startMax: { ...emitter.size.startMax }, endMin: { ...emitter.size.endMin }, endMax: { ...emitter.size.endMax } },
	opacity: { ...emitter.opacity }, gravity: { ...emitter.gravity }, positionOffset: { ...emitter.positionOffset },
	startColors: [...emitter.startColors], endColors: [...emitter.endColors],
});

export const createParticleSystemDefinition = (index: number): ParticleSystemDefinition => ({
	id: crypto.randomUUID(), name: `Particle System ${index}`, visible: true, presetId: "campfire", emitter: createParticleEmitterDefinition(),
});
