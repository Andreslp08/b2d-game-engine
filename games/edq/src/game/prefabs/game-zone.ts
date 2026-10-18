import { VIEWPORT_WIDTH_IN_WORLD_UNITS } from "@b2d-engine/core/common/constants";
import { GameObject } from "@b2d-engine/core/common/entities/game-object";
import Vector2 from "@b2d-engine/core/math/vector2";
import { Collider } from "@b2d-engine/core/physics/components/collider";
import type { Scene } from "@b2d-engine/core/scenes/scene";
import { TriggerArea } from "@b2d-engine/core/trigger-area";
import { StaticBody } from "@b2d-engine/core/physics/components/static-body";
import { CameraZoneController } from "../script-components/camera-zones/camera-zone-controller";
import { PlayerCameraController } from "../script-components/player/player-camera-controller";

type GameZoneArgs = {
	startPoint: Vector2;
	endPoint: Vector2;
	scene: Scene;
	player: GameObject;
};

export const createGameZone = ({ startPoint, endPoint, scene, player }: GameZoneArgs) => {
	const visibleViewportWidth =
		VIEWPORT_WIDTH_IN_WORLD_UNITS / scene.getCurrentCamera().getFieldOfView();
	const size = new Vector2(visibleViewportWidth, 1000);
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

type MapGameZoneArgs = {
	bounds: { position: Vector2; size: Vector2 };
	scene: Scene;
	player: GameObject;
};

export const createMapGameZone = ({ bounds, scene, player }: MapGameZoneArgs) => {
	const wallThickness = 1;
	const center = bounds.position.clone().add(bounds.size.clone().multiplyBy(0.5));
	const horizontalWallSize = new Vector2(bounds.size.x + wallThickness * 2, wallThickness);
	const verticalWallSize = new Vector2(wallThickness, bounds.size.y + wallThickness * 2);
	const left = bounds.position.x - wallThickness / 2;
	const right = bounds.position.x + bounds.size.x + wallThickness / 2;
	const top = bounds.position.y - wallThickness / 2;
	const bottom = bounds.position.y + bounds.size.y + wallThickness / 2;

	const addWall = (position: Vector2, size: Vector2) => {
		const wall = new GameObject({ position, rotation: 0, size });
		wall.addComponent(new Collider(Vector2.ZERO.clone(), size));
		wall.addComponent(new StaticBody());
		scene.addEntity(wall);
	};

	addWall(new Vector2(left, center.y), verticalWallSize);
	addWall(new Vector2(right, center.y), verticalWallSize);
	addWall(new Vector2(center.x, top), horizontalWallSize);
	addWall(new Vector2(center.x, bottom), horizontalWallSize);

	const cameraController = player.getComponent(PlayerCameraController);
	if (!cameraController) return;

	cameraController.setBounds(center, bounds.size);
	cameraController.snapToTarget();
};
