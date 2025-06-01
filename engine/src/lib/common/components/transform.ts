import { Component } from "../../ecs/component";
import { ITranform } from "../../input/interfaces/transform.interface";
import Vector2 from "../../math/vector2";

export class Transform extends Component implements ITranform {
	position: Vector2;
	size: Vector2;
	rotation: number;
	drawShape: boolean;

	constructor(transform: ITranform) {
		super();
		this.position = transform.position;
		this.size = transform.size;
		this.rotation = transform.rotation;
	}

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
		context.beginPath();
		if (this.drawShape) {
			context.save();
			context.strokeStyle = "#0f0";
			context.lineWidth = 0.03;
			context.strokeRect(
				this.position.x - this.size.x / 2,
				this.position.y - this.size.y / 2,
				this.size.x,
				this.size.y
			);
			context.restore();
		}
		context.closePath();
	}
}
