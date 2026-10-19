import type { ParticleEffectDefinition, ParticleEmitterDefinition } from "@b2d-engine/core/particle-system/particle-effect";

export type { ParticleEffectDefinition, ParticleEmitterDefinition };

export type ParticleSystemDefinition = {
	id: string;
	name: string;
	visible: boolean;
	presetId?: string;
	emitter: ParticleEmitterDefinition;
};

export type ParticlePreset = {
	id: string;
	name: string;
	description: string;
	emitter: ParticleEmitterDefinition;
};
