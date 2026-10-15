export class KeyBoardManager {
	private static _keys: Record<string, "keydown" | "keyup"> = {};
	private static isListening = false;
	private static readonly onKeyDown = (event: KeyboardEvent) => {
		KeyBoardManager._keys[event.key.toLowerCase()] = "keydown";
	};
	private static readonly onKeyUp = (event: KeyboardEvent) => {
		KeyBoardManager._keys[event.key.toLowerCase()] = "keyup";
	};
	private static readonly clearKeys = () => {
		KeyBoardManager._keys = {};
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
		window.removeEventListener("blur", KeyBoardManager.clearKeys);
		window.removeEventListener("mouseout", KeyBoardManager.onMouseOut);
		document.removeEventListener("visibilitychange", KeyBoardManager.onVisibilityChange);
		KeyBoardManager.clearKeys();
		KeyBoardManager.isListening = false;
	}

	static keyDown(key: string): boolean {
		return KeyBoardManager._keys?.[key?.toLowerCase()] === "keydown" ? true : false;
	}
	static keyUp(key: string): boolean {
		return KeyBoardManager._keys?.[key?.toLowerCase()] === "keyup" ? true : false;
	}

	static get keys() {
		return KeyBoardManager._keys;
	}
}
