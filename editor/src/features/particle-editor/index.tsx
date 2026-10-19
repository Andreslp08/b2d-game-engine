import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ParticleEditorPanel } from "@/features/particle-editor/panel";
import { ParticlePreview } from "@/features/particle-editor/preview";

export const ParticleEditor = () => (
	<div className="grow overflow-hidden">
		<ResizablePanelGroup orientation="horizontal" className="h-full w-full border-y">
			<ResizablePanel defaultSize="30%" minSize="24%" maxSize="45%">
				<div className="max-h-[85vh] w-full overflow-x-hidden overflow-y-auto">
				<ParticleEditorPanel />
				</div>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel minSize="40%">
				<ParticlePreview />
			</ResizablePanel>
		</ResizablePanelGroup>
	</div>
);
