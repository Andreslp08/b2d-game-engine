import { Renderable } from "../common/interfaces/renderable";
import { Updatable } from "../common/interfaces/updatable";
import { Component, ComponentClass } from "./component";
import { Entity } from "./entity";
import { System } from "./system";

export class ECS implements Updatable, Renderable {
	protected entities: Set<Entity> = new Set();
	protected systems: Set<System> = new Set();

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
		this.entities.forEach((entity) => entity.render(canvas, context));
	}
	update(deltaTime: number): void {
		this.systems.forEach((system) => system.update(deltaTime, this.entities));
	}

	addEntity(entity: Entity): string {
		this.entities.add(entity);
		return entity.id;
	}

	getEntityById<T>(id: string): T | null {
		for (const entity of this.entities) {
			if (entity.id === id) {
				return entity as T;
			}
		}
		return null;
	}

	getEntityByTag<T>(tag: string): T | null {
		for (const entity of this.entities) {
			if (entity.hasTag(tag)) {
				return entity as T;
			}
		}
		return null;
	}

	destroyEntity(entity: Entity): void {
		this.entities.delete(entity);
	}

	destroyEntityById(id: string): void {
		this.entities.delete(this.getEntityById(id) as Entity);
	}

	addSystem(system: System): string {
		this.systems.add(system);
		return system.getName();
	}

	getSystemByName(name: string): System | null {
		for (const system of this.systems) {
			if (system.getName() === name) {
				return system;
			}
		}
		return null;
	}

	destroySystemByName(name: string): void {
		this.systems.delete(this.getSystemByName(name) as System);
	}

	destroySystem(system: System): void {
		this.systems.delete(system);
	}

	getEntitiesWithComponent<T extends Component>(componentClass: ComponentClass<T>): Entity[] {
		return Array.from(this.entities).filter((e) => e.hasComponent(componentClass));
	}
}
