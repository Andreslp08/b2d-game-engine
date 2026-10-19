import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { SpritePreview } from "@/features/sprite-editor/preview";

export const SpriteEditor = () => {
	return (
		<div className="grow">
			<ResizablePanelGroup
				orientation="horizontal"
				className="w-full flex h-full grow border"
			>
				<ResizablePanel defaultSize="10%" minSize="15%">
					<div className="flex h-[200px] items-center justify-center p-6">
						<span className="font-semibold">One</span>
					</div>
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel >
					<ResizablePanelGroup orientation="vertical">
						<ResizablePanel defaultSize="50%" minSize={"10%"}>
							<SpritePreview/>
						</ResizablePanel>
						<ResizableHandle withHandle />
						<ResizablePanel defaultSize="50%" minSize={"10%"}>
							<div className="flex h-full items-center justify-center p-6">
								<span className="font-semibold">Three</span>
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
};
