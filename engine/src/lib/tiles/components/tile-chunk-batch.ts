import { PIXELS_PER_METER } from "../../common/constants";
import { Time } from "../../common/interfaces/time";
import { Component } from "../../ecs/component";
import Vector2 from "../../math/vector2";
import { TileAnimation, TileTextureData } from "../definitions";

export class TileChunkBatch extends Component {
	private static readonly cache = new Map<
		string,
		{ canvas: OffscreenCanvas | HTMLCanvasElement; context: CanvasRenderingContext2D }
	>();
	canvas: OffscreenCanvas | HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	readonly worldSize: Vector2;
	private definition: TileTextureData;
	private readonly animation?: TileAnimation;
	private animationFrameIndex = -1;
	private readonly gridSize: Vector2;
	private pixelsPerMeter = 0;

	constructor(
		definition: TileTextureData,
		cellSize: Vector2,
		gridSize: Vector2,
		animation?: TileAnimation,
	) {
		super();
		this.unique = false;
		this.definition = definition;
		this.animation = animation;
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
		this.updateAnimationFrame();
	}

	private setResolution(pixelsPerMeter: number): void {
		if (pixelsPerMeter === this.pixelsPerMeter) return;

		if (!this.animation) {
			const cacheKey = this.getCacheKey(pixelsPerMeter);
			const cachedBatch = TileChunkBatch.cache.get(cacheKey);
			if (cachedBatch) {
				this.canvas = cachedBatch.canvas;
				this.context = cachedBatch.context;
				this.pixelsPerMeter = pixelsPerMeter;
				return;
			}
		}

		const width = Math.max(1, Math.ceil(this.worldSize.x * pixelsPerMeter));
		const height = Math.max(1, Math.ceil(this.worldSize.y * pixelsPerMeter));
		this.canvas = typeof OffscreenCanvas !== "undefined"
			? new OffscreenCanvas(width, height)
			: Object.assign(document.createElement("canvas"), { width, height });
		this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		this.rebuild();
		if (!this.animation) {
			TileChunkBatch.cache.set(this.getCacheKey(pixelsPerMeter), { canvas: this.canvas, context: this.context });
		}
		this.pixelsPerMeter = pixelsPerMeter;
	}

	private updateAnimationFrame(): void {
		if (!this.animation || this.animation.frames.length === 0) return;

		const totalDuration = this.animation.frames.reduce((total, frame) => total + frame.duration, 0);
		if (totalDuration <= 0) return;

		let elapsed = (Time.time * 1000) % totalDuration;
		let frameIndex = this.animation.frames.length - 1;
		for (let index = 0; index < this.animation.frames.length; index++) {
			const frame = this.animation.frames[index];
			if (elapsed < frame.duration) {
				frameIndex = index;
				break;
			}
			elapsed -= frame.duration;
		}

		if (frameIndex === this.animationFrameIndex) return;
		this.animationFrameIndex = frameIndex;
		this.definition = this.animation.frames[frameIndex].texture;
		this.rebuild();
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
