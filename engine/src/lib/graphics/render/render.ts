import { Renderable } from "../../common/interfaces/renderable";
import { Entity } from "../../ecs/entity";

export abstract class Renderer implements Renderable {
	entity: Entity;
	constructor(entity: Entity) {
		this.entity = entity;
	}

	abstract render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void;
}
