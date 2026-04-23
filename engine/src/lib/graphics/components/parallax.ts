import { Component } from "../../ecs/component";
import Vector2 from "../../math/vector2";

export type ParallaxFactor = number | Vector2;

export class Parallax extends Component {
	constructor(public factor: ParallaxFactor = 1) {
		super();
	}

	getFactor(): Vector2 {
		if (typeof this.factor === "number") {
			return new Vector2(this.factor, this.factor);
		}
		return this.factor;
	}

	setFactor(factor: ParallaxFactor): void {
		this.factor = factor;
	}
}
