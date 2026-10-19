import { Button } from "@/components/ui/button";
import { CircleHelp, MoveHorizontal, Plus, X } from "lucide-react";
import { useRef, type FocusEvent, type ReactNode } from "react";

const inputClassName = "h-7 w-full rounded border bg-background px-2 text-xs outline-none focus:border-primary";
const selectInputContent = (event: FocusEvent<HTMLInputElement>): void => event.currentTarget.select();

const propertyHelp: Record<string, string> = {
	"Render type": "Chooses whether each particle is rendered as a circle or a rectangle.",
	"Visible": "Shows or hides this particle system in the preview without deleting its settings.",
	"Rate": "Particles emitted every second while the system is playing.",
	"Burst count": "Particles emitted once when the system starts.",
	"Duration (0 = forever)": "How long the emitter produces particles. Zero means it never stops.",
	"Max particles": "Maximum number of live particles kept by this emitter at one time.",
	"Simulation speed": "Scales the entire particle simulation. Lower values slow emission, motion, gravity, and lifetime together.",
	"Local space": "Keeps particles relative to the emitter. Disable it to let particles remain in world space after emission.",
	"Lifetime min": "Shortest possible lifespan for a particle, in seconds.",
	"Lifetime max": "Longest possible lifespan for a particle, in seconds.",
	"Speed min": "Lowest initial movement speed assigned to a particle.",
	"Speed max": "Highest initial movement speed assigned to a particle.",
	"Angle min": "First direction in degrees from which a particle may be emitted.",
	"Angle max": "Last direction in degrees from which a particle may be emitted.",
	"Gravity": "Acceleration applied to every particle over time. Positive Y moves downward in the current engine coordinates.",
	"Offset": "Position relative to the emitter where particles are spawned.",
	"Start size min": "Smallest initial width and height a particle can receive.",
	"Start size max": "Largest initial width and height a particle can receive.",
	"End size min": "Smallest width and height a particle can reach at the end of its lifetime.",
	"End size max": "Largest width and height a particle can reach at the end of its lifetime.",
	"Start opacity": "Particle opacity when it is emitted. Zero is transparent and one is fully opaque.",
	"End opacity": "Particle opacity when its lifetime ends.",
	"Start colors": "One color is chosen at random when each particle is emitted.",
	"End colors": "One color is chosen at random as the particle's final color.",
	"Name": "A descriptive name used to identify this system in the editor.",
	"Preset": "Applies a starting configuration to the selected system. It replaces that system's current particle settings.",
};

export const PropertyHelp = ({ label }: { label: string }) => (
	<span className="group/help relative inline-flex">
		<button type="button" className="inline-flex text-muted-foreground/70 hover:text-foreground focus:text-foreground" aria-label={`Help for ${label}`}>
			<CircleHelp className="size-3" />
		</button>
		<span role="tooltip" className="pointer-events-none absolute top-5 left-0 z-30 hidden w-56 rounded border bg-popover px-2 py-1.5 text-xs leading-relaxed text-popover-foreground shadow-md group-hover/help:block group-focus-within/help:block">
			{propertyHelp[label]}
		</span>
	</span>
);

export const InspectorSection = ({ title, children }: { title: string; children: ReactNode }) => (
	<section className="border-b px-3 py-3">
		<h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
		<div className="space-y-2">{children}</div>
	</section>
);

const DragHandle = ({ label, value, onChange, onDelta, min, step = 0.1, className = "" }: {
	label: string;
	value: number;
	onChange?: (value: number) => void;
	onDelta?: (delta: number) => void;
	min?: number;
	step?: number;
	className?: string;
}) => {
	const drag = useRef({ pointerId: -1, lastX: 0, value });
	return <span className={`group inline-flex cursor-ew-resize items-center gap-1 text-muted-foreground select-none ${className}`} title="Drag horizontally to adjust. Hold Shift for larger steps."
		onPointerDown={(event) => { event.preventDefault(); drag.current = { pointerId: event.pointerId, lastX: event.clientX, value }; event.currentTarget.setPointerCapture(event.pointerId); }}
		onPointerMove={(event) => {
			if (drag.current.pointerId !== event.pointerId) return;
			const distance = event.clientX - drag.current.lastX;
			if (distance === 0) return;
			const delta = distance * step * (event.shiftKey ? 10 : 1);
			if (onDelta) { drag.current = { ...drag.current, lastX: event.clientX }; onDelta(Number(delta.toFixed(6))); return; }
			const nextValue = Math.max(min ?? -Infinity, drag.current.value + delta);
			drag.current = { ...drag.current, lastX: event.clientX, value: nextValue };
			onChange?.(Number(nextValue.toFixed(6)));
		}}
		onPointerUp={(event) => { if (drag.current.pointerId === event.pointerId) drag.current.pointerId = -1; }}>
		{label}<MoveHorizontal className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
	</span>;
};

