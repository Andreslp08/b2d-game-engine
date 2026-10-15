export type TextInputListener = (text: string) => void;

export interface TextCompositionState {
	text: string;
	isComposing: boolean;
}

export type TextCompositionListener = (state: TextCompositionState) => void;

export const PhysicalKey = {
	A: "KeyA", B: "KeyB", C: "KeyC", D: "KeyD", E: "KeyE", F: "KeyF", G: "KeyG",
	H: "KeyH", I: "KeyI", J: "KeyJ", K: "KeyK", L: "KeyL", M: "KeyM", N: "KeyN",
	O: "KeyO", P: "KeyP", Q: "KeyQ", R: "KeyR", S: "KeyS", T: "KeyT", U: "KeyU",
	V: "KeyV", W: "KeyW", X: "KeyX", Y: "KeyY", Z: "KeyZ",
	Digit0: "Digit0", Digit1: "Digit1", Digit2: "Digit2", Digit3: "Digit3", Digit4: "Digit4",
	Digit5: "Digit5", Digit6: "Digit6", Digit7: "Digit7", Digit8: "Digit8", Digit9: "Digit9",
	Backquote: "Backquote", Backslash: "Backslash", BracketLeft: "BracketLeft", BracketRight: "BracketRight",
	Comma: "Comma", Equal: "Equal", IntlBackslash: "IntlBackslash", IntlRo: "IntlRo", IntlYen: "IntlYen",
	Minus: "Minus", Period: "Period", Quote: "Quote", Semicolon: "Semicolon", Slash: "Slash",
	AltLeft: "AltLeft", AltRight: "AltRight", Backspace: "Backspace", CapsLock: "CapsLock",
	ContextMenu: "ContextMenu", ControlLeft: "ControlLeft", ControlRight: "ControlRight", Enter: "Enter",
	MetaLeft: "MetaLeft", MetaRight: "MetaRight", ShiftLeft: "ShiftLeft", ShiftRight: "ShiftRight",
	Space: "Space", Tab: "Tab", Convert: "Convert", KanaMode: "KanaMode", Lang1: "Lang1", Lang2: "Lang2",
	Lang3: "Lang3", Lang4: "Lang4", Lang5: "Lang5", NonConvert: "NonConvert",
	Delete: "Delete", End: "End", Help: "Help", Home: "Home", Insert: "Insert", PageDown: "PageDown",
	PageUp: "PageUp", ArrowDown: "ArrowDown", ArrowLeft: "ArrowLeft", ArrowRight: "ArrowRight", ArrowUp: "ArrowUp",
	Escape: "Escape", PrintScreen: "PrintScreen", ScrollLock: "ScrollLock", Pause: "Pause",
	F1: "F1", F2: "F2", F3: "F3", F4: "F4", F5: "F5", F6: "F6", F7: "F7", F8: "F8",
	F9: "F9", F10: "F10", F11: "F11", F12: "F12", F13: "F13", F14: "F14", F15: "F15", F16: "F16",
	F17: "F17", F18: "F18", F19: "F19", F20: "F20", F21: "F21", F22: "F22", F23: "F23", F24: "F24",
	NumLock: "NumLock", Numpad0: "Numpad0", Numpad1: "Numpad1", Numpad2: "Numpad2", Numpad3: "Numpad3",
	Numpad4: "Numpad4", Numpad5: "Numpad5", Numpad6: "Numpad6", Numpad7: "Numpad7", Numpad8: "Numpad8",
	Numpad9: "Numpad9", NumpadAdd: "NumpadAdd", NumpadBackspace: "NumpadBackspace", NumpadClear: "NumpadClear",
	NumpadClearEntry: "NumpadClearEntry", NumpadComma: "NumpadComma", NumpadDecimal: "NumpadDecimal",
	NumpadDivide: "NumpadDivide", NumpadEnter: "NumpadEnter", NumpadEqual: "NumpadEqual", NumpadHash: "NumpadHash",
	NumpadMemoryAdd: "NumpadMemoryAdd", NumpadMemoryClear: "NumpadMemoryClear", NumpadMemoryRecall: "NumpadMemoryRecall",
	NumpadMemoryStore: "NumpadMemoryStore", NumpadMemorySubtract: "NumpadMemorySubtract", NumpadMultiply: "NumpadMultiply",
	NumpadParenLeft: "NumpadParenLeft", NumpadParenRight: "NumpadParenRight", NumpadSubtract: "NumpadSubtract",
	BrowserBack: "BrowserBack", BrowserFavorites: "BrowserFavorites", BrowserForward: "BrowserForward", BrowserHome: "BrowserHome",
	BrowserRefresh: "BrowserRefresh", BrowserSearch: "BrowserSearch", BrowserStop: "BrowserStop",
	AudioVolumeDown: "AudioVolumeDown", AudioVolumeMute: "AudioVolumeMute", AudioVolumeUp: "AudioVolumeUp",
	MediaPlayPause: "MediaPlayPause", MediaStop: "MediaStop", MediaTrackNext: "MediaTrackNext", MediaTrackPrevious: "MediaTrackPrevious",
	LaunchApp1: "LaunchApp1", LaunchApp2: "LaunchApp2", LaunchMail: "LaunchMail", MediaSelect: "MediaSelect",
	Eject: "Eject", Power: "Power", Sleep: "Sleep", WakeUp: "WakeUp", Fn: "Fn", FnLock: "FnLock",
	Again: "Again", Copy: "Copy", Cut: "Cut", Find: "Find", Open: "Open", Paste: "Paste", Props: "Props", Select: "Select", Undo: "Undo",
	Hiragana: "Hiragana", Katakana: "Katakana",
} as const;

