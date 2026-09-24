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
	private _reloadMode = false;
	private _noAmmoMode = false;
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

	private drawStatusMessage(
		context: CanvasRenderingContext2D,
		message: string,
		center: Vector2,
	): void {
		context.save();
		context.font = "bold 10px sans-serif";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.lineWidth = 3;
		context.strokeStyle = "rgba(0, 0, 0, 0.85)";
		context.fillStyle = "#ffffff";
		context.strokeText(message, center.x, center.y);
		context.fillText(message, center.x, center.y);
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
		const crosshairCenter = new Vector2(
			this.transform.position.x + this.transform.size.x / 2,
			this.transform.position.y + this.transform.size.y / 2,
		);
		if (this._reloadMode) {
			this.drawRotatedImage(
				context,
				this._crosshairMainCircleImage,
				mainCirclePosition,
				mainCircleSize,
				this._mainCircleRotation,
			);
			this.drawStatusMessage(context, "RELOADING", crosshairCenter);
			return;
		}
		if (this._noAmmoMode) {
			this.drawRotatedImage(
				context,
				this._crosshairSecondaryCircleImage,
				secondaryCirclePosition,
				this.transform.size.clone(),
				this._secondaryCircleRotation,
			);
			this.drawStatusMessage(context, "NO AMMO", crosshairCenter);
			return;
		}
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

	/** Shows only the large circle while the equipped weapon is reloading. */
	setReloading(reloading: boolean): void {
		this._reloadMode = reloading;
	}

	/** Shows only the center reticle when the weapon has no available ammo. */
	setNoAmmo(noAmmo: boolean): void {
		this._noAmmoMode = noAmmo;
	}

	isVisible(): boolean {
		return this._visible;
	}
}
