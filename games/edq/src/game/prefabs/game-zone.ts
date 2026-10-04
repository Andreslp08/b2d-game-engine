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
};

export const createGameZone = ({ startPoint, endPoint, scene }: GameZoneArgs) => {
	const size = new Vector2(VIEWPORT_WIDTH_IN_METERS / 2, 1000);

	const leftBound = new GameObject({ position: startPoint, rotation: 0, size });
	leftBound.addComponent(new Collider(new Vector2(-size.x, 0), size));
	leftBound.addComponent(new TriggerArea(new Vector2(0, 0), size));
	leftBound.addComponent(
		new CameraZoneController({ enterAction: "static", exitAction: "follow-player" }),
	);

	const rightBound = new GameObject({ position: endPoint, rotation: 0, size });
	rightBound.addComponent(new TriggerArea(new Vector2(0, 0), size));
	rightBound.addComponent(new Collider(new Vector2(size.x, 0), size));
	rightBound.addComponent(
		new CameraZoneController({ enterAction: "static", exitAction: "follow-player" }),
	);

	scene.addEntity(leftBound);
	scene.addEntity(rightBound);
};
