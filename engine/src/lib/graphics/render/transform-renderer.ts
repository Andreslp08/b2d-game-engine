import { Transform } from "../../common/components/transform";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";
import { Renderer } from "./render";

export class TransformRenderer extends Renderer {
	render(renderingContext: CanvasRenderingContext2D): void {
		if (!this.entity) return;
		const entity = this.entity;
		const transform = entity.getComponent(Transform);
		if (!transform) return;
		if (transform.debugMode === false) return;
		if (transform) {
			renderingContext.beginPath();
			renderingContext.save();
			renderingContext.strokeStyle = "#0f0";
			renderingContext.lineWidth =
				entity.renderLayer === RenderLayerTypes.Debug ||
				entity.renderLayer === RenderLayerTypes.UI
					? 3
					: 0.03;
			renderingContext.strokeRect(
				transform.position.x - transform.size.x / 2,
				transform.position.y - transform.size.y / 2,
				transform.size.x,
				transform.size.y
			);
			const size =
				entity.renderLayer === RenderLayerTypes.Debug ||
				entity.renderLayer === RenderLayerTypes.UI
					? 5
					: 0.03;
			renderingContext.fillStyle = "#0f0";
			renderingContext.fillRect(
				transform.position.x - size / 2,
				transform.position.y - size / 2,
				size,
				size
			);
			renderingContext.restore();
		}
		renderingContext.closePath();
	}
}
