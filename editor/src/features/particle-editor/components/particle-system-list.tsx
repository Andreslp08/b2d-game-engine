import { Button } from "@/components/ui/button";
import type { ParticleSystemDefinition } from "@/features/particle-editor/model/particle-types";
import { Download, Eye, EyeOff, Layers, Plus, Trash2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type ParticleSystemListProps = {
	systems: ParticleSystemDefinition[];
	selectedSystemId: string;
	onAdd: () => void;
	onSelect: (id: string) => void;
	onRemove: (id: string) => void;
	onVisibilityChange: (id: string, visible: boolean) => void;
	onAllVisibilityChange: (visible: boolean) => void;
	onExport: () => void;
};

const ToolbarButton = ({ label, children, ...props }: { label: string; children: ReactNode } & ComponentProps<typeof Button>) => (
	<span className="group/tooltip relative inline-flex">
		<Button size="icon" className="size-9 [&_svg]:size-5" aria-label={label} {...props}>{children}</Button>
		<span role="tooltip" className="pointer-events-none absolute top-full right-0 z-30 mt-1 hidden w-max rounded border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover/tooltip:block group-focus-within/tooltip:block">{label}</span>
	</span>
);

export const ParticleSystemList = ({ systems, selectedSystemId, onAdd, onSelect, onRemove, onVisibilityChange, onAllVisibilityChange, onExport }: ParticleSystemListProps) => {
	const allVisible = systems.length > 0 && systems.every((system) => system.visible);
	return <>
		<header className="flex items-center justify-between border-b px-3 py-2">
			<div className="flex items-center gap-2 text-sm font-semibold"><Layers className="size-4" /> Particle systems</div>
			<div className="flex gap-1"><ToolbarButton label="Export particle effect" variant="ghost" onClick={onExport}><Download /></ToolbarButton>
				<ToolbarButton label={allVisible ? "Hide all systems" : "Show all systems"} variant="ghost" onClick={() => onAllVisibilityChange(!allVisible)}>{allVisible ? <EyeOff /> : <Eye />}</ToolbarButton>
				<ToolbarButton label="Add particle system" onClick={onAdd}><Plus /></ToolbarButton>
			</div>
		</header>
		<div className="max-h-48 shrink-0 overflow-y-auto border-b p-2">
			{systems.length === 0 && <p className="px-2 py-3 text-xs text-muted-foreground">Add a particle system to begin.</p>}
			{systems.map((system) => <div key={system.id} className={`mb-1 flex items-center gap-1 rounded p-1 ${selectedSystemId === system.id ? "bg-accent" : "hover:bg-muted"}`}>
				<button className="min-w-0 grow truncate px-1 text-left text-xs" onClick={() => onSelect(system.id)}>{system.name}</button>
				<Button size="icon-xs" variant="ghost" aria-label={`${system.visible ? "Hide" : "Show"} ${system.name}`} onClick={() => onVisibilityChange(system.id, !system.visible)}>{system.visible ? <Eye /> : <EyeOff />}</Button>
				<Button size="icon-xs" variant="ghost" aria-label={`Delete ${system.name}`} onClick={() => onRemove(system.id)}><Trash2 /></Button>
			</div>)}
		</div>
	</>;
};
