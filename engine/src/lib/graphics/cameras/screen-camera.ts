import Vector2 from "../../math/vector2";
import { Scene } from "../../scenes/scene";
import { Screen } from "../screen/screen";
import { Camera } from "./camera";

/** Camera used exclusively by screen-space layers such as the HUD. */
export class ScreenCamera extends Camera {
	constructor(scene: Scene) {
		super(new Vector2(0, 0), scene);
	}

	/** Applies only the window-to-UI scale. */
	applyTransform(context: CanvasRenderingContext2D): void {
		const scale = Screen.getInstance().getUIScale();
		context.scale(scale, scale);
	}

	/** Converts a canvas-relative position into screen-space UI coordinates. */
	canvasToUISpace(canvasRelativePosition: Vector2): Vector2 {
		const canvas = Screen.getInstance().getCanvasElement();
		if (!canvas) return canvasRelativePosition.clone();

		const canvasRect = canvas.getBoundingClientRect();
		const pixelRatioX = canvasRect.width > 0 ? canvas.width / canvasRect.width : 1;
		const pixelRatioY = canvasRect.height > 0 ? canvas.height / canvasRect.height : 1;
		const uiScale = Screen.getInstance().getUIScale();

		return new Vector2(
			(canvasRelativePosition.x * pixelRatioX) / uiScale,
			(canvasRelativePosition.y * pixelRatioY) / uiScale,
		);
	}
}
