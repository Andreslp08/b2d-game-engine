import { Component } from "../ecs/component";
import { Entity } from "../ecs/entity";

export class ScriptComponent extends Component {

	constructor(entity: Entity) {
		super();
		entity.addComponent(this);
		this.setEntity(entity);
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
