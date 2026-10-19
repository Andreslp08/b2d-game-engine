import { EditorMenuBar } from "@/components/layout/editor-menu-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Launcher } from "@/features/launcher";
import { SpriteEditor } from "@/features/sprite-editor";


const tabContentClassName = 'grow flex';
function App() {
	return (
		<main className="w-full min-h-screen flex flex-col">
			<EditorMenuBar />
			<Tabs defaultValue="sprite-editor" className="w-full flex grow flex-col">
				<TabsList className="my-5 grow-0 mx-auto">
					<TabsTrigger value="launcher">Launcher</TabsTrigger>
					<TabsTrigger value="sprite-editor">Sprite editor</TabsTrigger>
					<TabsTrigger value="particles-editor" disabled>
						Particles editor
					</TabsTrigger>
					<TabsTrigger value="tilemap-editor" disabled>
						tilemap editor
					</TabsTrigger>
				</TabsList>
  
				<TabsContent className={tabContentClassName} value="launcher">
					<Launcher />
				</TabsContent>
				<TabsContent className={tabContentClassName} value="sprite-editor">
					<SpriteEditor />
				</TabsContent>
			</Tabs>
		</main>
	);
}

export default App;
