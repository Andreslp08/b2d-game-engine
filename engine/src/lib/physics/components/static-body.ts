import { Component } from "../../ecs/component";
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
