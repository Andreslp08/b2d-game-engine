import { Engine } from "../../engine";
import Vector2 from "../../math/vector2";
import { ScreenAspectRatio } from "../enum/aspect-ratio.enum";

export class Screen {
	protected static _baseResolution: Vector2 = new Vector2(800, 800);
	protected clientResolution: Vector2;
	protected static _instance: Screen = null;
	protected _offset: Vector2;
	public aspectRatio: ScreenAspectRatio;

	constructor(size: Vector2) {
		this.clientResolution = size;
		this._offset = new Vector2(
			this.clientResolution.x / Screen._baseResolution.x,
			this.clientResolution.y / Screen._baseResolution.y
		);
		this.aspectRatio = this.clientResolution.x / this.clientResolution.y;
	}

	public static getInstance(): Screen {
		if (Screen._instance === null) {
			Screen._instance = new Screen(Screen._baseResolution);
		}
		return Screen._instance;
	}

	public setResolution(
		size: Vector2,
		aspectRatio: ScreenAspectRatio = ScreenAspectRatio["16:9"]
	): void {
		// Actualiza el tamaño de la ventana
		this.clientResolution = new Vector2(size.x, size.y);
		this.aspectRatio = aspectRatio;

		if (!Engine.gameRoot) return;
		if (!Engine._canvas) return;
		if (!Engine.context) return;

		const gameRoot = Engine.gameRoot;
		gameRoot.style.width = `${size.x}px`;
		gameRoot.style.height = `${size.y}px`;
		const gameRootAspectRatio = gameRoot.offsetWidth / gameRoot.offsetHeight;
		const canvasDimension = {
			x: 0,
			y: 0,
		};

		if (gameRootAspectRatio > aspectRatio) {
			canvasDimension.x = gameRoot.offsetHeight * aspectRatio;
			canvasDimension.y = gameRoot.offsetHeight;
		} else {
			canvasDimension.x = gameRoot.offsetWidth;
			canvasDimension.y = gameRoot.offsetWidth / aspectRatio;
		}

		const canvas = Engine._canvas;
		canvas.style.width = `${canvasDimension.x}px`;
		canvas.style.height = `${canvasDimension.y}px`;
		canvas.width = canvasDimension.x;
		canvas.height = canvasDimension.y;

		const scale = Math.min(
			canvasDimension.x / Screen._baseResolution.x,
			canvasDimension.y / Screen._baseResolution.y
		);
		this._offset = new Vector2(scale, scale);
	}

	public getResolution(): Vector2 {
		return this.clientResolution;
	}

	public get offset(): Vector2 {
		return this._offset;
	}

	public get baseResolution(): Vector2 {
		return Screen._baseResolution;
	}
	public getCanvasElement(): HTMLCanvasElement {
		return Engine._canvas;
	}

	public setCanvasBackgroundColor(color: string) {
		if (Engine._canvas) {
			Engine._canvas.style.backgroundColor = color;
		}
	}
}
