import type { TiledMapLoadResult } from "@b2d-engine/core/tiles/adapters/tiled/tiled-map-adapter";
import { isFromLayer } from "./map-layer";
import type { RoomLoadContext } from "../levels/room";
import Vector2 from "@b2d-engine/core/math/vector2";

export const generatePlayerSpawnPointFromMap = ({
	map,
	roomLoadContext,
}: {
	map: TiledMapLoadResult;
	roomLoadContext: RoomLoadContext;
}): { position: Vector2; facingDirection: "left" | "right" } => {
	const spawnPoints = map.objects.filter((object) => isFromLayer(object, "PlayerSpawnPoint"));
	if (!spawnPoints.length) return { position: new Vector2(0,0), facingDirection: "left" };
	const spawnPointId = roomLoadContext?.spawnPointId;
	const playerSpawn =
		spawnPoints.find((spawn) => spawn.properties.get("spawnPointId") === spawnPointId) ??
		spawnPoints[0];
	if (spawnPointId && playerSpawn.properties.get("spawnPointId") !== spawnPointId) {
		console.warn(
			`Player spawn point '${spawnPointId}' was not found; using the default spawn.`,
		);
	}
	return {
        position: playerSpawn.position.clone().add(playerSpawn.size.clone().multiplyBy(0.5)),
        facingDirection: playerSpawn.properties.get("spawnDirection") as "left" | "right",
    };
};
