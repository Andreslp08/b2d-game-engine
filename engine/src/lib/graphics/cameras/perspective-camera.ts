import Vector2 from "../../math/vector2";
import { Scene } from "../../scenes/scene";
import { Camera } from "./camera";

export class PerspectiveCamera extends Camera {
	constructor(initialPosition: Vector2, scene: Scene) {
		super(initialPosition, scene);
	}

	applyTransform(_context: CanvasRenderingContext2D): void {
		throw new Error("PerspectiveCamera is not supported by the Canvas2D renderer yet.");
	}
}
