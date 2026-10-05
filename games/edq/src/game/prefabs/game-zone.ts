import { VIEWPORT_WIDTH_IN_METERS } from "engine/common/constants";
import { GameObject } from "engine/common/entities/game-object";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";
import type { Scene } from "engine/scenes/scene";
import { TriggerArea } from "engine/trigger-area";
import { CameraZoneController } from "../script-components/camera-zones/camera-zone-controller";

type GameZoneArgs = {
	startPoint: Vector2;
	endPoint: Vector2;
	scene: Scene;
	player: GameObject;
};

export const createGameZone = ({ startPoint, endPoint, scene, player }: GameZoneArgs) => {
	const size = new Vector2(VIEWPORT_WIDTH_IN_METERS, 1000);
	const halfSize = size.clone().divide(new Vector2(2, 1));

	const playerSize = player.transform.size;

	const leftBound = new GameObject({
		position: startPoint,
		rotation: 0,
		size,
	});
	leftBound.addComponent(new Collider(new Vector2(-halfSize.x + playerSize.x / 2, 0), size));
	leftBound.addComponent(new TriggerArea(new Vector2(0, 0), size));
	leftBound.addComponent(
		new CameraZoneController({ enterAction: "static", exitAction: "follow-player" }),
	);

	const rightBound = new GameObject({
		position: endPoint,
		rotation: 0,
		size,
	});
	rightBound.addComponent(new Collider(new Vector2(halfSize.x + playerSize.x / 2, 0), size));
	rightBound.addComponent(new TriggerArea(new Vector2(playerSize.x, 0), size));
	rightBound.addComponent(
		new CameraZoneController({ enterAction: "static", exitAction: "follow-player" }),
	);

	scene.addEntity(leftBound);
	scene.addEntity(rightBound);
};
