export class KeyBoardManager {
	private static keys: object = {};

	static listen(): void {
		const onKeyDown = (e: KeyboardEvent) => {
			KeyBoardManager.keys[e?.key?.toLowerCase()] = "keydown";
		};

		const onKeyUp = (e: KeyboardEvent) => {
			KeyBoardManager.keys[e?.key?.toLowerCase()] = "keyup";
		};

		window.removeEventListener("keydown", onKeyDown);
		window.removeEventListener("keyup", onKeyUp);
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
	}

	static keyDown(key: string): boolean {
		return KeyBoardManager.keys?.[key?.toLowerCase()] === "keydown" ? true : false;
	}
	static keyUp(key: string): boolean {
		return KeyBoardManager.keys?.[key?.toLowerCase()] === "keyup" ? true : false;
	}
}
