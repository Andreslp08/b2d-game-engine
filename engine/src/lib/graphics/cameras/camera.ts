import { PIXELS_PER_METER } from '../../common/constants';
import { Updatable } from "../../common/interfaces/updatable";
import { Scene } from "../scenes/scene";
import { Screen } from "../screen/screen";
import Vector2 from "../../math/vector2";
import { Renderable } from "../../common/interfaces/renderable";

export class Camera implements Updatable, Renderable {
	position: Vector2;
	zoomX: number;
	zoomY: number;
	private scene: Scene;

	constructor(initialPosition: Vector2, scene: Scene) {
		this.position = initialPosition;
		this.zoomX = 1;
		this.zoomY = 1;
		this.scene = scene;
	}

render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
	const screen = Screen.getInstance();
	const baseRes = screen.baseResolution;
	const canvasRes = screen.getResolution();

	// Escala uniforme para evitar distorsión: píxeles por metro * escala real
	const scaleX = canvasRes.x / baseRes.x;
	const scaleY = canvasRes.y / baseRes.y;
	const uniformScale = Math.min(scaleX, scaleY); // esto evita que se estire

	// Escalado total considerando zoom (en metros → píxeles)
	const totalScale = PIXELS_PER_METER * uniformScale * this.zoomX;

	context.imageSmoothingEnabled = false;
	context.save();

	// Escalar todo con una sola escala uniforme
	context.scale(totalScale, totalScale);

	// Centro visual del canvas en metros
	const halfWidthInMeters = (canvas.width / totalScale) / 2;
	const halfHeightInMeters = (canvas.height / totalScale) / 2;

	// Trasladar para centrar la posición de la cámara
	const cameraX = this.position.x - halfWidthInMeters;
	const cameraY = this.position.y - halfHeightInMeters;
	context.translate(-cameraX, -cameraY);

	// Renderizar la escena
	this.scene.render(canvas, context);

	context.restore();
}

	update(deltaTime: number): void {
		this.scene.update(deltaTime);
	}

	setPosition(vector2: Vector2): void {
		this.position = vector2;
	}
	getPosition(): Vector2 {
		return this.position;
	}

	setZoomX(zoomX: number): void {
		const previousZoomX = this.zoomX;
		this.zoomX = zoomX;
		const deltaZoomX = this.zoomX - previousZoomX;
		const deltaCameraX = (deltaZoomX * this.position.x) / this.zoomX;
		this.position.x -= deltaCameraX;
	}

	getZoomX(): number {
		return this.zoomX;
	}

	setZoomY(zoomY: number): void {
		const previousZoomY = this.zoomY;
		this.zoomY = zoomY;
		const deltaZoomY = this.zoomY - previousZoomY;
		const deltaCameraY = (deltaZoomY * this.position.y) / this.zoomY;
		this.position.y -= deltaCameraY;
	}

	getZoomY(): number {
		return this.zoomY;
	}
}
