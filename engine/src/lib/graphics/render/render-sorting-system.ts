
import { System } from "../../ecs/system";

export class ZIndexSortingSystem extends System {
	update(): void {
		const world = this.getScene();
		if (world) {
			world.sortEntitiesByZIndex();
		}
	}

	fixedUpdate(): void {}
}
