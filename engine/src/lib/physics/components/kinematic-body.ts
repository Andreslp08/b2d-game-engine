import { Component } from "../../ecs/component";
import Vector2 from "../../math/vector2";
import { GameObject } from "../../common/entities/game-object";
import { BodyType } from "../enum/body-type";

export class KinematicBody extends Component {
	private _bodyType: BodyType = BodyType.Kinematic;
	constructor(object: GameObject) {
		super();
		this.setEntity(object);
	}

	get bodyType(): BodyType {
		return this._bodyType;
	}
}
