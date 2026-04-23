import Vector2 from "../../math/vector2";
import { Camera } from "../cameras/camera";
import { Cameras } from "../cameras/camera-manager";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";

export type RenderLayerCameraSpace = "world" | "screen";

export class RenderLayer {
	private _cameraOverride: Camera = null;
	private _parallax: Vector2 = new Vector2(1, 1);
	private _visible = true;
	private _fade = false;
	private _fadeAlpha = 0;
	private _fadeColor = "#000";
	private _renderFilters = "";

	constructor(
		public readonly type: RenderLayerTypes,
		public order: number,
		public readonly cameraSpace: RenderLayerCameraSpace = "world"
	) {}

	get camera(): Camera {
		if (this._cameraOverride) return this._cameraOverride;
		return this.cameraSpace === "screen" ? Cameras.currentScreenCamera : Cameras.currentCamera;
	}

	setCamera(camera: Camera): void {
		this._cameraOverride = camera;
	}

	clearCameraOverride(): void {
		this._cameraOverride = null;
	}

	get parallax(): Vector2 {
		return this._parallax;
	}

	setParallax(parallax: Vector2): void {
		this._parallax = parallax;
	}

	get visible(): boolean {
		return this._visible;
	}

	setVisible(visible: boolean): void {
		this._visible = visible;
	}

	fadeLayer(fade: boolean, alpha: number, color?: string): void {
		this._fade = fade;
		this._fadeAlpha = alpha;
		this._fadeColor = color || "#000";
	}

	get isFade(): boolean {
		return this._fade;
	}

	get fadeAlpha(): number {
		return this._fadeAlpha;
	}

	get fadeColor(): string {
		return this._fadeColor;
	}

	setRenderFilters(filters: string): void {
		this._renderFilters = filters;
	}

	getRenderFilters(): string {
		return this._renderFilters;
	}
}
