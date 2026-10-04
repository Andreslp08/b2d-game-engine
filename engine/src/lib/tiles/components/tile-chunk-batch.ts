import { PIXELS_PER_METER } from "../../common/constants";
import { Component } from "../../ecs/component";
import Vector2 from "../../math/vector2";
import { TileTextureData } from "../definitions";

export class TileChunkBatch extends Component {
	private static readonly cache = new Map<
		string,
		{ canvas: OffscreenCanvas | HTMLCanvasElement; context: CanvasRenderingContext2D }
	>();
	canvas: OffscreenCanvas | HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	readonly worldSize: Vector2;
	private readonly definition: TileTextureData;
	private readonly gridSize: Vector2;
	private pixelsPerMeter = 0;

	constructor(
		definition: TileTextureData,
		cellSize: Vector2,
		gridSize: Vector2,
	) {
		super();
		this.unique = false;
		this.definition = definition;
		this.gridSize = gridSize.clone();
		this.worldSize = new Vector2(cellSize.x * gridSize.x, cellSize.y * gridSize.y);
		this.setResolution(PIXELS_PER_METER);
	}

	ensureResolution(renderingContext: CanvasRenderingContext2D): void {
		const transform = renderingContext.getTransform();
		const pixelsPerMeter = Math.max(
			Math.hypot(transform.a, transform.b),
			Math.hypot(transform.c, transform.d),
		);
		this.setResolution(Math.max(1, Math.ceil(pixelsPerMeter)));
	}

	private setResolution(pixelsPerMeter: number): void {
		if (pixelsPerMeter === this.pixelsPerMeter) return;

		const cacheKey = this.getCacheKey(pixelsPerMeter);
		const cachedBatch = TileChunkBatch.cache.get(cacheKey);
		if (cachedBatch) {
			this.canvas = cachedBatch.canvas;
			this.context = cachedBatch.context;
			this.pixelsPerMeter = pixelsPerMeter;
			return;
		}

		const width = Math.max(1, Math.ceil(this.worldSize.x * pixelsPerMeter));
		const height = Math.max(1, Math.ceil(this.worldSize.y * pixelsPerMeter));
		this.canvas = typeof OffscreenCanvas !== "undefined"
			? new OffscreenCanvas(width, height)
			: Object.assign(document.createElement("canvas"), { width, height });
		this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		this.rebuild();
		TileChunkBatch.cache.set(cacheKey, { canvas: this.canvas, context: this.context });
		this.pixelsPerMeter = pixelsPerMeter;
	}

	private getCacheKey(pixelsPerMeter: number): string {
		return [
			this.definition.image.path,
			this.definition.framePosition.x,
			this.definition.framePosition.y,
			this.definition.frameSize.w,
			this.definition.frameSize.h,
			this.definition.scale?.x ?? 1,
			this.definition.scale?.y ?? 1,
			this.definition.opacity ?? 1,
			pixelsPerMeter,
			this.worldSize.x,
			this.worldSize.y,
			this.gridSize.x,
			this.gridSize.y,
		].join(":");
	}

	private rebuild(): void {
		const tileWidth = this.canvas.width / this.gridSize.x;
		const tileHeight = this.canvas.height / this.gridSize.y;
		const scale = this.definition.scale ?? new Vector2(1, 1);

		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.save();
		this.context.globalAlpha = this.definition.opacity ?? 1;
		for (let row = 0; row < this.gridSize.y; row++) {
			for (let col = 0; col < this.gridSize.x; col++) {
				const drawWidth = tileWidth * scale.x;
				const drawHeight = tileHeight * scale.y;
				this.context.drawImage(
					this.definition.image.nativeElement,
					this.definition.framePosition.x,
					this.definition.framePosition.y,
					this.definition.frameSize.w,
					this.definition.frameSize.h,
					col * tileWidth + (tileWidth - drawWidth) / 2,
					row * tileHeight + (tileHeight - drawHeight) / 2,
					drawWidth,
					drawHeight,
				);
			}
		}
		this.context.restore();
	}
}
