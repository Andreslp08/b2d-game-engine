import { Screen } from "../graphics/screen/screen";
import {
	ClickEvent,
	ClickEventListener,
	WheelEvent,
	WheelEventListener,
} from "./interfaces/mouse.interface";
import Vector2 from "../math/vector2";

/** Controls whether the browser cursor is rendered, hidden, or replaced by game UI. */
export type MouseCursorRenderMode = "system" | "hidden" | "custom";
/** Mouse buttons supported by polling and action bindings. */
export type MouseButton = "left" | "middle" | "right";

/** Tracks mouse position, button state, transient button edges, and cursor presentation. */
export class MouseManager {
	private static _canvasRelativePosition: Vector2 = new Vector2(0, 0);
	private static _clientPosition: Vector2 = new Vector2(0, 0);
	private static _cursorInputEnabled: boolean = true;
	private static _cursorRenderMode: MouseCursorRenderMode = "system";
	private static clicksDown: Partial<Record<MouseButton, boolean>> = {};
	private static readonly clicksJustPressed = new Set<MouseButton>();
	private static readonly clicksJustReleased = new Set<MouseButton>();
	private static isListening = false;
	private static readonly clearClicks = () => {
		MouseManager.clicksDown = {};
		MouseManager.endFrame();
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
		const button = MouseManager.getButton(event.button);
		if (!button || MouseManager.clicksDown[button]) return;

		MouseManager.clicksDown[button] = true;
		MouseManager.clicksJustPressed.add(button);
	};
	private static readonly onMouseUp = (event: MouseEvent) => {
		const button = MouseManager.getButton(event.button);
		if (!button) return;

		if (MouseManager.clicksDown[button]) MouseManager.clicksJustReleased.add(button);
		MouseManager.clicksDown[button] = false;
	};
	private static readonly onVisibilityChange = () => {
		if (document.hidden) MouseManager.clearClicks();
	};
	private static readonly onMouseOut = (event: MouseEvent) => {
		if (event.relatedTarget === null) MouseManager.clearClicks();
	};

	/** Starts global mouse listeners and resets cached cursor positions. */
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

	/** Stops global mouse listeners and clears held and transient button state. */
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

	/** Registers a wheel listener that receives only normalized vertical direction. */
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

	/** Registers a browser click listener for left or right buttons. */
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
	/** Registers a context-menu listener and reports right-button clicks. */
	public static onClickRight(ClickEventListener: ClickEventListener): void {
		window.addEventListener("contextmenu", (e: Event) => {
			e.preventDefault();
			const event: ClickEvent = {
				button: "right",
			};
			ClickEventListener(event);
		});
	}

	/** Returns whether the left mouse button is currently held. */
	public static isLeftClickDown(): boolean {
		return this.isButtonDown("left");
	}
	/** Returns whether the right mouse button is currently held. */
	public static isRightClickDown(): boolean {
		return this.isButtonDown("right");
	}

	/** Returns whether a specific mouse button is currently held. */
	public static isButtonDown(button: MouseButton): boolean {
		return MouseManager.clicksDown[button] === true;
	}

	/** Returns whether a button transitioned to held during this frame. */
	public static isButtonJustPressed(button: MouseButton): boolean {
		return MouseManager.clicksJustPressed.has(button);
	}

	/** Returns whether a button transitioned to released during this frame. */
	public static isButtonJustReleased(button: MouseButton): boolean {
		return MouseManager.clicksJustReleased.has(button);
	}

	/** Clears transient button edges after all input consumers ran for the frame. */
	public static endFrame(): void {
		MouseManager.clicksJustPressed.clear();
		MouseManager.clicksJustReleased.clear();
	}

	/** Enables or disables systems that should react to cursor input. */
	public static setCursorInputEnabled(enabled: boolean): void {
		MouseManager._cursorInputEnabled = enabled;
	}

	/** Returns whether cursor-driven gameplay input is enabled. */
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

	/** Sets browser cursor presentation; custom mode hides the system cursor for game rendering. */
	public static setCursorRenderMode(mode: MouseCursorRenderMode): void {
		MouseManager._cursorRenderMode = mode;
		document.body.style.cursor = mode === "system" ? "default" : "none";
	}

	/** Returns the current cursor presentation mode. */
	public static getCursorRenderMode(): MouseCursorRenderMode {
		return MouseManager._cursorRenderMode;
	}

	/** Returns whether the browser-managed cursor is visible. */
	public static isSystemCursorVisible(): boolean {
		return MouseManager._cursorRenderMode === "system";
	}

	/** Returns whether any cursor, system or custom, should be rendered. */
	public static isCursorVisible(): boolean {
		return MouseManager._cursorRenderMode !== "hidden";
	}

	private static getButton(button: number): MouseButton | null {
		if (button === 0) return "left";
		if (button === 1) return "middle";
		if (button === 2) return "right";
		return null;
	}
}
