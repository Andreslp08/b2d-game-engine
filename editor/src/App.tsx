import { EditorMenuBar } from "@/components/layout/editor-menu-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Launcher } from "@/features/launcher";
import { ParticleEditor } from "@/features/particle-editor";
import { SpriteEditor } from "@/features/sprite-editor";
import { useState } from "react";


const tabContentClassName = 'grow flex';
function App() {
	const [activeTool, setActiveTool] = useState("launcher");

	return (
		<main className="w-full min-h-screen flex flex-col">
			<EditorMenuBar />
			<Tabs value={activeTool} onValueChange={setActiveTool} className="w-full flex grow flex-col">
				<TabsList className="my-5 grow-0 mx-auto">
					<TabsTrigger value="launcher">Launcher</TabsTrigger>
					<TabsTrigger value="particle-editor">
						Particles editor
					</TabsTrigger>
					<TabsTrigger value="sprite-editor">Sprite editor</TabsTrigger>
					<TabsTrigger value="tilemap-editor" disabled>
						tilemap editor
					</TabsTrigger>
				</TabsList>
  
				<TabsContent className={tabContentClassName} value="launcher">
					{activeTool === "launcher" && <Launcher />}
				</TabsContent>
				<TabsContent className={tabContentClassName} value="particle-editor">
					{activeTool === "particle-editor" && <ParticleEditor />}
				</TabsContent>
				<TabsContent className={tabContentClassName} value="sprite-editor">
					{activeTool === "sprite-editor" && <SpriteEditor />}
				</TabsContent>
			</Tabs>
		</main>
	);
}

export default App;
