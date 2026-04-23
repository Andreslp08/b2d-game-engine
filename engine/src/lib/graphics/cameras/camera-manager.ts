import { Camera } from "./camera";

export class CameraManager {
	private _cameras: Camera[] = [];
	private _currentCamera: Camera = null;
	private _currentScreenCamera: Camera = null;

	addCamera(camera: Camera): void {
		if (!this._cameras.includes(camera)) {
			this._cameras.push(camera);
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
		if (this._currentCamera === camera) {
			this._currentCamera = null;
		}
		if (this._currentScreenCamera === camera) {
			this._currentScreenCamera = null;
		}
	}

	removeAllCameras(): void {
		this._cameras = [];
		this._currentCamera = null;
		this._currentScreenCamera = null;
	}

	get cameras(): Camera[] {
		return this._cameras;
	}

	get currentCamera(): Camera {
		return this._currentCamera;
	}

	set currentCamera(camera: Camera) {
		this.setCurrentCamera(camera);
	}

	setCurrentCamera(camera: Camera): void {
		this._currentCamera = camera;
		this.addCamera(camera);
	}

	get currentScreenCamera(): Camera {
		return this._currentScreenCamera;
	}

	set currentScreenCamera(camera: Camera) {
		this.setCurrentScreenCamera(camera);
	}

	setCurrentScreenCamera(camera: Camera): void {
		this._currentScreenCamera = camera;
		this.addCamera(camera);
	}
}

export const Cameras = new CameraManager();
