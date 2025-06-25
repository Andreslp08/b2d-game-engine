import Vector2 from "../../math/vector2";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";
import { Scene } from "../../scenes/scene";
import { WorldCameras } from "./camera-managers";
import { WorldCamera } from "./world-camera";

export class EffectCamera extends WorldCamera {
	constructor(scene: Scene) {
		super(new Vector2(0, 0), scene);
		this.renderLayer = RenderLayerTypes.Effects;
		this.parallax = new Vector2(0.05, 0.02);
	}

	protected calculateOriginalCameraPosition(): Vector2 {
		const worldCamera = WorldCameras.currentCamera;
		if (worldCamera) {
			return new Vector2(worldCamera.getPosition().x, worldCamera.getPosition().y);
		}
		return new Vector2(0, 0);
	}
}
