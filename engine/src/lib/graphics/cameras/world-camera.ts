import { PIXELS_PER_METER } from "../../common/constants";
import Vector2 from "../../math/vector2";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";
import { Scene } from "../scenes/scene";
import { Screen } from "../screen/screen";
import { Camera } from "./camera";

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

	render(renderingContext: CanvasRenderingContext2D): void {
		const screen = Screen.getInstance();
		const baseRes = screen.baseResolution;
		const canvasRes = screen.getResolution();

		const scaleX = canvasRes.x / baseRes.x;
		const scaleY = canvasRes.y / baseRes.y;
		const uniformScale = Math.min(scaleX, scaleY);

		const totalScale = PIXELS_PER_METER * uniformScale;
		const halfWidth = renderingContext.canvas.width / totalScale / 2;
		const halfHeight = renderingContext.canvas.height / totalScale / 2;

		const cameraX = this.position.x - halfWidth;
		const cameraY = this.position.y - halfHeight;

		renderingContext.translate(-cameraX, -cameraY);
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
