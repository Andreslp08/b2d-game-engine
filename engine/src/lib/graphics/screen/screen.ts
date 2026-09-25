import { Engine } from "../../engine";
import Vector2 from "../../math/vector2";
import { ScreenAspectRatio } from "../enum/aspect-ratio.enum";

/**
 * Owns the sizes and scales used by the game viewport.
 *
 * Screen has four coordinate spaces:
 * - Window: browser/container size passed to resize(), in CSS pixels.
 * - Canvas: visible canvas size after fitting the requested aspect ratio.
 * - Canvas buffer: internal canvas.width/height, including devicePixelRatio.
 * - UI: coordinates after applying the screen camera's uniform scale.
 */
export class Screen {
	/** Logical reference size used by screen-space rendering. */
	protected static _logicalSize: Vector2 = new Vector2(800, 800);
	/** Browser/container size requested by the game, in CSS pixels. */
	protected windowSize: Vector2;
	/** Visible fitted canvas size, in CSS pixels. */
	protected canvasSize: Vector2;
	protected static _instance: Screen = null;
	/** Scale from base/canvas coordinates to the visible CSS canvas. */
	protected _canvasScale: Vector2;
	public aspectRatio: ScreenAspectRatio;

	constructor(size: Vector2) {
		this.windowSize = size.clone();
		this.canvasSize = size.clone();
		this._canvasScale = new Vector2(1, 1);
		this.aspectRatio = size.x / size.y;
	}

	public static getInstance(): Screen {
		if (Screen._instance === null) {
			Screen._instance = new Screen(Screen._logicalSize);
		}
		return Screen._instance;
	}

	/** Updates the window size and fits the canvas to the requested aspect ratio. */
	public resize(
		windowSize: Vector2,
		aspectRatio: ScreenAspectRatio = ScreenAspectRatio["16:9"],
	): void {
		this.windowSize = windowSize.clone();
		this.aspectRatio = aspectRatio;

		if (!Engine.gameRoot || !Engine.canvas || !Engine.context) return;

		const gameRoot = Engine.gameRoot;
		gameRoot.style.width = `${windowSize.x}px`;
		gameRoot.style.height = `${windowSize.y}px`;
		const rootAspectRatio = gameRoot.offsetWidth / gameRoot.offsetHeight;
		const fittedCanvasSize = new Vector2(0, 0);

		if (rootAspectRatio > aspectRatio) {
			fittedCanvasSize.x = gameRoot.offsetHeight * aspectRatio;
			fittedCanvasSize.y = gameRoot.offsetHeight;
		} else {
			fittedCanvasSize.x = gameRoot.offsetWidth;
			fittedCanvasSize.y = gameRoot.offsetWidth / aspectRatio;
		}

		this.canvasSize = fittedCanvasSize;
		const canvas = Engine.canvas;
		canvas.style.width = `${fittedCanvasSize.x}px`;
		canvas.style.height = `${fittedCanvasSize.y}px`;
		const pixelRatio = window.devicePixelRatio || 1;
		canvas.width = pixelRatio * fittedCanvasSize.x;
		canvas.height = pixelRatio * fittedCanvasSize.y;

		const scale = Math.min(
			fittedCanvasSize.x / Screen._logicalSize.x,
			fittedCanvasSize.y / Screen._logicalSize.y,
		);
		this._canvasScale = new Vector2(scale, scale);
	}

	/** Returns the browser/container size passed to resize(), in CSS pixels. */
	public getWindowSize(): Vector2 {
		return this.windowSize.clone();
	}

	/** Returns the visible CSS size of the fitted canvas. */
	public getCanvasSize(): Vector2 {
		return this.canvasSize.clone();
	}

	/** Returns the internal drawing-buffer size, including devicePixelRatio. */
	public getCanvasInternalSize(): Vector2 {
		const canvas = this.getCanvasElement();
		return new Vector2(canvas.width, canvas.height);
	}

	/** Returns the uniform scale applied by the screen camera to UI coordinates. */
	public getUIScale(): number {
		return (
			Math.min(
				this.windowSize.x / Screen._logicalSize.x,
				this.windowSize.y / Screen._logicalSize.y,
			) || 1
		);
	}

	/** Returns the fitted canvas size in screen-space UI coordinates. */
	public getUISize(): Vector2 {
		const canvas = this.getCanvasElement();
		if (!canvas) return this.getBaseResolution();

		const uiScale = this.getUIScale();
		return new Vector2(canvas.width / uiScale, canvas.height / uiScale);
	}

	/** Converts a position in the internal canvas buffer to UI coordinates. */
	public canvasToUISpace(canvasPosition: Vector2): Vector2 {
		const uiScale = this.getUIScale();
		return new Vector2(canvasPosition.x / uiScale, canvasPosition.y / uiScale);
	}

	/** Returns the logical reference size used by the renderer. */
	public getBaseResolution(): Vector2 {
		return Screen._logicalSize.clone();
	}

	/** Returns the CSS-canvas scale relative to the base resolution. */
	public getCanvasScale(): Vector2 {
		return this._canvasScale.clone();
	}

	/** Returns the actual canvas element used by the renderer. */
	public getCanvasElement(): HTMLCanvasElement {
		return Engine.canvas;
	}

	public setCanvasBackgroundColor(color: string): void {
		if (Engine.canvas) Engine.canvas.style.backgroundColor = color;
	}
}
