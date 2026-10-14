import { Time } from "engine/common/interfaces/time";
import type { GameObject } from "engine/common/entities/game-object";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { ScriptComponent } from "engine/scripts/script-component";
import { TriggerArea } from "engine/trigger-area";
import Vector2 from "engine/math/vector2";
import type { Entity } from "engine/ecs/entity";
import { ArcadeLevelManagerInstance } from "../../arcade-levels/level-manager";
import type { TeleportParams } from "../../interfaces/teleport";
import { PlayerController } from "../player/player-controller";

export class TeleportController extends ScriptComponent {
	private isIntersecting = false;
	private player: GameObject;
	private readonly fadeDuration = 0.5;
	private teleportStartedAt: number | null = null;

	constructor(private params: Pick<TeleportParams, "roomId" | "levelId">) {
		super();
	}

	private isPlayer(entity: Entity): boolean {
		return entity.getTags().includes("player");
	}

	onTriggerEnter(entity: Entity): void {
		if (!this.isPlayer(entity)) return;
		const player = entity as GameObject;
		if (!player.getComponent(PlayerController)) return;
		this.player = player;
		this.isIntersecting = true;
	}

	onTriggerExit(entity: Entity): void {
		if (!this.isPlayer(entity) || this.teleportStartedAt !== null) return;
		this.isIntersecting = false;
	}

	private handleTeleport(player: GameObject): void {
		const playerArea = player.getComponent(TriggerArea);
		const teleportArea = this.entity.getComponent(TriggerArea);
		if (!teleportArea.contains(playerArea)) return;

		if (this.teleportStartedAt === null) {
			const playerController = player.getComponent(PlayerController);
			if (!playerController) return;

			playerController.enableInputController = false;
			const body = player.getComponent(DynamicBody);
			body.velocity = new Vector2(0, 0);
			this.entity.getScene().fade({
				duration: this.fadeDuration,
				to: 1,
				target: "screen",
			});
			this.teleportStartedAt = Time.time;
			return;
		}

		if (Time.time - this.teleportStartedAt < this.fadeDuration) return;

		this.isIntersecting = false;
		ArcadeLevelManagerInstance.loadLevel(this.params.levelId, this.params.roomId);
	}

	onFixedUpdate(): void {
		if (this.isIntersecting) this.handleTeleport(this.player);
	}
}
