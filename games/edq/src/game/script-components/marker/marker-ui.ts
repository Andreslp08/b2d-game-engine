import type { GameImage } from "@b2d-engine/core/common/assets-manager/game-image";
import { RenderLayerTypes } from "@b2d-engine/core/graphics/enum/render-layer-types.enum";
import Vector2 from "@b2d-engine/core/math/vector2";
import { UIComponent } from "@b2d-engine/core/ui/components/ui-component";
import { UIObject } from "@b2d-engine/core/ui/entities/ui-object";

export type MarkerFrame = {
	framePosition: Vector2;
	frameSize: { w: number; h: number };
};

class MarkerVisual extends UIComponent {
	private image: GameImage | null = null;
	private markerFrame: MarkerFrame | null = null;
	private markerPosition = new Vector2(0, 0);
	private markerSize = new Vector2(0, 0);
	private color = "#ffffff";
	private arrowVisible = false;
	private arrowFrame: MarkerFrame | null = null;
	private arrowPosition = new Vector2(0, 0);
	private arrowSize = new Vector2(0, 0);
	private arrowRotation = 0;
	private readonly tintedFrames = new Map<string, HTMLCanvasElement>();

	constructor() {
		super({ position: new Vector2(0, 0), rotation: 0, size: new Vector2(0, 0) });
	}

	setMarker(
		image: GameImage | null,
		frame: MarkerFrame,
		position: Vector2,
		size: Vector2,
		color: string,
	): void {
		this.image = image;
		this.markerFrame = frame;
		this.markerPosition = position;
		this.markerSize = size;
		this.color = color;
	}

	setArrow(frame: MarkerFrame, position: Vector2, size: Vector2, rotation: number): void {
		this.arrowVisible = true;
		this.arrowFrame = frame;
		this.arrowPosition = position;
		this.arrowSize = size;
		this.arrowRotation = rotation;
	}

	hideArrow(): void {
		this.arrowVisible = false;
	}

	render(context: CanvasRenderingContext2D): void {
		if (!this.image?.loaded || !this.markerFrame) return;
		this.renderFrame(context, this.markerFrame, this.markerPosition, this.markerSize, 0, true);
		if (this.arrowVisible && this.arrowFrame) {
			this.renderFrame(
				context,
				this.arrowFrame,
				this.arrowPosition,
				this.arrowSize,
				this.arrowRotation,
				false,
			);
		}
	}

	private renderFrame(
		context: CanvasRenderingContext2D,
		frame: MarkerFrame,
		position: Vector2,
		size: Vector2,
		rotation: number,
		tint: boolean,
	): void {
		context.save();
		context.translate(position.x, position.y);
		context.rotate((rotation * Math.PI) / 180);
		if (tint) {
			context.drawImage(this.getTintedFrame(frame), -size.x / 2, -size.y / 2, size.x, size.y);
		} else {
			context.drawImage(
				this.image.nativeElement,
				frame.framePosition.x,
				frame.framePosition.y,
				frame.frameSize.w,
				frame.frameSize.h,
				-size.x / 2,
				-size.y / 2,
				size.x,
				size.y,
			);
		}
		context.restore();
	}

	private getTintedFrame(frame: MarkerFrame): HTMLCanvasElement {
		const key = `${frame.framePosition.x}:${frame.framePosition.y}:${frame.frameSize.w}:${frame.frameSize.h}:${this.color}`;
		const cached = this.tintedFrames.get(key);
		if (cached) return cached;

		const canvas = document.createElement("canvas");
		canvas.width = frame.frameSize.w;
		canvas.height = frame.frameSize.h;
		const context = canvas.getContext("2d");
		if (!context) return canvas;

		context.drawImage(
			this.image.nativeElement,
			frame.framePosition.x,
			frame.framePosition.y,
			frame.frameSize.w,
			frame.frameSize.h,
			0,
			0,
			frame.frameSize.w,
			frame.frameSize.h,
		);
		context.globalCompositeOperation = "source-in";
		context.fillStyle = this.color;
		context.fillRect(0, 0, frame.frameSize.w, frame.frameSize.h);
		this.tintedFrames.set(key, canvas);
		return canvas;
	}
}

/** Renders marker atlas frames directly in the world render layer. */
export class MarkerUI extends UIObject {
	private readonly visual = new MarkerVisual();

	constructor() {
		super();
		this.renderLayer = RenderLayerTypes.World;
		// this.setZindex(-1);
		this.addComponent(this.visual);
	}

	setMarker(
		image: GameImage | null,
		frame: MarkerFrame,
		position: Vector2,
		size: Vector2,
		color: string,
	): void {
		this.visual.setMarker(image, frame, position, size, color);
	}

	setArrow(frame: MarkerFrame, position: Vector2, size: Vector2, rotation: number): void {
		this.visual.setArrow(frame, position, size, rotation);
	}

	hideArrow(): void {
		this.visual.hideArrow();
	}
}
