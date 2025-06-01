import { Tags } from "../common/tags";
import { Renderable } from "../common/interfaces/renderable";
import { Entity } from "./entity";

export type ComponentClass<T extends Component> = new (...args: any[]) => T;

export abstract class Component implements Renderable {
	readonly tags: Tags;
	protected entity: Entity;

	constructor() {
		this.tags = new Tags();
	}

	setEntity(entity: Entity) {
		this.entity = entity;
	}

	getEntity(): Entity {
		return this.entity;
	}

	abstract render(
		canvas: HTMLCanvasElement,
		context: CanvasRenderingContext2D,
	): void;
}
