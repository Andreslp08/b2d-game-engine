import { Screen } from "../graphics/screen/screen";
import {
	ClickEvent,
	ClickEventListener,
	WheelEvent,
	WheelEventListener,
} from "./interfaces/mouse.interface";
import Vector2 from "../math/vector2";

export type MouseCursorRenderMode = "system" | "hidden" | "custom";

export class MouseManager {
	private static _canvasRelativePosition: Vector2 = new Vector2(0, 0);
	private static _clientPosition: Vector2 = new Vector2(0, 0);
	private static _cursorInputEnabled: boolean = true;
	private static _cursorRenderMode: MouseCursorRenderMode = "system";
	private static clicksDown: Partial<Record<"left" | "right", boolean>> = {};
	private static isListening = false;
	private static readonly clearClicks = () => {
		MouseManager.clicksDown = {};
	};
	private static readonly onContextMenu = (event: Event) => {
		event.preventDefault();
	};
	private static readonly onMouseMove = (event: MouseEvent) => {
		const canvas = Screen.getInstance().getCanvasElement();
		const canvasRect = canvas.getBoundingClientRect();
		MouseManager._clientPosition = new Vector2(event.clientX, event.clientY);
		MouseManager._canvasRelativePosition = new Vector2(
			event.clientX - canvasRect.left,
			event.clientY - canvasRect.top,
		);
	};
	private static readonly onMouseDown = (event: MouseEvent) => {
		if (event.button === 0) MouseManager.clicksDown.left = true;
		if (event.button === 2) MouseManager.clicksDown.right = true;
	};
	private static readonly onMouseUp = (event: MouseEvent) => {
		if (event.button === 0) MouseManager.clicksDown.left = false;
		if (event.button === 2) MouseManager.clicksDown.right = false;
	};
	private static readonly onVisibilityChange = () => {
		if (document.hidden) MouseManager.clearClicks();
	};
	private static readonly onMouseOut = (event: MouseEvent) => {
		if (event.relatedTarget === null) MouseManager.clearClicks();
	};

	static listen() {
		if (!MouseManager.isListening) {
			MouseManager._canvasRelativePosition = new Vector2(0, 0);
			MouseManager._clientPosition = new Vector2(0, 0);
			window.addEventListener("contextmenu", MouseManager.onContextMenu);
			window.addEventListener("mousemove", MouseManager.onMouseMove);
			window.addEventListener("mousedown", MouseManager.onMouseDown);
			window.addEventListener("mouseup", MouseManager.onMouseUp);
			window.addEventListener("blur", MouseManager.clearClicks);
			window.addEventListener("mouseout", MouseManager.onMouseOut);
			document.addEventListener("visibilitychange", MouseManager.onVisibilityChange);
			MouseManager.isListening = true;
		}

		return { unlisten: () => MouseManager.unlisten() };
	}

	static unlisten() {
		if (!MouseManager.isListening) return;

		window.removeEventListener("contextmenu", MouseManager.onContextMenu);
		window.removeEventListener("mousemove", MouseManager.onMouseMove);
		window.removeEventListener("mousedown", MouseManager.onMouseDown);
		window.removeEventListener("mouseup", MouseManager.onMouseUp);
		window.removeEventListener("blur", MouseManager.clearClicks);
		window.removeEventListener("mouseout", MouseManager.onMouseOut);
		document.removeEventListener("visibilitychange", MouseManager.onVisibilityChange);
		MouseManager.clearClicks();
		MouseManager.isListening = false;
	}

	public static onWheel(wheelEventListener: WheelEventListener): void {
		window.addEventListener("wheel", (e) => {
			let direction: -1 | 0 | 1 = 0;
			if (e.deltaY < 0) {
				direction = 1;
			} else if (e.deltaY > 0) {
				direction = -1;
			} else {
				direction = 0;
			}
			const event: WheelEvent = {
				direction: direction,
			};
			wheelEventListener(event);
		});
	}

	public static onClickLeft(ClickEventListener: ClickEventListener): void {
		window.addEventListener("click", (e) => {
			let button: "left" | "right" = "left";
			if (e.button === 0) {
				button = "left";
			} else if (e.button === 2) {
				button = "right";
			}
			const event: ClickEvent = {
				button: button,
			};
			ClickEventListener(event);
		});
	}
	public static onClickRight(ClickEventListener: ClickEventListener): void {
		window.addEventListener("contextmenu", (e: Event) => {
			e.preventDefault();
			const event: ClickEvent = {
				button: "right",
			};
			ClickEventListener(event);
		});
	}

	public static isLeftClickDown(): boolean {
		return this.clicksDown["left"] === true ? true : false;
	}
	public static isRightClickDown(): boolean {
		return this.clicksDown["right"] === true ? true : false;
	}

	public static setCursorInputEnabled(enabled: boolean): void {
		MouseManager._cursorInputEnabled = enabled;
	}

	public static isCursorInputEnabled(): boolean {
		return MouseManager._cursorInputEnabled;
	}

	/**
	 * Posicion del mouse relativa al canvas del juego.
	 * Equivale a: `mouse client position - canvas.getBoundingClientRect()`.
	 */
	public static getRelativePosition(): Vector2 {
		return MouseManager._canvasRelativePosition;
	}


	/**
	 * Posicion real del mouse en coordenadas del viewport/ventana (`clientX`, `clientY`).
	 */
	public static getClientPosition(): Vector2 {
		return MouseManager._clientPosition;
	}

	public static setCursorRenderMode(mode: MouseCursorRenderMode): void {
		MouseManager._cursorRenderMode = mode;
		document.body.style.cursor = mode === "system" ? "default" : "none";
	}

	public static getCursorRenderMode(): MouseCursorRenderMode {
		return MouseManager._cursorRenderMode;
	}

	public static isSystemCursorVisible(): boolean {
		return MouseManager._cursorRenderMode === "system";
	}

	public static isCursorVisible(): boolean {
		return MouseManager._cursorRenderMode !== "hidden";
	}
}
