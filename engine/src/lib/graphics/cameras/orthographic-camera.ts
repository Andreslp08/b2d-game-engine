import {
	PIXELS_PER_METER,
	VIEWPORT_HEIGHT_IN_METERS,
	VIEWPORT_WIDTH_IN_METERS,
} from "../../common/constants";
import { MathUtil } from "../../math/math-util";
import Vector2 from "../../math/vector2";
import { Scene } from "../../scenes/scene";
import { Screen } from "../screen/screen";
import { Camera } from "./camera";

export type OrthographicCameraSpace = "world" | "screen";

export class OrthographicCamera extends Camera {
	private renderingContext: CanvasRenderingContext2D = null;

	constructor(
		initialPosition: Vector2,
		scene: Scene,
		private readonly space: OrthographicCameraSpace = "world"
	) {
		super(initialPosition, scene);
		this.position = initialPosition;
		this.setFieldOfView(1);
		this.scene = scene;
	}

	protected calculateScale(renderingContext: CanvasRenderingContext2D) {
		const canvas = renderingContext.canvas;
		const PPM = PIXELS_PER_METER;
		const canvasWidth = canvas.width;
		const canvasHeight = canvas.height;

		const scaleX = canvasWidth / (VIEWPORT_WIDTH_IN_METERS * PPM);
		const scaleY = canvasHeight / (VIEWPORT_HEIGHT_IN_METERS * PPM);
		const uniformScale = Math.min(scaleX, scaleY);
		const baseScale = PPM * uniformScale;

		const totalScaleX = baseScale * this._fieldOfView;
		const totalScaleY = baseScale * this._fieldOfView;

		return new Vector2(totalScaleX, totalScaleY);
	}

	protected calculateOffset(renderingContext: CanvasRenderingContext2D) {
		const canvas = renderingContext.canvas;
		const canvasWidth = canvas.width;
		const canvasHeight = canvas.height;
		const totalScale = this.calculateScale(renderingContext);
		const renderWidth = VIEWPORT_WIDTH_IN_METERS * totalScale.x;
		const renderHeight = VIEWPORT_HEIGHT_IN_METERS * totalScale.y;
		const offsetX = (canvasWidth - renderWidth) / 2;
		const offsetY = (canvasHeight - renderHeight) / 2;

		return new Vector2(offsetX, offsetY);
	}

	protected calculateCameraPositionWithParallax(parallax: Vector2) {
		const cameraX = this.position.x * parallax.x - VIEWPORT_WIDTH_IN_METERS / 2;
		const cameraY = this.position.y * parallax.y - VIEWPORT_HEIGHT_IN_METERS / 2;
		return new Vector2(cameraX, cameraY);
	}

	getParallaxRenderOffset(layerParallax: Vector2, componentParallax: Vector2): Vector2 {
		const layerCameraPosition = this.calculateCameraPositionWithParallax(layerParallax);
		const componentCameraPosition = this.calculateCameraPositionWithParallax(componentParallax);
		return Vector2.substract(layerCameraPosition, componentCameraPosition);
	}

	applyTransform(renderingContext: CanvasRenderingContext2D, parallax = new Vector2(1, 1)): void {
		this.renderingContext = renderingContext;

		if (this.space === "screen") {
			this.applyScreenTransform(renderingContext);
			return;
		}

		const offset = this.calculateOffset(renderingContext);
		const totalScale = this.calculateScale(renderingContext);
		const cameraPosition = this.calculateCameraPositionWithParallax(parallax);

		renderingContext.translate(offset.x, offset.y);
		renderingContext.scale(totalScale.x, totalScale.y);
		renderingContext.translate(VIEWPORT_WIDTH_IN_METERS / 2, VIEWPORT_HEIGHT_IN_METERS / 2);
		renderingContext.rotate(MathUtil.degToRad(this.getRotation()));
		renderingContext.translate(-VIEWPORT_WIDTH_IN_METERS / 2, -VIEWPORT_HEIGHT_IN_METERS / 2);
		renderingContext.translate(-cameraPosition.x, -cameraPosition.y);
	}

	private applyScreenTransform(renderingContext: CanvasRenderingContext2D): void {
		const screen = Screen.getInstance();
		const baseRes = screen.baseResolution;
		const canvasRes = screen.getResolution();
		const scaleX = canvasRes.x / baseRes.x;
		const scaleY = canvasRes.y / baseRes.y;
		const uniformScale = Math.min(scaleX, scaleY);

		renderingContext.scale(uniformScale, uniformScale);
	}

	getWorldPositionFromScreenPosition(screenPosition: Vector2, parallax = new Vector2(1, 1)) {
		if (!this.renderingContext) return null;

		const offset = this.calculateOffset(this.renderingContext);
		const totalScale = this.calculateScale(this.renderingContext);
		const cameraPosition = this.calculateCameraPositionWithParallax(parallax);

		const dpr = window.devicePixelRatio || 1;
		const screenX = screenPosition.x * dpr - offset.x;
		const screenY = screenPosition.y * dpr - offset.y;

		const worldX = screenX / totalScale.x + cameraPosition.x;
		const worldY = screenY / totalScale.y + cameraPosition.y;

		return new Vector2(worldX, worldY);
	}

	getScreenSpacePositionFromCanvasRelativePosition(canvasRelativePosition: Vector2): Vector2 {
		const canvas = Screen.getInstance().getCanvasElement();
		const canvasRect = canvas.getBoundingClientRect();
		const screen = Screen.getInstance();
		const baseResolution = screen.baseResolution;
		const resolution = screen.getResolution();
		const uiScale = Math.min(
			resolution.x / baseResolution.x,
			resolution.y / baseResolution.y
		) || 1;
		const canvasPixelRatioX = canvasRect.width > 0 ? canvas.width / canvasRect.width : 1;
		const canvasPixelRatioY = canvasRect.height > 0 ? canvas.height / canvasRect.height : 1;

		return new Vector2(
			(canvasRelativePosition.x * canvasPixelRatioX) / uiScale,
			(canvasRelativePosition.y * canvasPixelRatioY) / uiScale
		);
	}

	getScreenPositionFromWorldPosition(
		worldPosition: Vector2,
		parallax = new Vector2(1, 1)
	): Vector2 {
		if (!this.renderingContext) return new Vector2(0, 0);
		const screen = Screen.getInstance();
		const baseRes = screen.baseResolution;
		const canvasRes = screen.getResolution();
		const scaleX = canvasRes.x / baseRes.x;
		const scaleY = canvasRes.y / baseRes.y;
		const uniformUIScale = Math.min(scaleX, scaleY);
		const scale = this.calculateScale(this.renderingContext);
		const offset = this.calculateOffset(this.renderingContext);
		const camera = this.calculateCameraPositionWithParallax(parallax);

		return new Vector2(
			((worldPosition.x - camera.x) * scale.x + offset.x) / uniformUIScale,
			((worldPosition.y - camera.y) * scale.y + offset.y) / uniformUIScale
		);
	}
}
