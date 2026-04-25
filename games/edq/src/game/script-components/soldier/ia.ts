import { StateMachine, type StateMachineConfig } from "engine/common/state/state-machine";
import { Transform } from "engine/common/components/transform";
import { GameObject } from "engine/common/entities/game-object";
import { Time } from "engine/common/interfaces/time";
import { MathUtil } from "engine/math/math-util";
import Vector2 from "engine/math/vector2";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { ScriptComponent } from "engine/scripts/script-component";
import { createSoldierBomb } from "../../prefabs/soldier-bomb";

type SoldierState = "patrol" | "chase" | "attack";

const config: StateMachineConfig<SoldierState> = {
	initialState: {
		name: "patrol",
		data: null,
	},
	transitions: [
		{
			from: "patrol",
			to: ["chase", "attack"],
		},
		{
			from: "chase",
			to: ["patrol", "attack"],
		},
		{
			from: "attack",
			to: ["patrol", "chase"],
		},
	],
};

export class SoliderIA extends ScriptComponent {
	stateMachine = new StateMachine<SoldierState>(config);

	private startPatrolPosition: Vector2;
	private endPatrolPosition: Vector2;
	private patrolTarget: "start" | "end" = "end";
	private attackStartTime = 0;
	private lastShotTime = 0;

	private readonly patrolDistance = 4;
	private readonly detectionRange = 3.5;
	private readonly attackRange = 1.2;
	private readonly loseTargetRange = 7;
	private readonly patrolForce = 1500;
	private readonly chaseForce = 3500;
	private readonly attackDuration = 3;
	private readonly attackShotInterval = 1;

	onStart(): void {
		const transform = this.entity.getComponent(Transform);
		const origin = transform.position.clone();

		this.startPatrolPosition = origin.clone().add(new Vector2(-this.patrolDistance / 2, 0));
		this.endPatrolPosition = origin.clone().add(new Vector2(this.patrolDistance / 2, 0));
	}

	onFixedUpdate(): void {
		const player = this.entity.getScene()?.getEntityByTag<GameObject>("player");
		if (!player) return;

		const transform = this.entity.getComponent(Transform);
		const body = this.entity.getComponent(DynamicBody);
		if (!transform || !body) return;

		const distanceToPlayer = MathUtil.getDistanceBetweenEntities(this.entity, player);
		const state = this.stateMachine.stateValue();
		console.log("current stat", state.name);

		if (state.name === "patrol") {
			this.updatePatrol(transform, body);

			if (distanceToPlayer <= this.attackRange) {
				this.transitionTo("attack", { target: player });
			} else if (distanceToPlayer <= this.detectionRange) {
				this.transitionTo("chase", { target: player });
			}
			return;
		}

		if (state.name === "chase") {
			this.updateChase(player, transform, body);

			if (distanceToPlayer <= this.attackRange) {
				this.transitionTo("attack", { target: player });
			} else if (distanceToPlayer >= this.loseTargetRange) {
				this.transitionTo("patrol", null);
			}
			return;
		}

		if (state.name === "attack") {
			this.updateAttack(body, player);

			if (Time.time - this.attackStartTime < this.attackDuration) return;

			if (distanceToPlayer <= this.detectionRange) {
				this.transitionTo("chase", { target: player });
			} else {
				this.transitionTo("patrol", null);
			}
		}
	}

	private updatePatrol(transform: Transform, body: DynamicBody): void {
		const target =
			this.patrolTarget === "end" ? this.endPatrolPosition : this.startPatrolPosition;
		const direction = target.clone().substract(transform.position).normalize();

		body.addForce(new Vector2(direction.x * this.patrolForce, 0));

		if (Math.abs(target.x - transform.position.x) <= 0.15) {
			this.patrolTarget = this.patrolTarget === "end" ? "start" : "end";
		}
	}

	private updateChase(player: GameObject, transform: Transform, body: DynamicBody): void {
		const playerPosition = player.getComponent(Transform).position;
		const direction = playerPosition.clone().substract(transform.position).normalize();

		body.addForce(new Vector2(direction.x * this.chaseForce, 0));
	}

	private updateAttack(body: DynamicBody, player: GameObject): void {
		body.velocity.x = 0;

		if (Time.time - this.lastShotTime < this.attackShotInterval) return;

		this.shot(player);
		this.lastShotTime = Time.time;
	}

	private transitionTo(name: SoldierState, data: unknown): void {
		if (this.stateMachine.stateValue().name === name) return;

		this.stateMachine.transition({ name, data });

		if (name === "attack") {
			this.attackStartTime = Time.time;
			this.lastShotTime = 0;
		}
	}

	private shot(player: GameObject) {
        if(!this.entity) return
        const scene = this.entity.getScene();
        if(!scene) return
		const transform = this.entity.getComponent(Transform);
		const playerTransform = player.getComponent(Transform);
		if (!transform || !playerTransform) return;

        scene.addEntity(createSoldierBomb(transform.position, playerTransform.position, this.entity));
	}
}
