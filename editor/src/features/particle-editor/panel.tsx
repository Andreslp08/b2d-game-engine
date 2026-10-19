import { EmitterInspector } from "@/features/particle-editor/components/emitter-inspector";
import { ParticleSystemList } from "@/features/particle-editor/components/particle-system-list";
import { downloadParticleEffect } from "@/features/particle-editor/model/particle-effect-export";
import type { ParticleEmitterDefinition } from "@/features/particle-editor/model/particle-types";
import { useParticleEditorStore } from "@/features/particle-editor/store/particle-editor-store";

export const ParticleEditorPanel = () => {
	const systems = useParticleEditorStore((state) => state.systems);
	const selectedSystemId = useParticleEditorStore((state) => state.selectedSystemId);
	const addSystem = useParticleEditorStore((state) => state.addSystem);
	const removeSystem = useParticleEditorStore((state) => state.removeSystem);
	const selectSystem = useParticleEditorStore((state) => state.selectSystem);
	const setSystemVisibility = useParticleEditorStore((state) => state.setSystemVisibility);
	const setAllVisible = useParticleEditorStore((state) => state.setAllVisible);
	const applyPreset = useParticleEditorStore((state) => state.applyPreset);
	const updateSystem = useParticleEditorStore((state) => state.updateSystem);
	const selected = systems.find((system) => system.id === selectedSystemId);

	const updateEmitter = (update: (emitter: ParticleEmitterDefinition) => ParticleEmitterDefinition): void => {
		if (!selected) return;
		updateSystem(selected.id, (system) => ({ ...system, presetId: undefined, emitter: update(system.emitter) }));
	};

	return <aside className="flex h-full min-w-0 flex-col bg-card">
		<ParticleSystemList systems={systems} selectedSystemId={selectedSystemId} onAdd={addSystem} onSelect={selectSystem} onRemove={removeSystem} onVisibilityChange={setSystemVisibility} onAllVisibilityChange={setAllVisible} onExport={() => downloadParticleEffect(systems)} />
		{selected && <EmitterInspector system={selected} onSystemChange={(update) => updateSystem(selected.id, update)} onEmitterChange={updateEmitter} onVisibilityChange={(visible) => setSystemVisibility(selected.id, visible)} onPresetApply={applyPreset} />}
	</aside>;
};
