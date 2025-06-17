import {
	PIXELS_PER_METER,
	VIEWPORT_HEIGHT_IN_METERS,
	VIEWPORT_WIDTH_IN_METERS,
} from "../../common/constants";
import { MathUtil } from "../../math/math-util";
import Vector2 from "../../math/vector2";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";
import { Scene } from "../scenes/scene";
import { Screen } from "../screen/screen";
import { Camera } from "./camera";

export class WorldCamera extends Camera {
	parallax: Vector2 = new Vector2(1, 1);
	private renderingContext: CanvasRenderingContext2D = null;
	constructor(initialPosition: Vector2, scene: Scene) {
		super(initialPosition, scene);
		this.renderLayer = RenderLayerTypes.World;
		this.position = initialPosition;
		this.setFieldOfView(1);
		this.scene = scene;
	}

	protected calculateScale(renderingContext: CanvasRenderingContext2D) {
		const canvas = renderingContext.canvas;
		const PPM = PIXELS_PER_METER;
		const canvasWidth = canvas.width;
		const canvasHeight = canvas.height;

		// Escala basada en aspect ratio y tamaño lógico del viewport
		const scaleX = canvasWidth / (VIEWPORT_WIDTH_IN_METERS * PPM);
		const scaleY = canvasHeight / (VIEWPORT_HEIGHT_IN_METERS * PPM);
		const uniformScale = Math.min(scaleX, scaleY);
		const baseScale = PPM * uniformScale;

		// Aplica zoom personalizado de cámara
		const totalScaleX = baseScale * this._fieldOfView;
		const totalScaleY = baseScale * this._fieldOfView;

		return new Vector2(totalScaleX, totalScaleY);
	}

	protected calculateOffset(renderingContext: CanvasRenderingContext2D) {
		const canvas = renderingContext.canvas;
		const canvasWidth = canvas.width;
		const canvasHeight = canvas.height;
		const totalScale = this.calculateScale(renderingContext);
		// Calcular tamaño real del área renderizada con zoom aplicado
		const renderWidth = VIEWPORT_WIDTH_IN_METERS * totalScale.x;
		const renderHeight = VIEWPORT_HEIGHT_IN_METERS * totalScale.y;
		// Compensar con offset para centrar (barras negras si es necesario)
		const offsetX = (canvasWidth - renderWidth) / 2;
		const offsetY = (canvasHeight - renderHeight) / 2;

		return new Vector2(offsetX, offsetY);
	}

	protected calculateOriginalCameraPosition() {
		return this.position;
	}

	protected calculateCameraPosition() {
		const originalCameraPosition = this.calculateOriginalCameraPosition();
		const cameraX = originalCameraPosition.x * this.parallax.x - VIEWPORT_WIDTH_IN_METERS / 2;
		const cameraY = originalCameraPosition.y * this.parallax.y - VIEWPORT_HEIGHT_IN_METERS / 2;
		return new Vector2(cameraX, cameraY);
	}

	render(renderingContext: CanvasRenderingContext2D): void {
		this.renderingContext = renderingContext;
		const offset = this.calculateOffset(renderingContext);
		const totalScale = this.calculateScale(renderingContext);
		const cameraPosition = this.calculateCameraPosition();
		renderingContext.translate(offset.x, offset.y);
		renderingContext.scale(totalScale.x, totalScale.y);
		renderingContext.translate(-cameraPosition.x, -cameraPosition.y);
		renderingContext.rotate(MathUtil.degToRad(this.getRotation()));
	}

	getWorldPositionFromScreenPosition(screenPosition: Vector2) {
		if (!this.renderingContext) return null;

		const offset = this.calculateOffset(this.renderingContext);
		const totalScale = this.calculateScale(this.renderingContext);
		const cameraPosition = this.calculateCameraPosition();

		// Remover el offset (barras negras)
		const screenX = screenPosition.x - offset.x;
		const screenY = screenPosition.y - offset.y;

		// Remover el escalado
		const worldX = screenX / totalScale.x + cameraPosition.x;
		const worldY = screenY / totalScale.y + cameraPosition.y;

		return new Vector2(worldX, worldY);
	}

	getScreenPositionFromWorldPosition(worldPosition: Vector2): Vector2 {
		if (!this.renderingContext) return new Vector2(0, 0);
		// MISMA LOGICA DE UI CAMERA PARA ESCALAR
		const screen = Screen.getInstance();
		const baseRes = screen.baseResolution;
		const canvasRes = screen.getResolution();
		const scaleX = canvasRes.x / baseRes.x;
		const scaleY = canvasRes.y / baseRes.y;
		const uniformUIScale = Math.min(scaleX, scaleY);

		// LÓGICA DE WORLD CAMERA
		const scale = this.calculateScale(this.renderingContext); // PPM * zoom * min(scaleX, scaleY)
		const offset = this.calculateOffset(this.renderingContext); // barras negras
		const camera = this.calculateCameraPosition(); // esquina sup izquierda

		return new Vector2(
			(worldPosition.x / uniformUIScale - camera.x / uniformUIScale) * scale.x + offset.x,
			(worldPosition.y / uniformUIScale - camera.y / uniformUIScale) * scale.y + offset.y
		);
	}
}
