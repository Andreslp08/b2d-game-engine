import type { GameObject } from "engine/common/entities/game-object";
import { Time } from "engine/common/interfaces/time";
import { StateMachine, type StateMachineConfig } from "engine/common/state/state-machine";
import { MathUtil } from "engine/math/math-util";
import Vector2 from "engine/math/vector2";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { ScriptComponent } from "engine/scripts/script-component";
import { TailGunnerShotController } from "./tail-gunner-shot-controller";
import { TailGunnerSpriteController, type TailGunnerSpriteState } from "./tail-gunner-sprite-controller";

type State = "idle" | "patrol" | "chase" | "attack";

const config: StateMachineConfig<State> = {
	initialState: { name: "patrol", data: null },
	transitions: [
		{ from: "idle", to: ["patrol", "chase", "attack"] },
		{ from: "patrol", to: ["chase", "attack"] },
		{ from: "chase", to: ["patrol", "attack"] },
		{ from: "attack", to: ["patrol", "chase"] },
	],
};

export class TailAIController extends ScriptComponent {
	stateMachine = new StateMachine<State>(config);
	player: GameObject;
	attackRange = 3;
	attackCooldownUntil = 0;
	attackCooldownDuration = 3;
	shotRate = 0.5;
	maxShots = 5;
	shotTime = 0;
	totalShots = 0;
	patrolStartPoint: Vector2;
	patrolEndPoint: Vector2;
	gameObject: GameObject;
	patrolPositionTarget: "start" | "end" = "end";
	patrolForce = 5000;
	patrolIdleDuration = 4;
	patrolIdleTime = 0;

	onStart(): void {
		this.gameObject = this.entity as GameObject;
		this.patrolStartPoint = this.gameObject.transform.position.clone();
		this.patrolEndPoint = this.gameObject.transform.position.clone().add(new Vector2(3, 0));
	}

	updateSprite(state: TailGunnerSpriteState): void {
		const spriteController = this.entity.getComponent(TailGunnerSpriteController);
		if (spriteController) spriteController.currentSpriteState = state;
	}

	handlePatrol(): void {
		const body = this.gameObject.getComponent(DynamicBody);
		const transform = this.gameObject.transform;
		const targetPosition = this.patrolPositionTarget === "end" ? this.patrolEndPoint : this.patrolStartPoint;
		if (!body) return;

		const distanceToTarget = targetPosition.x - transform.position.x;
		const reachedTarget = Math.abs(distanceToTarget) <= 0.15 ||
			(body.velocity.x !== 0 && Math.sign(body.velocity.x) !== Math.sign(distanceToTarget));

		if (reachedTarget) {
			transform.position.x = targetPosition.x;
			body.velocity.x = 0;
			this.patrolIdleTime = Time.time;
			this.patrolPositionTarget = this.patrolPositionTarget === "end" ? "start" : "end";
		}

		if (Time.time - this.patrolIdleTime < this.patrolIdleDuration) {
			body.velocity.x = 0;
			this.updateSprite("idle");
			return;
		}

		const direction = targetPosition.clone().substract(transform.position).normalize();
		this.updateSprite("walk");
		body.addForce(new Vector2(direction.x * this.patrolForce, 0));
	}

	handleAttack(): void {
		const shotController = this.entity.getComponent(TailGunnerShotController);
		if (!shotController) return;
		const body = this.gameObject.getComponent(DynamicBody);
		if (body) {
			body.velocity.x = 0;
			this.facePlayer(body);
		}
		this.updateSprite("attack");

		if (Time.time - this.shotTime >= this.shotRate && this.totalShots < this.maxShots) {
			shotController.shot(this.player);
			this.totalShots++;
			this.shotTime = Time.time;
		}
		if (this.totalShots >= this.maxShots) {
			this.attackCooldownUntil = Time.time + this.attackCooldownDuration;
			this.stateMachine.transition({ name: "patrol", data: null });
		}
	}

	executeIA(): void {
		this.player = this.entity.getScene()?.getEntityByTag("player");
		if (!this.player) return;

		const stateName = this.stateMachine.stateValue().name;
		if (stateName === "attack") {
			this.handleAttack();
			return;
		}

		if (stateName === "patrol") {
			this.handlePatrol();
			const playerInRange = MathUtil.getDistanceBetweenEntities(this.player, this.entity) <= this.attackRange;
			if (playerInRange && Time.time >= this.attackCooldownUntil) {
				const body = this.gameObject.getComponent(DynamicBody);
				if (body) this.facePlayer(body);
				this.stateMachine.transition({ name: "attack", data: null });
				this.shotTime = Time.time;
				this.totalShots = 0;
			}
		}
	}

	private facePlayer(body: DynamicBody): void {
		const playerX = this.player.transform.position.x;
		const enemyX = this.gameObject.transform.position.x;
		if (playerX !== enemyX) body.direction.x = playerX > enemyX ? 1 : -1;
	}

	onFixedUpdate(): void {
		this.executeIA();
	}
}
