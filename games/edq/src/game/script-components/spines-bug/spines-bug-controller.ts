import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { Transform } from "engine/common/components/transform";
import { GameObject } from "engine/common/entities/game-object";
import { Time } from "engine/common/interfaces/time";
import type { Entity } from "engine/ecs/entity";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import { SpriteSheet } from "engine/graphics/sprites/spritesheet";
import { MathUtil } from "engine/math/math-util";
import Vector2 from "engine/math/vector2";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { KinematicBody } from "engine/physics/components/kinematic-body";
import { ScriptComponent } from "engine/scripts/script-component";

export class SpinesBugController extends ScriptComponent {
	spriteState: "IDLE" | "MOVE" | "ATTACK_SPINES_VISIBLE" | "ATTACK_SPINES_HIDDEN" = "IDLE";
	startPatrolPosition: Vector2;
	endPatrolPosition: Vector2;
	patrolPoint: "START" | "END" = "START";
	patrolWaitDuration = 3;
	patrolDetectionRadius = 1;
	waiting = true;
	waitingStartTime = 0;

	private hidingSpines = false;
	private hidingSpinesStartTime = 0;
	private attackingWithSpines = false;
	private attackSpinesStartTime = 0;
	private returningToOppositePosition = false;
	private chasingAggressor = false;
	private idleSpriteSheet: SpriteSheet;
	private moveSpriteSheet: SpriteSheet;
	private spinesVisibleSS: SpriteSheet;
	private spinesHiddenSS: SpriteSheet;
	private readonly ANIMATION_SPEED = 0.1;
	private readonly SPINES_ANIMATION_SPEED = 0.03;
	private readonly SPINES_ATTACK_DURATION = 1.5;
	private readonly PATROL_FORCE = 5000;
	private readonly AGGRESSOR_PATROL_FORCE = this.PATROL_FORCE*2;
	private readonly SPINES_ATTACK_SPEED = 30;
	private readonly SPINES_CONTACT_DAMAGE = 50;
	private readonly CHASING_CONTACT_DAMAGE = 20;

	onStart(): void {
		const idleImage = AssetsManager.getImageByName("spritesheet:spines-bug");
		const atlas = AssetsManager.getAtlasByName("atlas:spines-bug");
		this.idleSpriteSheet = SpriteSheet.genereateSpritesheetFromAtlas(
			"idle",
			atlas,
			idleImage,
			0,
			5,
		);
		this.moveSpriteSheet = SpriteSheet.genereateSpritesheetFromAtlas(
			"",
			atlas,
			idleImage,
			6,
			11,
		);
		this.spinesHiddenSS = SpriteSheet.genereateSpritesheetFromAtlas(
			"spines-hidden",
			atlas,
			idleImage,
			12,
			17,
		);
		this.spinesVisibleSS = SpriteSheet.genereateSpritesheetFromAtlas(
			"spines-visible",
			atlas,
			idleImage,
			12,
			17,
		);

		this.startPatrolPosition = this.entity.getComponent(Transform).position.clone();
		this.endPatrolPosition = this.entity
			.getComponent(Transform)
			.position.clone()
			.add(new Vector2(6, 0));
	}
	onUpdate(): void {
		this.updateSpriteAnimations();
	}

	onFixedUpdate(): void {
		if (!this.entity) return;
		const scene = this.entity.getScene();
		if (!scene) return;
		const player = this.entity.getScene().getEntityByTag<GameObject>("player");
		if (!player) return;
		const distance = MathUtil.getDistanceBetweenEntities(this.entity, player);

		const transform = this.entity.getComponent(Transform);
		const position = transform.position;
		const body = this.entity.getComponent(DynamicBody);

		if (this.attackingWithSpines) {
			this.updateSpinesAttack();
			return;
		}

		if (this.hidingSpines) {
			this.playHideSpinesAnimation();
			return;
		}

		if (distance <= this.patrolDetectionRadius) {
			this.startSpinesAttack(player, position, body);
			return;
		}

		if (this.returningToOppositePosition) {
			this.updatePatrol(position, body);
			return;
		}

		if (distance > this.patrolDetectionRadius) {
			this.spriteState = "ATTACK_SPINES_HIDDEN";
			if (this.waiting) {
				this.spriteState = "IDLE";
				const elapsedTime = Time.time - this.waitingStartTime;
				if (elapsedTime >= this.patrolWaitDuration) {
					this.waiting = false;
					this.waitingStartTime = 0;
				}
			} else {
				this.updatePatrol(position, body);
			}
		}
	}

	onLateUpdate(): void {}

	private startSpinesAttack(player: GameObject, position: Vector2, body: DynamicBody) {
		this.hidingSpines = false;
		this.returningToOppositePosition = false;
		this.chasingAggressor = false;
		this.waiting = true;
		this.waitingStartTime = Time.time;
		this.attackingWithSpines = true;
		this.attackSpinesStartTime = Time.time;
		this.spriteState = "ATTACK_SPINES_VISIBLE";

		const playerPosition = player.getComponent(Transform).position;
		const direction = playerPosition.clone().substract(position).normalize();
		body.velocity.x = direction.x * this.SPINES_ATTACK_SPEED;
	}

