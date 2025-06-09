export class KeyBoardManager {
	private static _keys: object = {};

	static listen() {
		const onKeyDown = (e: KeyboardEvent) => {
			KeyBoardManager._keys[e?.key?.toLowerCase()] = "keydown";
		};

		const onKeyUp = (e: KeyboardEvent) => {
			KeyBoardManager._keys[e?.key?.toLowerCase()] = "keyup";
		};

		window.removeEventListener("keydown", onKeyDown);
		window.removeEventListener("keyup", onKeyUp);
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);

		return { unlisten: () => {
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
			KeyBoardManager._keys = {};
		} };
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
