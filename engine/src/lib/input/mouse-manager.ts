import { Scene } from "../graphics/scenes/scene";
import { Screen } from "../graphics/screen/screen";
import {
	ClickEvent,
	ClickEventListener,
	WheelEvent,
	WheelEventListener,
} from "./interfaces/mouse.interface";
import Vector2 from "../math/vector2";
import { PIXELS_PER_METER } from "../common/constants";

export class MouseManager {
	private static _position: Vector2 = new Vector2(0, 0);
	private static _positionOffset: Vector2 = new Vector2(0, 0);
	private static cursorVisible: boolean = true;
	private static clicksDown: object = {};

	static listen(): void {
		window.addEventListener("contextmenu", (e: Event) => {
			e.preventDefault();
		});
		MouseManager._position = new Vector2(0, 0);
		const onMouseMove = (e: MouseEvent) => {
			const canvas = Screen.getInstance().getCanvasElement();
			const canvasRect = canvas.getBoundingClientRect()
			MouseManager._position = new Vector2(e.clientX - canvasRect.left, e.clientY - canvasRect.top);
			MouseManager._positionOffset = new Vector2(e.offsetX, e.offsetY);
		};
		window.removeEventListener("mousemove", onMouseMove);
		window.addEventListener("mousemove", onMouseMove);

		const onMouseDown = (e: MouseEvent) => {
			if (e.button === 0) {
				this.clicksDown["left"] = true;
			} else if (e.button === 2) {
				this.clicksDown["right"] = true;
			}
		};
		const onMouseUp = (e: MouseEvent) => {
			if (e.button === 0) {
				this.clicksDown["left"] = false;
			} else if (e.button === 2) {
				this.clicksDown["right"] = false;
			}
		};
		window.removeEventListener("mousedown", onMouseDown);
		window.addEventListener("mousedown", onMouseDown);
		window.removeEventListener("mouseup", onMouseUp);
		window.addEventListener("mouseup", onMouseUp);
	}

	public static onWheel(wheelEventListener: WheelEventListener): void {
		window.addEventListener("wheel", (e) => {
			let direction: any = 0;
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
			let button: any = "left";
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

	public static getPosition(): Vector2 {
		return MouseManager._position;
	}

	public static getWorldPosition(scene: Scene): Vector2 {
	const screen = Screen.getInstance();
	const canvas = screen.getCanvasElement();

	const mousePx = MouseManager.getPosition(); // posición ya corregida respecto al canvas
	const camera = scene.camera;

	const canvasRes = screen.getResolution(); // resolución actual del canvas
	const baseRes = screen.baseResolution;

	// Igual que en Camera: escala uniforme y total
	const scaleX = canvasRes.x / baseRes.x;
	const scaleY = canvasRes.y / baseRes.y;
	const uniformScale = Math.min(scaleX, scaleY);
	const totalScale = PIXELS_PER_METER * uniformScale * camera.zoomX;

	// Obtener mitad del tamaño del canvas en metros
	const halfWidthMeters = (canvas.width / totalScale) / 2;
	const halfHeightMeters = (canvas.height / totalScale) / 2;

	// Posición de cámara en metros al tope-izquierda
	const cameraOriginX = camera.position.x - halfWidthMeters;
	const cameraOriginY = camera.position.y - halfHeightMeters;

	// Posición del mouse en metros (ajustando al escalado total)
	const worldX = mousePx.x / totalScale + cameraOriginX;
	const worldY = mousePx.y / totalScale + cameraOriginY;

	return new Vector2(worldX, worldY);
	}

	public static showCursor(visible: boolean): void {
		MouseManager.cursorVisible = visible;
		if (visible) {
			document.body.style.cursor = "default";
		} else {
			document.body.style.cursor = "none";
		}
	}

	public static isCursorVisible(): boolean {
		return MouseManager.cursorVisible;
	}
}
