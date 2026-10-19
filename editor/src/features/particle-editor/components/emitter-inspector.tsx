import {
	ColorListField,
	InspectorSection,
	NumberField,
	PropertyHelp,
	ToggleField,
	VectorField,
	inputClassName,
	selectInputContent,
} from "@/features/particle-editor/components/property-fields";
import { particlePresets } from "@/features/particle-editor/model/particle-presets";
import type { ParticleEmitterDefinition, ParticleSystemDefinition } from "@/features/particle-editor/model/particle-types";

type EmitterInspectorProps = {
	system: ParticleSystemDefinition;
	onSystemChange: (update: (system: ParticleSystemDefinition) => ParticleSystemDefinition) => void;
	onEmitterChange: (update: (emitter: ParticleEmitterDefinition) => ParticleEmitterDefinition) => void;
	onVisibilityChange: (visible: boolean) => void;
	onPresetApply: (presetId: string) => void;
};

export const EmitterInspector = ({ system, onSystemChange, onEmitterChange, onVisibilityChange, onPresetApply }: EmitterInspectorProps) => (
	<div className="min-h-0 overflow-y-auto">
		<InspectorSection title="Preset">
			<label className="grid grid-cols-[1fr_150px] items-center gap-2 text-xs"><span className="flex items-center gap-1 text-muted-foreground">Apply preset<PropertyHelp label="Preset" /></span>
				<select className={inputClassName} value={system.presetId ?? ""} onChange={(event) => event.target.value && onPresetApply(event.target.value)}>
					<option value="" disabled>Custom</option>
					{particlePresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}
				</select>
			</label>
		</InspectorSection>
		<InspectorSection title="System">
			<div className="block text-xs text-muted-foreground"><span className="flex items-center gap-1">Name<PropertyHelp label="Name" /></span>
				<input className={`${inputClassName} mt-1`} value={system.name} onFocus={selectInputContent} onChange={(event) => onSystemChange((current) => ({ ...current, name: event.target.value }))} />
			</div>
			<div className="grid grid-cols-[1fr_76px] items-center gap-2 text-xs"><span className="flex items-center gap-1 text-muted-foreground">Render type<PropertyHelp label="Render type" /></span>
				<select className={inputClassName} value={system.emitter.particleRenderType} onChange={(event) => onEmitterChange((emitter) => ({ ...emitter, particleRenderType: event.target.value as ParticleEmitterDefinition["particleRenderType"] }))}>
					<option value="circle">Circle</option><option value="rectangle">Rectangle</option>
				</select>
			</div>
			<ToggleField label="Visible" checked={system.visible} onChange={onVisibilityChange} />
		</InspectorSection>
		<InspectorSection title="Emission">
			<NumberField label="Simulation speed" value={system.emitter.timeScale ?? 1} min={0} step={0.05} onChange={(timeScale) => onEmitterChange((emitter) => ({ ...emitter, timeScale }))} />
			<NumberField label="Rate" value={system.emitter.emissionRate} min={0} onChange={(emissionRate) => onEmitterChange((emitter) => ({ ...emitter, emissionRate }))} />
			<NumberField label="Burst count" value={system.emitter.burstCount} min={0} step={1} onChange={(burstCount) => onEmitterChange((emitter) => ({ ...emitter, burstCount }))} />
			<NumberField label="Duration (0 = forever)" value={system.emitter.duration} min={0} onChange={(duration) => onEmitterChange((emitter) => ({ ...emitter, duration }))} />
			<NumberField label="Max particles" value={system.emitter.maxParticles} min={1} step={1} onChange={(maxParticles) => onEmitterChange((emitter) => ({ ...emitter, maxParticles: Math.max(1, Math.floor(maxParticles)) }))} />
			<ToggleField label="Local space" checked={system.emitter.localSpace} onChange={(localSpace) => onEmitterChange((emitter) => ({ ...emitter, localSpace }))} />
		</InspectorSection>
		<InspectorSection title="Motion">
			<NumberField label="Lifetime min" value={system.emitter.lifetime.min} min={0} onChange={(min) => onEmitterChange((emitter) => ({ ...emitter, lifetime: { ...emitter.lifetime, min } }))} />
			<NumberField label="Lifetime max" value={system.emitter.lifetime.max} min={0} onChange={(max) => onEmitterChange((emitter) => ({ ...emitter, lifetime: { ...emitter.lifetime, max } }))} />
			<NumberField label="Speed min" value={system.emitter.speed.min} onChange={(min) => onEmitterChange((emitter) => ({ ...emitter, speed: { ...emitter.speed, min } }))} />
			<NumberField label="Speed max" value={system.emitter.speed.max} onChange={(max) => onEmitterChange((emitter) => ({ ...emitter, speed: { ...emitter.speed, max } }))} />
			<NumberField label="Angle min" value={system.emitter.angle.min} onChange={(min) => onEmitterChange((emitter) => ({ ...emitter, angle: { ...emitter.angle, min } }))} />
			<NumberField label="Angle max" value={system.emitter.angle.max} onChange={(max) => onEmitterChange((emitter) => ({ ...emitter, angle: { ...emitter.angle, max } }))} />
			<VectorField label="Gravity" value={system.emitter.gravity} onChange={(gravity) => onEmitterChange((emitter) => ({ ...emitter, gravity }))} />
			<VectorField label="Offset" value={system.emitter.positionOffset} onChange={(positionOffset) => onEmitterChange((emitter) => ({ ...emitter, positionOffset }))} />
		</InspectorSection>
		<InspectorSection title="Appearance">
			<VectorField label="Start size min" value={system.emitter.size.startMin} onChange={(startMin) => onEmitterChange((emitter) => ({ ...emitter, size: { ...emitter.size, startMin } }))} />
			<VectorField label="Start size max" value={system.emitter.size.startMax} onChange={(startMax) => onEmitterChange((emitter) => ({ ...emitter, size: { ...emitter.size, startMax } }))} />
			<VectorField label="End size min" value={system.emitter.size.endMin} onChange={(endMin) => onEmitterChange((emitter) => ({ ...emitter, size: { ...emitter.size, endMin } }))} />
			<VectorField label="End size max" value={system.emitter.size.endMax} onChange={(endMax) => onEmitterChange((emitter) => ({ ...emitter, size: { ...emitter.size, endMax } }))} />
			<NumberField label="Start opacity" value={system.emitter.opacity.start} min={0} step={0.05} onChange={(start) => onEmitterChange((emitter) => ({ ...emitter, opacity: { ...emitter.opacity, start } }))} />
			<NumberField label="End opacity" value={system.emitter.opacity.end} min={0} step={0.05} onChange={(end) => onEmitterChange((emitter) => ({ ...emitter, opacity: { ...emitter.opacity, end } }))} />
			<ColorListField label="Start colors" colors={system.emitter.startColors} onChange={(startColors) => onEmitterChange((emitter) => ({ ...emitter, startColors }))} />
			<ColorListField label="End colors" colors={system.emitter.endColors} onChange={(endColors) => onEmitterChange((emitter) => ({ ...emitter, endColors }))} />
		</InspectorSection>
	</div>
);
