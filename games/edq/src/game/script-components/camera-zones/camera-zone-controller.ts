import type { Entity } from "engine/ecs/entity";
import { ScriptComponent } from "engine/scripts/script-component";
import { PlayerCameraController } from "../player/player-camera-controller";

type AreaAction = "follow-player" | "static";

type CameraZoneControllerParams = {
	enterAction: AreaAction;
	exitAction: AreaAction;
};

export class CameraZoneController extends ScriptComponent {
	enterAction: AreaAction = "follow-player";
	exitAction: AreaAction = "static";

	constructor(
		{ enterAction, exitAction }: CameraZoneControllerParams = {
			enterAction: "follow-player",
			exitAction: "static",
		},
	) {
		super();
		this.enterAction = enterAction;
		this.exitAction = exitAction;
	}

	private isPlayer(entity: Entity): boolean {
		return entity.hasTag("player");
	}

	private setPlayerFollow(entity: Entity, enabled: boolean): void {
		const playerCameraController = entity.getComponent(PlayerCameraController);
		if (!playerCameraController) return;

		playerCameraController.lockAxis.x = !enabled;
	}

	onTriggerEnter(entity: Entity): void {
		if (!this.isPlayer(entity)) return;
		this.setPlayerFollow(entity, this.enterAction === "follow-player");
	}

	onTriggerExit(entity: Entity): void {
		if (!this.isPlayer(entity)) return;
		this.setPlayerFollow(entity, this.exitAction === "follow-player");
	}
}
