import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { Time } from "engine/common/interfaces/time";
import { MathUtil } from "engine/math/math-util";
import Vector2 from "engine/math/vector2";
import { UIComponent } from "engine/ui/components/ui-component";

export class SegmentBarUI extends UIComponent {
	private _value: number = 0;
	private _maxValue: number = 0;
	private _displayedValue: number = 0;
	private blurColor = "#f00";
	private segmentColor = "#fff";
	private backgroundBarColor = "#f00";
	constructor(private position: Vector2, private iconPath: string) {
		super({ position: position, rotation: 0, size: new Vector2(40, 5) });
	}

	getPosition(): Vector2 {
		return this.position;
	}

	setValue(value: number) {
		this._value = value;
	}

	getValue(): number {
		return this._value;
	}

	setMaxValue(value: number) {
		this._maxValue = value;
	}

	getMaxValue(): number {
		return this._maxValue;
	}

	getDisplayedValue(): number {
		return this._displayedValue;
	}

	setBackgroundBarColor(color: string) {
		this.backgroundBarColor = color;
	}

	getBackgroundBarColor(): string {
		return this.backgroundBarColor;
	}

	setSegmentColor(color: string) {
		this.segmentColor = color;
	}

	getSegmentColor(): string {
		return this.segmentColor;
	}

	setBlurColor(color: string) {
		this.blurColor = color;
	}

	getBlurColor(): string {
		return this.blurColor;
	}

	getIconPath(): string {
		return this.iconPath;
	}

	private drawBar(
		context: CanvasRenderingContext2D,
		color: string = "#fff",
		segments: number,
		barPosition: { x: number; y: number },
		segmentSize: { w: number; h: number },
		marginBetweenSegments: number
	): void {
		for (let i = 0; i < segments; i++) {
			const segmentPosition = {
				x: barPosition.x + i * segmentSize.w * marginBetweenSegments,
				y: barPosition.y + segmentSize.h,
			};
			context.fillStyle = color;
			context.fillRect(segmentPosition.x, segmentPosition.y, segmentSize.w, segmentSize.h);
		}
	}

	private drawFullUI(context: CanvasRenderingContext2D): void {
		this._displayedValue = MathUtil.lerp(this._displayedValue, this._value, 5 * Time.deltaTime);
		context.save();
		const gradient = context.createLinearGradient(0, 0, 0, this.transform.size.y);
		gradient.addColorStop(0, "#0A0C0F");
		gradient.addColorStop(0.37, "#16151C");
		gradient.addColorStop(0.73, "#15090C");
		gradient.addColorStop(1, "#150000");
		context.fillStyle = gradient;
		//  icon
		const iconContainerSize = 40;
		const iconContainerPosition = {
			x: 0,
			y: 0,
		};
		const iconSize = 40 * 0.9;
		const iconPosition = {
			x: iconContainerSize / 2 - iconSize / 2,
			y: iconContainerSize / 2 - iconSize / 2,
		};
		context.fillRect(
			iconContainerPosition.x,
			iconContainerPosition.y,
			iconContainerSize,
			iconContainerSize
		);
		const iconTexture = AssetsManager.getImageByPath(this.iconPath);
		const iconImage = iconTexture.nativeElement;
		if (iconTexture.loaded) {
			context.drawImage(iconImage, iconPosition.x, iconPosition.y, iconSize, iconSize);
		}

		//  bar container
		const barContainerSize = {
			w: 250,
			h: 50,
		};
		const barContainerPosition = {
			x: iconContainerPosition.x + iconContainerSize,
			y: iconContainerPosition.y - 10,
		};
		context.save();
		const lifeRatio = this._displayedValue / this._maxValue;
		const pulse = 0.5 + 0.5 * Math.cos(Time.time * 3);
		const intensityScale = 1 - lifeRatio;
		const pulseAlpha = Math.abs(pulse * intensityScale);

		context.globalAlpha = pulseAlpha;
		context.fillStyle = this.blurColor;
		context.filter = "blur(20px)";
		context.fillRect(
			barContainerPosition.x,
			barContainerPosition.y,
			barContainerSize.w,
			barContainerSize.h
		);
		context.restore();

		const containerTexture = AssetsManager.getImageByPath(
			"/assets/ui/segment-bar-container.png"
		);
		const image = containerTexture.nativeElement;
		if (containerTexture.loaded) {
			context.drawImage(
				image,
				barContainerPosition.x,
				barContainerPosition.y,
				barContainerSize.w,
				barContainerSize.h
			);
		}

		//  bar
		const segmentSize = {
			w: barContainerSize.w / 14,
			h: barContainerSize.h / 4,
		};
		const barPosition = {
			x: barContainerPosition.x * 1.5,
			y: barContainerPosition.y + segmentSize.h / 1.2,
		};
		const marginBetweenSegments = 1.2;
		const segments = 10;

		this.drawBar(
			context,
			this.backgroundBarColor,
			segments,
			barPosition,
			segmentSize,
			marginBetweenSegments
		);
		// 1. Calcular el ancho recortado según displayedHealth
		const ratio = this._displayedValue / this._maxValue;
		const clipWidth = segments * segmentSize.w * marginBetweenSegments * ratio;

		context.save();

		// 2. Definir el área de recorte (clip)
		context.beginPath();
		context.rect(barPosition.x, barPosition.y + segmentSize.h, clipWidth, segmentSize.h);
		context.clip();

		// 3. Dibujar la barra recortada
		this.drawBar(
			context,
			this.segmentColor,
			segments,
			barPosition,
			segmentSize,
			marginBetweenSegments
		);

		context.restore(); // Terminar recorte
		context.restore();
	}

	render(context: CanvasRenderingContext2D): void {
		context.save();
		context.translate(this.transform.position.x, this.transform.position.y);
		this.drawFullUI(context);
		context.restore();
	}
}