	private updateSpinesAttack() {
		this.spriteState = "ATTACK_SPINES_VISIBLE";

		const elapsedTime = Time.time - this.attackSpinesStartTime;
		if (elapsedTime < this.SPINES_ATTACK_DURATION) return;

		this.attackingWithSpines = false;
		this.playHideSpinesAnimation();
	}

	private playHideSpinesAnimation() {
		if (!this.hidingSpines) {
			this.hidingSpines = true;
			this.hidingSpinesStartTime = Time.time;
		}

		this.spriteState = "ATTACK_SPINES_HIDDEN";

		const totalAnimationTime =
			(this.spinesHiddenSS?.sprites.length ?? 1) * this.SPINES_ANIMATION_SPEED;
		const elapsedTime = Time.time - this.hidingSpinesStartTime;

		if (elapsedTime >= totalAnimationTime) {
			this.hidingSpines = false;
			this.returningToOppositePosition = true;
			this.chasingAggressor = false;
			this.waiting = false;
			this.spriteState = "MOVE";
		}
	}

	private updatePatrol(position: Vector2, body: DynamicBody) {
		const targetPosition =
			this.patrolPoint === "START" ? this.endPatrolPosition : this.startPatrolPosition;
		const direction = targetPosition.clone().substract(position).normalize();
		const patrolForce = this.chasingAggressor ? this.AGGRESSOR_PATROL_FORCE : this.PATROL_FORCE;
		this.spriteState = "MOVE";
		body.addForce(new Vector2(direction.x * patrolForce, 0));
		if (Math.abs(direction.x) < 0.1) {
			this.patrolPoint = this.patrolPoint === "START" ? "END" : "START";
			this.waiting = true;
			this.returningToOppositePosition = false;
			this.chasingAggressor = false;
			this.waitingStartTime = Time.time;
		}
	}

	private patrolTowardsAggressor(aggressor: Entity) {
		const aggressorDirectionX = this.getAggressorDirectionX(aggressor);
		if (aggressorDirectionX === 0) return;

		this.patrolPoint = aggressorDirectionX > 0 ? "START" : "END";
		this.attackingWithSpines = false;
		this.hidingSpines = false;
		this.returningToOppositePosition = true;
		this.chasingAggressor = true;
		this.waiting = false;
		this.spriteState = "MOVE";
	}

	private getAggressorDirectionX(aggressor: Entity): number {
		const aggressorBody = aggressor.getComponent(KinematicBody);
		if (aggressorBody && Math.abs(aggressorBody.velocity.x) > 0.01) {
			return -Math.sign(aggressorBody.velocity.x);
		}

		const aggressorTransform = aggressor.getComponent(Transform);
		const transform = this.entity.getComponent(Transform);
		if (!aggressorTransform || !transform) return 0;

		const directionX = aggressorTransform.position.x - transform.position.x;
		if (Math.abs(directionX) < 0.01) return 0;

		return Math.sign(directionX);
	}

	private getContactDamage(): number {
		if (this.spriteState === "ATTACK_SPINES_VISIBLE") return this.SPINES_CONTACT_DAMAGE;
		return this.CHASING_CONTACT_DAMAGE;
	}

	updateSpriteAnimations() {
		if (!this.entity) return;
		const gameObject = this.entity as GameObject;
		const spriteAnimation = gameObject.getComponent(SpriteAnimation);
		const direction = gameObject.getComponent(DynamicBody).direction;
		const directionInX = direction.x;
		if (!spriteAnimation) return;
		spriteAnimation.setAnimationDirectionInX(directionInX);
		if (this.spriteState === "IDLE") {
			spriteAnimation.setAnimation(this.idleSpriteSheet, true, this.ANIMATION_SPEED);
		} else if (this.spriteState === "MOVE") {
			spriteAnimation.setAnimation(this.moveSpriteSheet, true, this.ANIMATION_SPEED);
		} else if (this.spriteState === "ATTACK_SPINES_VISIBLE") {
			spriteAnimation.setAnimation(
				this.spinesVisibleSS,
				false,
				this.SPINES_ANIMATION_SPEED,
				false,
			);
		} else if (this.spriteState === "ATTACK_SPINES_HIDDEN") {
			spriteAnimation.setAnimation(
				this.spinesHiddenSS,
				false,
				this.SPINES_ANIMATION_SPEED,
				true,
			);
		}
	}



	onCollisionEnter(entity: Entity): void {
		if (entity.hasTag("bullet")) {
			if (this.attackingWithSpines) return;
			this.patrolTowardsAggressor(entity);
		}
	}
}
