import { System } from "../ecs/system";
import { TileLayer } from "./tilemap-object";

export class TileMapSystem extends System {
	update(): void {
		// const scene = this.getScene();
		// if(!scene) return;
		// const entities = scene.getEntitiesAsArray();
		// for (const entity of entities) {
		
		// 	const tilemap = entity.constructor.name === "TileMapObject" ;
		// 	if(!tilemap) continue;
		// 	const tilelayers = entity.getComponents(TileLayer);
		// 	for (const tilelayer of tilelayers) {
		// 		// POSICIONAR LOS TILES, CREAR LOS COLLIDERS POR REFIONES, ETC, ETC.
		// 	}
			
		// }
	}

	fixedUpdate(): void {}
}
