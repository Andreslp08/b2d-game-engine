import Vector2 from "../../math/vector2";
import { Camera } from "../cameras/camera";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";
import { RenderLayer } from "./render-layer";

export class RenderLayersManager {
	private readonly layers = new Map<RenderLayerTypes, RenderLayer>();

	constructor() {
		this.reset();
	}

	reset(): void {
		this.layers.clear();
		this.addLayer(new RenderLayer(RenderLayerTypes.Background, 0));
		this.addLayer(new RenderLayer(RenderLayerTypes.World, 1));
		this.addLayer(new RenderLayer(RenderLayerTypes.Foreground, 2));
		this.addLayer(new RenderLayer(RenderLayerTypes.Effects, 3));
		this.addLayer(new RenderLayer(RenderLayerTypes.UI, 4, "screen"));
		this.addLayer(new RenderLayer(RenderLayerTypes.Debug, 5, "screen"));
	}

	private addLayer(layer: RenderLayer): void {
		this.layers.set(layer.type, layer);
	}

	getLayer(type: RenderLayerTypes): RenderLayer {
		return this.layers.get(type);
	}

	getOrderedLayers(): RenderLayer[] {
		return Array.from(this.layers.values()).sort((a, b) => a.order - b.order);
	}

	setLayerCamera(type: RenderLayerTypes, camera: Camera): void {
		this.getLayer(type)?.setCamera(camera);
	}

	clearLayerCamera(type: RenderLayerTypes): void {
		this.getLayer(type)?.clearCameraOverride();
	}

	getLayerCamera(type: RenderLayerTypes): Camera {
		return this.getLayer(type)?.camera ?? null;
	}

	setLayerParallax(type: RenderLayerTypes, parallax: Vector2): void {
		this.getLayer(type)?.setParallax(parallax);
	}

	getLayerParallax(type: RenderLayerTypes): Vector2 {
		return this.getLayer(type)?.parallax ?? new Vector2(1, 1);
	}
}

export const RenderLayers = new RenderLayersManager();
