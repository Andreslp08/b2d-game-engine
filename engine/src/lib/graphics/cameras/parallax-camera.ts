
import { PIXELS_PER_METER } from "../../common/constants";
import Vector2 from "../../math/vector2";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";
import { Scene } from "../scenes/scene";
import { Screen } from "../screen/screen";
import { Camera } from "./camera";
import { WorldCameras } from "./camera-managers";

export class ParallaxCamera extends Camera {
    zoomX: number;
    zoomY: number;
    generalParallax: number;

    constructor(scene: Scene) {
        super(new Vector2(0, 0), scene);
        this.renderLayer = RenderLayerTypes.Background;
        this.position = new Vector2(0, 0);
        this.zoomX = 1;
        this.zoomY = 1;
        this.scene = scene;
        this.generalParallax = 0.05;
    }

    render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
        this.position = WorldCameras.currentCamera.getPosition();
        const screen = Screen.getInstance();
        const baseRes = screen.baseResolution;
        const canvasRes = screen.getResolution();

        const scaleX = canvasRes.x / baseRes.x;
        const scaleY = canvasRes.y / baseRes.y;
        const uniformScale = Math.min(scaleX, scaleY);

        const totalScale = PIXELS_PER_METER * uniformScale;
        const halfWidth = context.canvas.width / totalScale / 2;
        const halfHeight = context.canvas.height / totalScale / 2;

        const cameraX = this.position.x * this.generalParallax - halfWidth;
        const cameraY = this.position.y * this.generalParallax - halfHeight;
        context.translate(-cameraX, -cameraY);
        // context.fillStyle = "#0f0";
        // context.fillRect(-3, -3, 50, 50);
    }

    update(deltaTime: number): void {
        this.scene.update(deltaTime);
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
