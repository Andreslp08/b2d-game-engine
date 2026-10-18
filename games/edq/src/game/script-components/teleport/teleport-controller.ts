import { Time } from "@b2d-engine/core/common/interfaces/time";
import type { GameObject } from "@b2d-engine/core/common/entities/game-object";
import { DynamicBody } from "@b2d-engine/core/physics/components/dynamic-body";
import { ScriptComponent } from "@b2d-engine/core/scripts/script-component";
import { TriggerArea } from "@b2d-engine/core/trigger-area";
import Vector2 from "@b2d-engine/core/math/vector2";
import type { Entity } from "@b2d-engine/core/ecs/entity";
import { ArcadeLevelManagerInstance } from "../../arcade-levels/level-manager";
import type { TeleportParams } from "../../interfaces/teleport";
import { PlayerInputController } from "../player/player-input-controller";

export class TeleportController extends ScriptComponent {
	private isIntersecting = false;
	private player: GameObject;
	private readonly fadeDuration = 0.5;
	private teleportStartedAt: number | null = null;

	constructor(private params: Pick<TeleportParams, "roomId" | "levelId" | "loadContext">) {
		super();
	}

	private isPlayer(entity: Entity): boolean {
		return entity.getTags().includes("player");
	}

	onTriggerEnter(entity: Entity): void {
		if (!this.isPlayer(entity)) return;
		const player = entity as GameObject;
		if (!player.getComponent(PlayerInputController)) return;
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
			const playerInput = player.getComponent(PlayerInputController);
			if (!playerInput) return;

			playerInput.disableAll();
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
		void ArcadeLevelManagerInstance.loadLevel(this.params.levelId, this.params.roomId, {
			loadContext: this.params.loadContext,
		});
	}

	onFixedUpdate(): void {
		if (this.isIntersecting) this.handleTeleport(this.player);
	}
}
