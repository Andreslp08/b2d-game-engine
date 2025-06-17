import { ITranform } from "../../input/interfaces/transform.interface";
import Vector2 from "../../math/vector2";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";
import { Scene } from "../scenes/scene";
import { Screen } from "../screen/screen";
import { Camera } from "./camera";

export class UICamera extends Camera {
	transform: ITranform;

	constructor(scene: Scene) {
		super(new Vector2(0, 0), scene);
		this.renderLayer = RenderLayerTypes.UI;
	}
	render(renderingContext: CanvasRenderingContext2D): void {
		const screen = Screen.getInstance();
		const baseRes = screen.baseResolution;
		const canvasRes = screen.getResolution();
		const scaleX = canvasRes.x / baseRes.x;
		const scaleY = canvasRes.y / baseRes.y;

		const uniformScale = Math.min(scaleX, scaleY);
		renderingContext.scale(uniformScale, uniformScale);
	}

	update(): void {}
}
