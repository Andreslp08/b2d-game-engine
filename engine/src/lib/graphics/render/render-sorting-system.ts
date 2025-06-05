
import { Entity } from "../../ecs/entity";
import { System } from "../../ecs/system";

export class ZIndexSortingSystem extends System {
	update(deltaTime: number, entities: Set<Entity>): void {
		const world = this.getScene();
		if (world) {
			world.sortEntitiesByZIndex();
		}
	}
}
