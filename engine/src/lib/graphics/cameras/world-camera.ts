import {
	PIXELS_PER_METER,
	VIEWPORT_HEIGHT_IN_METERS,
	VIEWPORT_WIDTH_IN_METERS,
} from "../../common/constants";
import Vector2 from "../../math/vector2";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";
import { Scene } from "../scenes/scene";
import { Camera } from "./camera";

export class WorldCamera extends Camera {

	constructor(initialPosition: Vector2, scene: Scene) {
		super(initialPosition, scene);
		this.renderLayer = RenderLayerTypes.World;
		this.position = initialPosition;
		this.zoomX = 1;
		this.zoomY = 1;
		this.scene = scene;
	}

	render(renderingContext: CanvasRenderingContext2D): void {
		const canvas = renderingContext.canvas;
		const PPM = PIXELS_PER_METER;
		const canvasWidth = canvas.width;
		const canvasHeight = canvas.height;

		// 1. Escala basada en aspect ratio y tamaño lógico del viewport
		const scaleX = canvasWidth / (VIEWPORT_WIDTH_IN_METERS * PPM);
		const scaleY = canvasHeight / (VIEWPORT_HEIGHT_IN_METERS * PPM);
		const uniformScale = Math.min(scaleX, scaleY);
		const baseScale = PPM * uniformScale;

		// 2. Aplica zoom personalizado de cámara
		const totalScaleX = baseScale * this.zoomX;
		const totalScaleY = baseScale * this.zoomY;

		// 3. Calcular tamaño real del área renderizada con zoom aplicado
		const renderWidth = VIEWPORT_WIDTH_IN_METERS * totalScaleX;
		const renderHeight = VIEWPORT_HEIGHT_IN_METERS * totalScaleY;

		// 4. Compensar con offset para centrar (barras negras si es necesario)
		const offsetX = (canvasWidth - renderWidth) / 2;
		const offsetY = (canvasHeight - renderHeight) / 2;

		// 5. Calcular centro de cámara
		const cameraX = this.position.x - VIEWPORT_WIDTH_IN_METERS / 2;
		const cameraY = this.position.y - VIEWPORT_HEIGHT_IN_METERS / 2;

		// 6. Aplicar transformaciones en orden correcto
		renderingContext.translate(offsetX, offsetY); // Centrar en canvas
		renderingContext.scale(totalScaleX, totalScaleY); // Escalar con zoom
		renderingContext.translate(-cameraX, -cameraY); // Mover cámara
	}

}
