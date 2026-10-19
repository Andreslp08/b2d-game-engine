import {
	Menubar,
	MenubarMenu,
	MenubarTrigger,
	MenubarContent,
	MenubarGroup,
	MenubarItem,
	MenubarShortcut,
	MenubarSeparator,
	MenubarRadioGroup,
	MenubarRadioItem,
} from "@/components/ui/menubar";
import { useTheme, type Theme } from "@/shared/providers/theme-provider";
import { FolderOpen, PlusIcon } from "lucide-react";

export function EditorMenuBar() {
	const { theme, setTheme } = useTheme();

	const themes: Record<Theme, string> = {
		system: "System",
		light: "Light",
		dark: "Dark",
	};
	return (
		<Menubar className="w-full">
			<MenubarMenu>
				<MenubarTrigger>File</MenubarTrigger>
				<MenubarContent>
					<MenubarGroup>
						<MenubarItem>
							New Project <PlusIcon/>
						</MenubarItem>
						<MenubarItem>
							Open Project <FolderOpen/>
						</MenubarItem>
					</MenubarGroup>
					<MenubarSeparator />
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>Edit</MenubarTrigger>
				<MenubarContent>
					<MenubarGroup>
						<MenubarItem>
							Undo <MenubarShortcut>⌘Z</MenubarShortcut>
						</MenubarItem>
						<MenubarItem>
							Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
						</MenubarItem>
					</MenubarGroup>
					<MenubarSeparator />
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>Theme</MenubarTrigger>
				<MenubarContent className="w-44">
					<MenubarGroup>
						<MenubarRadioGroup value={theme} onValueChange={setTheme}>
							{Object.entries(themes).map(([key, value]) => {
							
								return (
									<MenubarRadioItem key={key} value={key}>
										{value}
									</MenubarRadioItem>
								);
							})}
						</MenubarRadioGroup>
					</MenubarGroup>
					<MenubarSeparator />
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}
