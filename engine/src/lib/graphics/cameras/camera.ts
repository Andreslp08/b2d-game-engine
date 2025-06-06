import { Updatable } from "../../common/interfaces/updatable";
import { Scene } from "../scenes/scene";
import Vector2 from "../../math/vector2";
import { Renderable } from "../../common/interfaces/renderable";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";

export class Camera implements Renderable, Updatable {
	renderLayer: RenderLayerTypes;
	protected position: Vector2;
	scene: Scene;

	constructor(initialPosition: Vector2, scene: Scene) {
		this.renderLayer = RenderLayerTypes.World;
		this.position = initialPosition;
		this.scene = scene;
	}

	public setPosition(vector2: Vector2): void {
		this.position = vector2;
	}
	public getPosition(): Vector2 {
		return this.position;
	}
	render(context: CanvasRenderingContext2D): void {}
	update(deltaTime: number): void {}
}
