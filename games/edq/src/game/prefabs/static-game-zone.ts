import { VIEWPORT_WIDTH_IN_METERS } from "engine/common/constants";
import { GameObject } from "engine/common/entities/game-object";
import { Cameras } from "engine/graphics/cameras/camera-manager";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";
import type { Scene } from "engine/scenes/scene";
import { PlayerCameraController } from "../script-components/player/player-camera-controller";

type StaticGameZoneArgs = {
	center: Vector2;
	player: GameObject;
	scene: Scene;
};

export const createStaticGameZone = ({ center, player, scene }: StaticGameZoneArgs) => {
	const halfViewportWidth = VIEWPORT_WIDTH_IN_METERS / 2;
	const wallSize = new Vector2(1, 1000);

	const leftBound = new GameObject({
		position: new Vector2(center.x - halfViewportWidth - wallSize.x / 2, center.y),
		rotation: 0,
		size: wallSize,
	});
	leftBound.addComponent(new Collider(new Vector2(0, 0), wallSize));

	const rightBound = new GameObject({
		position: new Vector2(center.x + halfViewportWidth + wallSize.x / 2, center.y),
		rotation: 0,
		size: wallSize,
	});
	rightBound.addComponent(new Collider(new Vector2(0, 0), wallSize));

	const playerCameraController = player.getComponent(PlayerCameraController);
	if (playerCameraController) {
		playerCameraController.enabled = false;
	}
	Cameras.currentCamera.setPosition(center);
	scene.addEntity(leftBound);
	scene.addEntity(rightBound);
};
