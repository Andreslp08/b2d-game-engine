import { cloneParticleEmitterDefinition } from "@/features/particle-editor/model/particle-factories";
import type { ParticleEffectDefinition, ParticleSystemDefinition } from "@/features/particle-editor/model/particle-types";

export const createParticleEffectExport = (systems: ParticleSystemDefinition[]): ParticleEffectDefinition => ({
	format: "b2d-particle-effect",
	version: 1,
	systems: systems.map(({ name, emitter }) => ({ name, emitter: cloneParticleEmitterDefinition(emitter) })),
});

export const downloadParticleEffect = (systems: ParticleSystemDefinition[]): void => {
	const content = JSON.stringify(createParticleEffectExport(systems), null, 2);
	const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = "particle-effect.b2d-particles.json";
	link.click();
	URL.revokeObjectURL(url);
};
