import { Component } from "../ecs/component";
import { Entity } from "../ecs/entity";

export class ScriptComponent extends Component {

	constructor() {
		super();
		this.unique = false;
	}

	onCollisionEnter(_entity: Entity): void {}

	onTriggerEnter(_entity: Entity): void {}

	onTriggerExit(_entity: Entity): void {}

	onTriggerStay(_entity: Entity): void {}

	onStart(): void {}
	onUpdate(): void {}
	onFixedUpdate(): void {}
	onLateUpdate(): void {}
	onDestroy(): void {}
}
