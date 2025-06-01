import { GameObject } from "../../../common/entities/game-object";
import { ITranform } from "../../../input/interfaces/transform.interface";
import { RigidBody } from "../../../physics/components/rigid-body";
import { BodyType } from "../../../physics/enum/body-type";
import { BasicMovement } from "../components/basic-movement";

export class Character extends GameObject {
	constructor(transform: ITranform) {
		super(transform);
		this.addTag("character");
		this.addComponent(new BasicMovement());
		if (this.getComponent(RigidBody)) {
			this.getComponent(RigidBody).bodyType = BodyType.Dynamic;
		}
	}
}
