import { Renderable } from "../../common/interfaces/renderable";
import { Updatable } from "../../common/interfaces/updatable";
import { Camera } from "../cameras/camera";
import { CameraManager, BackgroundCameras, WorldCameras, EffectsCameras, UICameras, DebugCameras } from "../cameras/camera-managers";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";



export class RenderLayer implements Renderable, Updatable {
	protected renderLayer: RenderLayerTypes;
	protected _cameras: Camera[];
	protected _manager: CameraManager;

	constructor(manager: CameraManager) {
		this._manager = manager;
		this._cameras = manager.cameras;
	}

	get cameras(): Camera[] {
		return this._manager.cameras;
	}

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
		if (this._manager) {
			const currentCamera = this._manager.currentCamera;
			if (currentCamera) {
				currentCamera.render(canvas, context);
			}
		}
	}
	update(deltaTime: number): void {
		if (this._manager) {
			const currentCamera = this._manager.currentCamera;
			if (currentCamera) {
				currentCamera.update(deltaTime);
			}
		}
	}
}

export class RenderLayers {
	protected _backgroundLayer: RenderLayer;
	protected _worldLayer: RenderLayer;
	protected _effectsLayer: RenderLayer;
	protected _uiLayer: RenderLayer;
	protected _debugLayer: RenderLayer;

	constructor() {
		this._backgroundLayer = new RenderLayer(BackgroundCameras);
		this._worldLayer = new RenderLayer(WorldCameras);
		this._effectsLayer = new RenderLayer(EffectsCameras);
		this._uiLayer = new RenderLayer(UICameras);
		this._debugLayer = new RenderLayer(DebugCameras);
	}

	get backgroundLayer(): RenderLayer {
		return this._backgroundLayer;
	}

	get worldLayer(): RenderLayer {
		return this._worldLayer;
	}

	get effectsLayer(): RenderLayer {
		return this._effectsLayer;
	}

	get uiLayer(): RenderLayer {
		return this._uiLayer;
	}

	get debugLayer(): RenderLayer {
		return this._debugLayer;
	}
}

export class GameLayersRenderer implements Renderable, Updatable {
	renderManager: RenderLayers;
	constructor(renderManager: RenderLayers) {
		this.renderManager = renderManager;
	}

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
		this.renderManager.backgroundLayer.render(canvas, context);
		context.save();
		context.imageSmoothingEnabled = false;
		this.renderManager.worldLayer.render(canvas, context);
		context.restore();
		this.renderManager.effectsLayer.render(canvas, context);
		this.renderManager.uiLayer.render(canvas, context);
		this.renderManager.debugLayer.render(canvas, context);
	}
	update(deltaTime: number): void {
		this.renderManager.backgroundLayer.update(deltaTime);
		this.renderManager.worldLayer.update(deltaTime);
		this.renderManager.effectsLayer.update(deltaTime);
		this.renderManager.uiLayer.update(deltaTime);
		this.renderManager.debugLayer.update(deltaTime);
	}
}
