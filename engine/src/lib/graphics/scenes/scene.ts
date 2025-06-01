import { Camera } from "../cameras/camera";
import Vector2 from "../../math/vector2";
import { ECS } from "../../ecs/ecs";

export class Scene extends ECS {
	public camera: Camera;

	constructor() {
		super();
		this.camera = new Camera(new Vector2(0, 0), this);
	}

}
