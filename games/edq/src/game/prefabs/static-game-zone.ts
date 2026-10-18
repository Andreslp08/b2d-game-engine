import { VIEWPORT_WIDTH_IN_WORLD_UNITS } from "@b2d-engine/core/common/constants";
import { GameObject } from "@b2d-engine/core/common/entities/game-object";
import Vector2 from "@b2d-engine/core/math/vector2";
import { Collider } from "@b2d-engine/core/physics/components/collider";
import type { Scene } from "@b2d-engine/core/scenes/scene";
import { PlayerCameraController } from "../script-components/player/player-camera-controller";

type StaticGameZoneArgs = {
	center: Vector2;
	player: GameObject;
	scene: Scene;
};

export const createStaticGameZone = ({ center, player, scene }: StaticGameZoneArgs) => {
	const camera = scene.getCurrentCamera();
	const halfViewportWidth = VIEWPORT_WIDTH_IN_WORLD_UNITS / camera.getFieldOfView() / 2;
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
	camera.setPosition(center);
	scene.addEntity(leftBound);
	scene.addEntity(rightBound);
};
