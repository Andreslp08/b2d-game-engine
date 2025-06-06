import { PIXELS_PER_METER } from "../../common/constants";
import { Updatable } from "../../common/interfaces/updatable";
import { Scene } from "../scenes/scene";
import { Screen } from "../screen/screen";
import Vector2 from "../../math/vector2";
import { Renderable } from "../../common/interfaces/renderable";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";
import { ITranform } from "../../input/interfaces/transform.interface";

export class Camera implements Renderable, Updatable {
	renderLayer: RenderLayerTypes;
	protected position: Vector2;
	scene: Scene;

	constructor(initialPosition: Vector2, scene: Scene) {
		this.renderLayer = RenderLayerTypes.World;
		this.position = initialPosition;
		this.scene = scene;
	}

	public setPosition(vector2: Vector2): void {
		this.position = vector2;
	}
	public getPosition(): Vector2 {
		return this.position;
	}
	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {}
	update(deltaTime: number): void {}
}

export class UICamera extends Camera {
	transform: ITranform;

	constructor(scene: Scene) {
		super(new Vector2(0, 0), scene);
		this.renderLayer = RenderLayerTypes.UI;
	}
	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
		context.save();
		// draw red rctangle
		context.fillStyle = "red";
		context.fillRect(0, 0, 500, 500);
		context.restore();
	}
	update(deltaTime: number): void {}
}

export class WorldCamera extends Camera {
	zoomX: number;
	zoomY: number;

	constructor(initialPosition: Vector2, scene: Scene) {
		super(initialPosition, scene);
		this.renderLayer = RenderLayerTypes.World;
		this.position = initialPosition;
		this.zoomX = 1;
		this.zoomY = 1;
		this.scene = scene;
	}

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
		const screen = Screen.getInstance();
		const baseRes = screen.baseResolution;
		const canvasRes = screen.getResolution();

		const scaleX = canvasRes.x / baseRes.x;
		const scaleY = canvasRes.y / baseRes.y;
		const uniformScale = Math.min(scaleX, scaleY);

		const totalScale = PIXELS_PER_METER * uniformScale;
		const halfWidth = context.canvas.width / totalScale / 2;
		const halfHeight = context.canvas.height / totalScale / 2;

		const cameraX = this.position.x - halfWidth;
		const cameraY = this.position.y - halfHeight;

		context.translate(-cameraX, -cameraY);
	}

	update(deltaTime: number): void {
		this.scene.update(deltaTime);
	}

	setZoomX(zoomX: number): void {
		const previousZoomX = this.zoomX;
		this.zoomX = zoomX;
		const deltaZoomX = this.zoomX - previousZoomX;
		const deltaCameraX = (deltaZoomX * this.position.x) / this.zoomX;
		this.position.x -= deltaCameraX;
	}

	getZoomX(): number {
		return this.zoomX;
	}

	setZoomY(zoomY: number): void {
		const previousZoomY = this.zoomY;
		this.zoomY = zoomY;
		const deltaZoomY = this.zoomY - previousZoomY;
		const deltaCameraY = (deltaZoomY * this.position.y) / this.zoomY;
		this.position.y -= deltaCameraY;
	}

	getZoomY(): number {
		return this.zoomY;
	}
}
