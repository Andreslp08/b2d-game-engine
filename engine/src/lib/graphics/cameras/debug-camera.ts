import Vector2 from "../../math/vector2";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";
import { Scene } from "../scenes/scene";
import { Screen } from "../screen/screen";
import { Camera } from "./camera";

export class DebugCamera extends Camera {
	constructor(scene: Scene) {
		super(new Vector2(0, 0), scene);
		this.renderLayer = RenderLayerTypes.Debug;
	}
	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
		const screen = Screen.getInstance();
		const baseRes = screen.baseResolution;
		const canvasRes = screen.getResolution();
		const scaleX = canvasRes.x / baseRes.x;
		const scaleY = canvasRes.y / baseRes.y;

		const uniformScale = Math.min(scaleX, scaleY);
		context.scale(uniformScale, uniformScale);
		// context.fillStyle = "#f0f";
		// context.fillRect(0, 0, 100, 100);
	}
	update(deltaTime: number): void {}
}
