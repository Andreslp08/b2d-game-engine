import { Component } from "../../ecs/component";
import Vector2 from "../../math/vector2";
import { GameObject } from "../../common/entities/game-object";
import { BodyType } from "../enum/body-type";

export class StaticBody extends Component {
	private _bodyType: BodyType = BodyType.Static;
	constructor() {
		super();
	}

	get bodyType(): BodyType {
		return this._bodyType;
	}
}
