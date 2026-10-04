import { Transform } from "../../common/components/transform";
import { TileChunkBatch } from "../../tiles/components/tile-chunk-batch";
import { Renderer } from "./render";

export class TileChunkRenderer extends Renderer {
	render(renderingContext: CanvasRenderingContext2D): void {
		const batch = this.entity.getComponent(TileChunkBatch);
		const transform = this.entity.getComponent(Transform);
		if (!batch || !transform) return;

		renderingContext.save();
		renderingContext.translate(transform.position.x, transform.position.y);
		renderingContext.rotate((transform.rotation * Math.PI) / 180);
		renderingContext.drawImage(
			batch.canvas,
			-transform.size.x / 2,
			-transform.size.y / 2,
			transform.size.x,
			transform.size.y,
		);

		renderingContext.restore();
	}
}
