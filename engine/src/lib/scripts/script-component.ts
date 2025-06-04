import { Component } from "../ecs/component";
import { Entity } from "../ecs/entity";

export class ScriptComponent extends Component {
	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {}

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
	onUpdate(deltaTime: number): void {}
	onDestroy(): void {}
}
