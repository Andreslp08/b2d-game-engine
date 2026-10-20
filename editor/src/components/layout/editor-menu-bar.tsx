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
	MenubarCheckboxItem,
} from "@/components/ui/menubar";
import { useTheme, type Theme } from "@/shared/providers/theme-provider";
import { DebugMode, DebugTypes } from "@b2d-engine/core/debug/debug";
import { FolderOpen, PlusIcon } from "lucide-react";
import { useState } from "react";

export function EditorMenuBar() {
	const { theme, setTheme } = useTheme();
	const [debugEnabled, setDebugEnabled] = useState(DebugMode.enabled);
	const [debugMode, setDebugMode] = useState(DebugMode.currentMode);

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
				<MenubarTrigger>Debug</MenubarTrigger>
				<MenubarContent className="w-52">
					<MenubarGroup>
						<MenubarCheckboxItem checked={debugEnabled} onCheckedChange={(enabled) => {
							DebugMode.enabled = enabled;
							setDebugEnabled(enabled);
						}}>
							Enable debug rendering
						</MenubarCheckboxItem>
					</MenubarGroup>
					<MenubarSeparator />
					<MenubarGroup>
						<MenubarRadioGroup value={debugMode} onValueChange={(value) => {
							const mode = value as DebugTypes;
							DebugMode.setMode(mode);
							setDebugMode(mode);
						}}>
							{Object.values(DebugTypes).map((mode) => <MenubarRadioItem key={mode} value={mode}>{mode}</MenubarRadioItem>)}
						</MenubarRadioGroup>
					</MenubarGroup>
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
