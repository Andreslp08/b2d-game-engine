import {
	Menubar,
	MenubarMenu,
	MenubarTrigger,
	MenubarContent,
	MenubarGroup,
	MenubarItem,
	MenubarShortcut,
	MenubarSeparator,
	MenubarSub,
	MenubarSubTrigger,
	MenubarSubContent,
	MenubarCheckboxItem,
	MenubarRadioGroup,
	MenubarRadioItem,
} from "@/components/ui/menubar";
import { useTheme, type Theme } from "@/shared/providers/theme-provider";

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
							New Tab <MenubarShortcut>⌘T</MenubarShortcut>
						</MenubarItem>
						<MenubarItem>
							New Window <MenubarShortcut>⌘N</MenubarShortcut>
						</MenubarItem>
						<MenubarItem disabled>New Incognito Window</MenubarItem>
					</MenubarGroup>
					<MenubarSeparator />
					<MenubarGroup>
						<MenubarSub>
							<MenubarSubTrigger>Share</MenubarSubTrigger>
							<MenubarSubContent>
								<MenubarGroup>
									<MenubarItem>Email link</MenubarItem>
									<MenubarItem>Messages</MenubarItem>
									<MenubarItem>Notes</MenubarItem>
								</MenubarGroup>
							</MenubarSubContent>
						</MenubarSub>
					</MenubarGroup>
					<MenubarSeparator />
					<MenubarGroup>
						<MenubarItem>
							Print... <MenubarShortcut>⌘P</MenubarShortcut>
						</MenubarItem>
					</MenubarGroup>
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
					<MenubarGroup>
						<MenubarSub>
							<MenubarSubTrigger>Find</MenubarSubTrigger>
							<MenubarSubContent>
								<MenubarGroup>
									<MenubarItem>Search the web</MenubarItem>
								</MenubarGroup>
								<MenubarSeparator />
								<MenubarGroup>
									<MenubarItem>Find...</MenubarItem>
									<MenubarItem>Find Next</MenubarItem>
									<MenubarItem>Find Previous</MenubarItem>
								</MenubarGroup>
							</MenubarSubContent>
						</MenubarSub>
					</MenubarGroup>
					<MenubarSeparator />
					<MenubarGroup>
						<MenubarItem>Cut</MenubarItem>
						<MenubarItem>Copy</MenubarItem>
						<MenubarItem>Paste</MenubarItem>
					</MenubarGroup>
				</MenubarContent>
			</MenubarMenu>
			<MenubarMenu>
				<MenubarTrigger>View</MenubarTrigger>
				<MenubarContent className="w-44">
					<MenubarGroup>
						<MenubarCheckboxItem>Bookmarks Bar</MenubarCheckboxItem>
						<MenubarCheckboxItem checked>Full URLs</MenubarCheckboxItem>
					</MenubarGroup>
					<MenubarSeparator />
					<MenubarGroup>
						<MenubarItem inset>
							Reload <MenubarShortcut>⌘R</MenubarShortcut>
						</MenubarItem>
						<MenubarItem disabled inset>
							Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
						</MenubarItem>
					</MenubarGroup>
					<MenubarSeparator />
					<MenubarGroup>
						<MenubarItem inset>Toggle Fullscreen</MenubarItem>
					</MenubarGroup>
					<MenubarSeparator />
					<MenubarGroup>
						<MenubarItem inset>Hide Sidebar</MenubarItem>
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
				</MenubarContent>
			</MenubarMenu>
		</Menubar>
	);
}