export type PhysicalKeyCode = (typeof PhysicalKey)[keyof typeof PhysicalKey];

interface KeyboardLayoutMap {
	get(code: string): string | undefined;
}

interface KeyboardApi {
	getLayoutMap(): Promise<KeyboardLayoutMap>;
}

export class KeyBoardManager {
	private static _logicalKeys: Record<string, "keydown" | "keyup"> = {};
	private static _physicalKeys: Record<string, "keydown" | "keyup"> = {};
	private static readonly logicalKeyByPhysicalKey: Record<string, string> = {};
	private static readonly logicalKeysJustPressed = new Set<string>();
	private static readonly logicalKeysJustReleased = new Set<string>();
	private static readonly physicalKeysJustPressed = new Set<string>();
	private static readonly physicalKeysJustReleased = new Set<string>();
	private static readonly textInputListeners = new Set<TextInputListener>();
	private static readonly textCompositionListeners = new Set<TextCompositionListener>();
	private static isListening = false;
	private static readonly onKeyDown = (event: KeyboardEvent) => {
		if (KeyBoardManager._physicalKeys[event.code] === "keydown") return;

		KeyBoardManager.logicalKeyByPhysicalKey[event.code] = event.key;
		KeyBoardManager.physicalKeysJustPressed.add(event.code);
		if (KeyBoardManager._logicalKeys[event.key] !== "keydown") {
			KeyBoardManager.logicalKeysJustPressed.add(event.key);
		}
		KeyBoardManager._logicalKeys[event.key] = "keydown";
		KeyBoardManager._physicalKeys[event.code] = "keydown";
	};
	private static readonly onKeyUp = (event: KeyboardEvent) => {
		const logicalKey = KeyBoardManager.logicalKeyByPhysicalKey[event.code] ?? event.key;
		if (KeyBoardManager._physicalKeys[event.code] === "keydown") {
			KeyBoardManager.physicalKeysJustReleased.add(event.code);
		}
		if (KeyBoardManager._logicalKeys[logicalKey] === "keydown") {
			KeyBoardManager.logicalKeysJustReleased.add(logicalKey);
		}
		KeyBoardManager._logicalKeys[logicalKey] = "keyup";
		KeyBoardManager._physicalKeys[event.code] = "keyup";
		delete KeyBoardManager.logicalKeyByPhysicalKey[event.code];
	};
	private static readonly clearKeys = () => {
		KeyBoardManager._logicalKeys = {};
		KeyBoardManager._physicalKeys = {};
		for (const code in KeyBoardManager.logicalKeyByPhysicalKey) {
			delete KeyBoardManager.logicalKeyByPhysicalKey[code];
		}
		KeyBoardManager.endFrame();
	};
	private static readonly onBeforeInput = (event: InputEvent) => {
		if (event.isComposing || !event.data || !event.inputType.startsWith("insert")) return;

		for (const listener of KeyBoardManager.textInputListeners) listener(event.data);
	};
	private static readonly onCompositionStart = (event: CompositionEvent) => {
		KeyBoardManager.emitComposition(event.data, true);
	};
	private static readonly onCompositionUpdate = (event: CompositionEvent) => {
		KeyBoardManager.emitComposition(event.data, true);
	};
	private static readonly onCompositionEnd = (event: CompositionEvent) => {
		KeyBoardManager.emitComposition(event.data, false);
	};
	private static readonly onVisibilityChange = () => {
		if (document.hidden) KeyBoardManager.clearKeys();
	};
	private static readonly onMouseOut = (event: MouseEvent) => {
		if (event.relatedTarget === null) KeyBoardManager.clearKeys();
	};

	static listen() {
		if (!KeyBoardManager.isListening) {
			window.addEventListener("keydown", KeyBoardManager.onKeyDown);
			window.addEventListener("keyup", KeyBoardManager.onKeyUp);
			window.addEventListener("beforeinput", KeyBoardManager.onBeforeInput);
			window.addEventListener("compositionstart", KeyBoardManager.onCompositionStart);
			window.addEventListener("compositionupdate", KeyBoardManager.onCompositionUpdate);
			window.addEventListener("compositionend", KeyBoardManager.onCompositionEnd);
			window.addEventListener("blur", KeyBoardManager.clearKeys);
			window.addEventListener("mouseout", KeyBoardManager.onMouseOut);
			document.addEventListener("visibilitychange", KeyBoardManager.onVisibilityChange);
			KeyBoardManager.isListening = true;
		}

		return { unlisten: () => KeyBoardManager.unlisten() };
	}

