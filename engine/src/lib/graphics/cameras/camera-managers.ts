import { RenderLayerTypes } from "../enum/render-layer-types.enum";
import { Camera } from "./camera";

export class CameraManager {
	protected _renderType: RenderLayerTypes;
	protected _cameras: Camera[];
    protected _currentCamera: Camera;

	constructor(renderType: RenderLayerTypes) {
		this._renderType = renderType;
		this._cameras = [];
	}

	get renderType(): RenderLayerTypes {
		return this._renderType;
	}

	addCamera(camera: Camera): void {
		if (camera.renderLayer === this._renderType) {
			this._cameras.push(camera);
		} else {
			throw new Error(`TemporalCamera is not of type ${this._renderType}`);
		}
	}

    hasCamera(camera: Camera): boolean {
        return this._cameras.includes(camera);
    }

	removeCamera(camera: Camera): void {
		const index = this._cameras.indexOf(camera, 0);
		if (index > -1) {
			this._cameras.splice(index, 1);
		}
	}

	removeAllCameras(): void {
		this._cameras = [];
	}

	get cameras(): Camera[] {
		return this._cameras;
	}

    get currentCamera(): Camera {
        return this._currentCamera;
    }

    setCurrentCamera(camera: Camera): void {
        this._currentCamera = camera;
    }
}

export class WorldCamerasManager extends CameraManager {
	constructor() {
		super(RenderLayerTypes.World);
	}
}

export class UICamerasManager extends CameraManager {
	constructor() {
		super(RenderLayerTypes.UI);
	}
}

export class DebugCamerasManager extends CameraManager {
	constructor() {
		super(RenderLayerTypes.Debug);
	}
}

export class EffectsCamerasManager extends CameraManager {
	constructor() {
		super(RenderLayerTypes.Effects);
	}
}

export class BackgroundCamerasManager extends CameraManager {
	constructor() {
		super(RenderLayerTypes.Background);
	}
}

export class ForegroundCamerasManager extends CameraManager {
	constructor() {
		super(RenderLayerTypes.Foreground);
	}
}

export const BackgroundCameras = new BackgroundCamerasManager();
export const WorldCameras = new WorldCamerasManager();
export const UICameras = new UICamerasManager();
export const ForegroundCameras = new ForegroundCamerasManager();
export const EffectsCameras = new EffectsCamerasManager();
export const DebugCameras = new DebugCamerasManager();
