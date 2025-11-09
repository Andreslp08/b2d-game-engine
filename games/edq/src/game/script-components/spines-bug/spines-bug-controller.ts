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
import { ScriptComponent } from "engine/scripts/script-component";
import { HealthComponent } from "../health-component";
import { Collider } from "engine/physics/components/collider";
import { CollisionDirection } from "engine/physics/enum/collision-direction";
import { PlayerLifeController } from "../player-life-controller";

export class SpinesBugController extends ScriptComponent {
	spriteState: "IDLE" | "MOVE" | "ATTACK_SPINES_VISIBLE" | "ATTACK_SPINES_HIDDEN" = "IDLE";
	startPatrolPosition: Vector2;
	endPatrolPosition: Vector2;
	patrolPoint: "START" | "END" = "START";
	patrolWaitDuration = 2;
	patrolDetectionRadius = 1.2;
	waiting = true;
	waitingStartTime = 0;

	damageShaderDuration = 0.3;
	damageShaderTime = 0;
	shouldEnableDamageShader = false;

	private idleSpriteSheet: SpriteSheet;
	private moveSpriteSheet: SpriteSheet;
	private spinesVisibleSS: SpriteSheet;
	private spinesHiddenSS: SpriteSheet;
	private readonly ANIMATION_SPEED = 0.1;

	onStart(): void {
		const idleImage = AssetsManager.getImageByName("spritesheet:spines-bug");
		const atlas = AssetsManager.getAtlasByName("atlas:spines-bug");
		this.idleSpriteSheet = SpriteSheet.genereateSpritesheetFromAtlas(
			"idle",
			atlas,
			idleImage,
			0,
			5
		);
		this.moveSpriteSheet = SpriteSheet.genereateSpritesheetFromAtlas(
			"",
			atlas,
			idleImage,
			6,
			11
		);
		this.spinesHiddenSS = SpriteSheet.genereateSpritesheetFromAtlas(
			"spines-hidden",
			atlas,
			idleImage,
			12,
			17
		);
		this.spinesVisibleSS = SpriteSheet.genereateSpritesheetFromAtlas(
			"spines-visible",
			atlas,
			idleImage,
			12,
			17
		);

		this.startPatrolPosition = this.entity.getComponent(Transform).position.clone();
		this.endPatrolPosition = this.entity
			.getComponent(Transform)
			.position.clone()
			.add(new Vector2(6, 0));
	}
	onUpdate(): void {
		this.updateSpriteAnimations();
		this.damageShader();
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
				this.spriteState = "MOVE";
				const targetPosition =
					this.patrolPoint === "START"
						? this.endPatrolPosition
						: this.startPatrolPosition;
				const direction = targetPosition.clone().substract(position).normalize();
				this.spriteState = "MOVE";
				body.addForce(new Vector2(direction.x * 5000, 0));
				if (Math.abs(direction.x) < 0.1) {
					this.patrolPoint = this.patrolPoint === "START" ? "END" : "START";
					this.waiting = true;
					this.waitingStartTime = Time.time;
				}
			}
		} else {
			this.spriteState = "ATTACK_SPINES_VISIBLE";
			this.waiting = true;
			this.waitingStartTime = Time.time;
		}
	}

	onLateUpdate(): void {}

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
			spriteAnimation.setAnimation(this.spinesVisibleSS, false, 0.01, false);
		} else if (this.spriteState === "ATTACK_SPINES_HIDDEN") {
			spriteAnimation.setAnimation(this.spinesHiddenSS, false, 0.01, true);
		}
	}

	damageShader() {
		const gameObject = this.entity as GameObject;
		if (!gameObject) return;
		const spriteAnimation = gameObject.getComponent(SpriteAnimation);
		if (!spriteAnimation) return;
		const damageFilter = "sepia(1) hue-rotate(-50deg) saturate(6) brightness(1.1)";

		if (this.shouldEnableDamageShader) {
			const delta = Time.time - this.damageShaderTime;
			spriteAnimation.spritesheet.sprites.forEach((sprite) => sprite.setFilter(damageFilter));
			
			if (delta > this.damageShaderDuration) {
				this.shouldEnableDamageShader = false;
				this.damageShaderTime = Time.time;
			}
		} else {
			spriteAnimation.spritesheet.sprites.forEach((sprite) => sprite.setFilter("none"));
		}
	}

	handleDamage(entity: Entity): void {
		const healthC = this.entity.getComponent(HealthComponent);
		if (!healthC) return;
		const health = healthC.getHealth();

		if (health <= 0) {
			this.entity.destroy();
		}
	}

	onCollisionEnter(entity: Entity): void {
		this.handleDamage(entity);
		if (entity.hasTag("bullet")) {
			this.shouldEnableDamageShader = true;
			this.damageShaderTime = Time.time;
		}
		if (entity.hasTag("player")) {
			const playerLife = entity.getComponent(PlayerLifeController);
			if (playerLife) {
				playerLife.setDamage(50);
				const collider = this.entity.getComponent(Collider);
				const colDirection = collider.collisionDirection;
				const playerBody = entity.getComponent(DynamicBody);
				const enemyPos = this.entity.getComponent(Transform).position;
				const playerPos = entity.getComponent(Transform).position;

				// vector del enemigo al jugador
				const knockDir = playerPos.clone().substract(enemyPos).normalize();

				if (
					colDirection.x === CollisionDirection.RIGHT ||
					colDirection.x === CollisionDirection.LEFT
				) {
					playerBody.addForce(new Vector2(knockDir.x * 120000, 0));
				}

				if (colDirection.y === CollisionDirection.TOP) {
					playerBody.addForce(new Vector2(0, -100000));
				}
			}
		}
	}

	onDestroy(): void {
		console.log("render particle");
	}
}
