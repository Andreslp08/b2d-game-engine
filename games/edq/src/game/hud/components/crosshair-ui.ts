import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import type { GameImage } from "engine/common/assets-manager/game-image";
import { Time } from "engine/common/interfaces/time";
import { Cameras } from "engine/graphics/cameras/camera-manager";
import { OrthographicCamera } from "engine/graphics/cameras/orthographic-camera";
import { MouseManager } from "engine/input/mouse-manager";
import Vector2 from "engine/math/vector2";
import { UIComponent } from "engine/ui/components/ui-component";

export class CrossHairUI extends UIComponent {
	private _visible: boolean = false;
	private _crosshairImage: GameImage;
	private _crosshairMainCircleImage: GameImage;
	private _crosshairSecondaryCircleImage: GameImage;
	private _mainCircleRotation = 0;
	private _secondaryCircleRotation = 0;
	private readonly _mainCircleRotationSpeed = 50;
	private readonly _secondaryCircleRotationSpeed = 100;

	constructor() {
		super({ position: new Vector2(20, 20), rotation: 0, size: new Vector2(50, 50) });
		this._crosshairImage = AssetsManager.getImageByName("ui:crosshair");
		this._crosshairMainCircleImage = AssetsManager.getImageByName("ui:crosshair-main-circle");
		this._crosshairSecondaryCircleImage = AssetsManager.getImageByName(
			"ui:crosshair-secondary-circle",
		);
	}

	update(): void {
		this._mainCircleRotation += this._mainCircleRotationSpeed * Time.deltaTime;
		this._secondaryCircleRotation += this._secondaryCircleRotationSpeed * Time.deltaTime;
	}

	private drawRotatedImage(
		context: CanvasRenderingContext2D,
		image: GameImage,
		position: Vector2,
		size: Vector2,
		rotationInDegrees: number,
	): void {
		const centerX = position.x + size.x / 2;
		const centerY = position.y + size.y / 2;
		context.save();
		context.translate(centerX, centerY);
		context.rotate((rotationInDegrees * Math.PI) / 180);
		context.drawImage(image.nativeElement, -size.x / 2, -size.y / 2, size.x, size.y);
		context.restore();
	}

	render(context: CanvasRenderingContext2D): void {
		if (!this.isVisible()) return;
		const mousePosition = MouseManager.getRelativePosition();
		const uiCamera = Cameras.currentScreenCamera as OrthographicCamera;
		const uiMousePosition = uiCamera
			? uiCamera.getScreenSpacePositionFromCanvasRelativePosition(mousePosition)
			: mousePosition;
		this.transform.position = new Vector2(
			uiMousePosition.x - this.transform.size.x / 2,
			uiMousePosition.y - this.transform.size.y / 2,
		);
		const mainCirclePosition = new Vector2(this.transform.position.x - 10, this.transform.position.y - 10);
		const mainCircleSize = new Vector2(this.transform.size.x + 20, this.transform.size.y + 20);
		const secondaryCirclePosition = this.transform.position.clone();
		const secondaryCircleSize = this.transform.size.clone();
		this.drawRotatedImage(
			context,
			this._crosshairMainCircleImage,
			mainCirclePosition,
			mainCircleSize,
			this._mainCircleRotation,
		);
		this.drawRotatedImage(
			context,
			this._crosshairSecondaryCircleImage,
			secondaryCirclePosition,
			secondaryCircleSize,
			this._secondaryCircleRotation,
		);
		context.drawImage(
			this._crosshairImage.nativeElement,
			this.transform.position.x - 15,
			this.transform.position.y - 15,
			this.transform.size.x + 30,
			this.transform.size.y + 30,
		);
	}

	setVisible(visible: boolean) {
		this._visible = visible;
	}

	isVisible(): boolean {
		return this._visible;
	}
}
