
import Vector2 from "../../math/vector2";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";
import { Scene } from "../scenes/scene";
import { ParallaxCamera } from "./parallax-camera";

export class BackgroundCamera extends ParallaxCamera {
	

	constructor(scene: Scene) {
		super(scene);
		this.renderLayer = RenderLayerTypes.Background;
		this.position = new Vector2(0, 0);
		this.zoomX = 1;
		this.zoomY = 1;
		this.scene = scene;
	}

}
