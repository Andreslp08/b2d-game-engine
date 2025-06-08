import {
	PIXELS_PER_METER,
	VIEWPORT_HEIGHT_IN_METERS,
	VIEWPORT_WIDTH_IN_METERS,
} from "../../common/constants";
import Vector2 from "../../math/vector2";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";
import { Scene } from "../scenes/scene";
import { Screen } from "../screen/screen";
import { Camera } from "./camera";
import { WorldCameras } from "./camera-managers";

export class ParallaxCamera extends Camera {
	generalParallax: { x: number; y: number } = { x: 0, y: 0 };

	constructor(scene: Scene) {
		super(new Vector2(0, 0), scene);
		this.renderLayer = RenderLayerTypes.Background;
		this.position = new Vector2(0, 0);
		this.zoomX = 1;
		this.zoomY = 1;
		this.scene = scene;
		this.generalParallax.x = 0.05;
		this.generalParallax.y = 0.02;
	}

	render(renderingContext: CanvasRenderingContext2D): void {
		const worldCamera = WorldCameras.currentCamera;
		if (!worldCamera) {
			return;
		}
		this.position = worldCamera.getPosition();
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
		const cameraX = this.position.x * this.generalParallax.x - VIEWPORT_WIDTH_IN_METERS / 2;
		const cameraY = this.position.y * this.generalParallax.y - VIEWPORT_HEIGHT_IN_METERS / 2;

		// 6. Aplicar transformaciones en orden correcto
		renderingContext.translate(offsetX, offsetY); // Centrar en canvas
		renderingContext.scale(totalScaleX, totalScaleY); // Escalar con zoom
		renderingContext.translate(-cameraX, -cameraY); // Mover cámara
	}

}
