import { Transform } from "../../common/components/transform";
import { MathUtil } from "../../math/math-util";
import { Sprite } from "../sprites/components/sprite";
import { Renderer } from "./render";

export class TransformRenderer extends Renderer {
	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
		if (!this.entity) return;
		const entity = this.entity;
		const transform = entity.getComponent(Transform);
		if (!transform) return;
		if (transform.debugMode === false) return;
		if (transform) {
			context.beginPath();
			context.save();
			context.strokeStyle = "#0f0";
			context.lineWidth = 0.03;
			context.strokeRect(
				transform.position.x - transform.size.x / 2,
				transform.position.y - transform.size.y / 2,
				transform.size.x,
				transform.size.y
			);
			context.restore();
		}
		context.closePath();
	}
}
