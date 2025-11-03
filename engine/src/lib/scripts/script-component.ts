import { Component } from "../ecs/component";
import { Entity } from "../ecs/entity";

export class ScriptComponent extends Component {

	constructor() {
		super();
		this.unique = false;
	}

	onCollisionEnter(entity: Entity): void {}

	onTriggerEnter(entity: Entity): void {}

	onTriggerExit(entity: Entity): void {}

	onTriggerStay(entity: Entity): void {}

	onStart(): void {}
	onUpdate(): void {}
	onFixedUpdate(): void {}
	onLateUpdate(): void {}
	onDestroy(): void {}
}
