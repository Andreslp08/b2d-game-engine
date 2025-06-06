
import { System } from "../../ecs/system";

export class ZIndexSortingSystem extends System {
	update(deltaTime: number): void {
		const world = this.getScene();
		if (world) {
			world.sortEntitiesByZIndex();
		}
	}
}
