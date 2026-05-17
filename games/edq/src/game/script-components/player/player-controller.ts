import { KeyBoardManager } from "engine/input/interfaces/keyboard-manager";
import { ScriptComponent } from "engine/scripts/script-component";
import { PlayerMovement } from "./player-movement";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";
import { CollisionDirection } from "engine/physics/enum/collision-direction";
import { GameObject } from "engine/common/entities/game-object";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { Time } from "engine/common/interfaces/time";

export class PlayerController extends ScriptComponent {
	enabled = true;
	enableInputController = true;
	jumpDebounce = 0.2;
	jumpDebounceStartTime = 0;
	debouncingJump = false;
	prevJump = false;
	hasJumpedOnce = false;
	dashCooldownTimer = 0;
	dashDurationTimer = 0;
	prevDashKey = false;
	private dashDirection: 1 | -1 = 1;
	private baseFriction = 0;
	private baseDragScale = 0;

	onStart(): void {
		this.enabled = true;
		const dynamicBody = this.entity.getComponent(DynamicBody);
		if (!dynamicBody) return;

		this.baseFriction = dynamicBody.friction;
		this.baseDragScale = dynamicBody.dragScale;
	}

	onFixedUpdate(): void {
		if (!this.enabled) return;

		const entity = this.entity;
		const movement = entity.getComponent(PlayerMovement);
		if (!movement) return;
		if (!this.enableInputController) return;
		this.dashController();
		if (movement.isDashing) return;
		this.horizontalController();
		this.jumpController();
	}

	private dashController() {
		const entity = this.entity;
		const dynamicBody = entity.getComponent(DynamicBody);
		const movement = entity.getComponent(PlayerMovement);
		if (!dynamicBody || !movement) return;
		const dashKey = KeyBoardManager.keyDown(movement.inputKeys.horizontalDash);
		const moveLeft = KeyBoardManager.keyDown(movement.inputKeys.left);
		const moveRight = KeyBoardManager.keyDown(movement.inputKeys.right);

		this.dashCooldownTimer -= Time.fixedDeltaTime;
		this.dashDurationTimer -= Time.fixedDeltaTime;

		if (this.dashDurationTimer <= 0) {
			this.stopDash(dynamicBody);
		}

		if (dashKey && !this.prevDashKey && this.dashCooldownTimer <= 0 && !movement.isDashing) {
			this.startDash(dynamicBody, movement, moveLeft, moveRight);
		}

		if (movement.isDashing) {
			dynamicBody.friction = this.baseFriction * movement.dashFrictionMultiplier;
			dynamicBody.dragScale = this.baseDragScale * movement.dashDragMultiplier;
			dynamicBody.addForce(new Vector2(this.dashDirection * movement.dashForceX, 0));

			const maxDashSpeed = movement.dashMaxSpeedX;
			const nextVelocityX = dynamicBody.velocity.x;
			if (Math.abs(nextVelocityX) > maxDashSpeed) {
				dynamicBody.velocity.x = this.dashDirection * maxDashSpeed;
			}
		}

		this.prevDashKey = dashKey;
	}

	private startDash(
		dynamicBody: DynamicBody,
		movement: PlayerMovement,
		moveLeft: boolean,
		moveRight: boolean,
	): void {
		movement.isDashing = true;
		this.dashDurationTimer = movement.dashDuration;
		this.dashCooldownTimer = movement.dashCooldown;

		if (moveRight && !moveLeft) this.dashDirection = 1;
		else if (moveLeft && !moveRight) this.dashDirection = -1;
		else this.dashDirection = dynamicBody.direction.x;

		// Reinicia parte del momentum opuesto para que el dash salga limpio.
		if (Math.sign(dynamicBody.velocity.x) !== this.dashDirection) {
			dynamicBody.velocity.x = 0;
		}
	}

	private stopDash(dynamicBody: DynamicBody): void {
		const movement = dynamicBody.getEntity().getComponent(PlayerMovement);
		if(!movement) return;
		if (!movement.isDashing) return;

		movement.isDashing = false;
		this.dashDurationTimer = 0;
		dynamicBody.friction = this.baseFriction;
		dynamicBody.dragScale = this.baseDragScale;
	}

	private jumpController() {
		const entity = this.entity;
		const dynamicBody = entity.getComponent(DynamicBody);
		const gameObject = dynamicBody.getEntity() as GameObject;
		const movement = gameObject.getComponent(PlayerMovement);
		const collider = entity.getComponent(Collider);
		const y = gameObject.transform.position.y;

		if (
			this.hasJumpedOnce &&
			!movement.isJumping &&
			dynamicBody.isOnGround &&
			!this.debouncingJump
		) {
			this.debouncingJump = true;
			this.jumpDebounceStartTime = Time.time;
		}

		if (this.debouncingJump) {
			const delta = Time.time - this.jumpDebounceStartTime;
			if (delta >= this.jumpDebounce) {
				this.debouncingJump = false;
				this.jumpDebounceStartTime = 0;
				this.hasJumpedOnce = false;
			}
		}

		if (KeyBoardManager.keyDown(movement.inputKeys.up) && !this.debouncingJump) {
			if (dynamicBody.isOnGround && !movement.isJumping) {
				movement.isJumping = true;
				movement.jumpStartY = y;
				this.hasJumpedOnce = true;
			}
			if (
				movement.jumpStartY !== null &&
				movement.jumpStartY - y < movement.maxJumpHeight &&
				movement.isJumping &&
				collider.collisionDirection.y !== CollisionDirection.TOP
			) {
				dynamicBody.addForce(new Vector2(0, -movement.forceY));
			}
		}
		if (
			movement.isJumping &&
			(!KeyBoardManager.keyDown(movement.inputKeys.up) || dynamicBody.velocity.y > 0)
		) {
			movement.isJumping = false;
		}
	}

	private horizontalController() {
		const entity = this.entity;
		const dynamicBody = entity.getComponent(DynamicBody);
		const gameObject = dynamicBody.getEntity();
		const movement = gameObject.getComponent(PlayerMovement);

		const moveLeft = KeyBoardManager.keyDown(movement.inputKeys.left);
		const moveRight = KeyBoardManager.keyDown(movement.inputKeys.right);

		if (moveRight) dynamicBody.addForce(new Vector2(movement.forceX, 0));
		else if (moveLeft) dynamicBody.addForce(new Vector2(-movement.forceX, 0));
	}
}
