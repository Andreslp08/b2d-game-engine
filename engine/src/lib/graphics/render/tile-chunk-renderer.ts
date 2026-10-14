import { Transform } from "../../common/components/transform";
import { TileChunkBatch } from "../../tiles/components/tile-chunk-batch";
import { Renderer } from "./render";

export class TileChunkRenderer extends Renderer {
	render(renderingContext: CanvasRenderingContext2D): void {
		const batch = this.entity.getComponent(TileChunkBatch);
		const transform = this.entity.getComponent(Transform);
		if (!batch || !transform) return;
		batch.ensureResolution(renderingContext);

		renderingContext.save();
		renderingContext.translate(transform.position.x, transform.position.y);
		renderingContext.rotate((transform.rotation * Math.PI) / 180);
		const matrix = renderingContext.getTransform();
		const pixelsPerWorldUnit = Math.max(
			Math.hypot(matrix.a, matrix.b),
			Math.hypot(matrix.c, matrix.d),
		);
		const overdraw = 1 / pixelsPerWorldUnit;
		renderingContext.drawImage(
			batch.canvas,
			-transform.size.x / 2 - overdraw,
			-transform.size.y / 2 - overdraw,
			transform.size.x + overdraw * 2,
			transform.size.y + overdraw * 2,
		);

		renderingContext.restore();
	}
}
