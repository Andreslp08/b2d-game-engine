import { Component } from "../../ecs/component";
import { ITranform } from "../../input/interfaces/transform.interface";
import Vector2 from "../../math/vector2";

export class Transform extends Component implements ITranform {
	position: Vector2;
	size: Vector2;
	rotation: number;

	constructor(transform: ITranform) {
		super();
		this.position = transform.position;
		this.size = transform.size;
		this.rotation = transform.rotation;
	}
}
