import { Entity } from "../entity";

export interface SystemUpdatable {
	update(deltaTime: number, entities: Set<Entity>): void;
}