	static unlisten() {
		if (!KeyBoardManager.isListening) return;

		window.removeEventListener("keydown", KeyBoardManager.onKeyDown);
		window.removeEventListener("keyup", KeyBoardManager.onKeyUp);
		window.removeEventListener("beforeinput", KeyBoardManager.onBeforeInput);
		window.removeEventListener("compositionstart", KeyBoardManager.onCompositionStart);
		window.removeEventListener("compositionupdate", KeyBoardManager.onCompositionUpdate);
		window.removeEventListener("compositionend", KeyBoardManager.onCompositionEnd);
		window.removeEventListener("blur", KeyBoardManager.clearKeys);
		window.removeEventListener("mouseout", KeyBoardManager.onMouseOut);
		document.removeEventListener("visibilitychange", KeyBoardManager.onVisibilityChange);
		KeyBoardManager.clearKeys();
		KeyBoardManager.isListening = false;
	}

	static logicalKeyDown(key: string): boolean {
		return KeyBoardManager._logicalKeys?.[key] === "keydown" ? true : false;
	}

	static logicalKeyUp(key: string): boolean {
		return KeyBoardManager._logicalKeys?.[key] === "keyup" ? true : false;
	}

	static physicalKeyDown(key: PhysicalKeyCode): boolean {
		return KeyBoardManager._physicalKeys?.[key] === "keydown" ? true : false;
	}

	static physicalKeyUp(key: PhysicalKeyCode): boolean {
		return KeyBoardManager._physicalKeys?.[key] === "keyup" ? true : false;
	}

	static logicalKeyJustPressed(key: string): boolean {
		return KeyBoardManager.logicalKeysJustPressed.has(key);
	}

	static logicalKeyJustReleased(key: string): boolean {
		return KeyBoardManager.logicalKeysJustReleased.has(key);
	}

	static physicalKeyJustPressed(key: PhysicalKeyCode): boolean {
		return KeyBoardManager.physicalKeysJustPressed.has(key);
	}

	static physicalKeyJustReleased(key: PhysicalKeyCode): boolean {
		return KeyBoardManager.physicalKeysJustReleased.has(key);
	}

	static endFrame(): void {
		KeyBoardManager.logicalKeysJustPressed.clear();
		KeyBoardManager.logicalKeysJustReleased.clear();
		KeyBoardManager.physicalKeysJustPressed.clear();
		KeyBoardManager.physicalKeysJustReleased.clear();
	}

	static async getPhysicalKeyLabel(key: PhysicalKeyCode): Promise<string> {
		const keyboard = (navigator as Navigator & { keyboard?: KeyboardApi }).keyboard;
		if (keyboard) {
			try {
				const layout = await keyboard.getLayoutMap();
				const label = layout.get(key);
				if (label) return label.toLocaleUpperCase();
			} catch {
				// Use the code-based fallback when the browser denies layout access.
			}
		}

		return KeyBoardManager.getPhysicalKeyFallbackLabel(key);
	}

	static onTextInput(listener: TextInputListener): () => void {
		KeyBoardManager.textInputListeners.add(listener);
		return () => KeyBoardManager.textInputListeners.delete(listener);
	}

	static onTextComposition(listener: TextCompositionListener): () => void {
		KeyBoardManager.textCompositionListeners.add(listener);
		return () => KeyBoardManager.textCompositionListeners.delete(listener);
	}

	static get logicalKeys() {
		return KeyBoardManager._logicalKeys;
	}

	static get physicalKeys() {
		return KeyBoardManager._physicalKeys;
	}

	private static emitComposition(text: string, isComposing: boolean): void {
		for (const listener of KeyBoardManager.textCompositionListeners) {
			listener({ text, isComposing });
		}
	}

	private static getPhysicalKeyFallbackLabel(key: PhysicalKeyCode): string {
		if (key.startsWith("Key")) return key.slice(3);
		if (key.startsWith("Digit")) return key.slice(5);
		if (key.startsWith("Numpad")) return `Num ${key.slice(6)}`;

		const labels: Record<string, string> = {
			ArrowDown: "Down Arrow",
			ArrowLeft: "Left Arrow",
			ArrowRight: "Right Arrow",
			ArrowUp: "Up Arrow",
			Backspace: "Backspace",
			CapsLock: "Caps Lock",
			ContextMenu: "Menu",
			ControlLeft: "Left Ctrl",
			ControlRight: "Right Ctrl",
			Delete: "Delete",
			End: "End",
			Enter: "Enter",
			Escape: "Esc",
			Home: "Home",
			MetaLeft: "Left Meta",
			MetaRight: "Right Meta",
			PageDown: "Page Down",
			PageUp: "Page Up",
			ShiftLeft: "Left Shift",
			ShiftRight: "Right Shift",
			Space: "Space",
			Tab: "Tab",
		};

		return labels[key] ?? key;
	}
}
