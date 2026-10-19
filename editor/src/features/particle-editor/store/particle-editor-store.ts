import { cloneParticleEmitterDefinition, createParticleSystemDefinition } from "@/features/particle-editor/model/particle-factories";
import { particlePresets } from "@/features/particle-editor/model/particle-presets";
import type { ParticleSystemDefinition } from "@/features/particle-editor/model/particle-types";
import { create } from "zustand";

type ParticleEditorState = {
	systems: ParticleSystemDefinition[];
	selectedSystemId: string;
	addSystem: () => void;
	removeSystem: (id: string) => void;
	selectSystem: (id: string) => void;
	updateSystem: (id: string, update: (system: ParticleSystemDefinition) => ParticleSystemDefinition) => void;
	setSystemVisibility: (id: string, visible: boolean) => void;
	setAllVisible: (visible: boolean) => void;
	applyPreset: (presetId: string) => void;
};

const initialSystem = createParticleSystemDefinition(1);

export const useParticleEditorStore = create<ParticleEditorState>((set) => ({
	systems: [initialSystem], selectedSystemId: initialSystem.id,
	addSystem: () => set((state) => { const system = createParticleSystemDefinition(state.systems.length + 1); return { systems: [...state.systems, system], selectedSystemId: system.id }; }),
	removeSystem: (id) => set((state) => { const systems = state.systems.filter((system) => system.id !== id); return { systems, selectedSystemId: state.selectedSystemId === id ? (systems[0]?.id ?? "") : state.selectedSystemId }; }),
	selectSystem: (selectedSystemId) => set({ selectedSystemId }),
	updateSystem: (id, update) => set((state) => ({ systems: state.systems.map((system) => system.id === id ? update(system) : system) })),
	setSystemVisibility: (id, visible) => set((state) => ({ systems: state.systems.map((system) => system.id === id ? { ...system, visible } : system) })),
	setAllVisible: (visible) => set((state) => ({ systems: state.systems.map((system) => ({ ...system, visible })) })),
	applyPreset: (presetId) => set((state) => {
		const preset = particlePresets.find((item) => item.id === presetId);
		if (!preset || !state.selectedSystemId) return state;
		return { systems: state.systems.map((system) => system.id === state.selectedSystemId ? { ...system, presetId: preset.id, emitter: cloneParticleEmitterDefinition(preset.emitter) } : system) };
	}),
}));