export const NumberField = ({ label, value, onChange, min, step = 0.1 }: { label: string; value: number; onChange: (value: number) => void; min?: number; step?: number }) => (
	<div className="grid grid-cols-[1fr_76px] items-center gap-2 text-xs">
		<div className="flex items-center gap-1"><DragHandle label={label} value={value} onChange={onChange} min={min} step={step} /><PropertyHelp label={label} /></div>
		<input className={inputClassName} type="number" value={value} min={min} step={step} onFocus={selectInputContent} onChange={(event) => onChange(Number(event.target.value) || 0)} />
	</div>
);

export const VectorField = ({ label, value, onChange }: { label: string; value: { x: number; y: number }; onChange: (value: { x: number; y: number }) => void }) => (
	<div className="grid grid-cols-[1fr_76px_76px] items-center gap-2 text-xs">
		<div className="flex items-center gap-1"><DragHandle label={label} value={0} onDelta={(delta) => onChange({ x: Number((value.x + delta).toFixed(6)), y: Number((value.y + delta).toFixed(6)) })} /><PropertyHelp label={label} /></div>
		<div className="relative"><DragHandle label="X" value={value.x} onChange={(x) => onChange({ ...value, x })} className="absolute top-1.5 left-2 z-10" />
			<input aria-label={`${label} x`} className={`${inputClassName} pl-5`} type="number" value={value.x} step="0.1" onFocus={selectInputContent} onChange={(event) => onChange({ ...value, x: Number(event.target.value) || 0 })} />
		</div>
		<div className="relative"><DragHandle label="Y" value={value.y} onChange={(y) => onChange({ ...value, y })} className="absolute top-1.5 left-2 z-10" />
			<input aria-label={`${label} y`} className={`${inputClassName} pl-5`} type="number" value={value.y} step="0.1" onFocus={selectInputContent} onChange={(event) => onChange({ ...value, y: Number(event.target.value) || 0 })} />
		</div>
	</div>
);

export const ToggleField = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) => (
	<div className="flex items-center justify-between text-xs"><span className="flex items-center gap-1 text-muted-foreground">{label}<PropertyHelp label={label} /></span>
		<input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
	</div>
);

export const ColorListField = ({ label, colors, onChange }: { label: string; colors: string[]; onChange: (colors: string[]) => void }) => (
	<div className="space-y-1.5">
		<div className="flex items-center justify-between text-xs text-muted-foreground"><span className="flex items-center gap-1">{label}<PropertyHelp label={label} /></span>
			<Button size="xs" variant="ghost" onClick={() => onChange([...colors, "#ffffff"])}><Plus /> Add</Button>
		</div>
		{colors.map((color, index) => <div key={index} className="flex items-center gap-1.5">
			<input aria-label={`${label} ${index + 1} picker`} className="size-7 cursor-pointer rounded border bg-transparent p-0.5" type="color" value={/^#[0-9a-f]{6}$/i.test(color) ? color : "#ffffff"} onChange={(event) => onChange(colors.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />
			<input aria-label={`${label} ${index + 1} hex value`} className={inputClassName} value={color} onFocus={selectInputContent} onChange={(event) => onChange(colors.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />
			<Button size="icon-xs" variant="ghost" aria-label={`Remove ${label} ${index + 1}`} disabled={colors.length === 1} onClick={() => onChange(colors.filter((_, itemIndex) => itemIndex !== index))}><X /></Button>
		</div>)}
	</div>
);

export { inputClassName, selectInputContent };
