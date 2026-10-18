import { ScriptComponent } from "@b2d-engine/core/scripts/script-component";
import { PlayerMovement } from "./player-movement";
import { PlayerInputController, PlayerInputPermission } from "./player-input-controller";
import { GameplayAction, InputManagerInstance } from "../../input/input-manager";
import Vector2 from "@b2d-engine/core/math/vector2";
import { Collider } from "@b2d-engine/core/physics/components/collider";
import { CollisionDirection } from "@b2d-engine/core/physics/enum/collision-direction";
import { GameObject } from "@b2d-engine/core/common/entities/game-object";
import { DynamicBody } from "@b2d-engine/core/physics/components/dynamic-body";
import { Time } from "@b2d-engine/core/common/interfaces/time";

export class PlayerController extends ScriptComponent {
	enabled = true;
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
		const input = entity.getComponent(PlayerInputController);
		const dashKey =
			(input?.isEnabled(PlayerInputPermission.Dash) ?? false) &&
			InputManagerInstance.isDown(GameplayAction.Dash);
		const moveInput = InputManagerInstance.getVector2(GameplayAction.Move);
		const moveLeft = moveInput.x < 0;
		const moveRight = moveInput.x > 0;

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
		if (!movement) return;
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

		const input = entity.getComponent(PlayerInputController);
		const jumpDown =
			(input?.isEnabled(PlayerInputPermission.Movement) ?? false) &&
			InputManagerInstance.isDown(GameplayAction.Jump);
		if (jumpDown && !this.debouncingJump) {
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
			(!jumpDown || dynamicBody.velocity.y > 0)
		) {
			movement.isJumping = false;
		}
	}

	private horizontalController() {
		const entity = this.entity;
		const dynamicBody = entity.getComponent(DynamicBody);
		const gameObject = dynamicBody.getEntity();
		const movement = gameObject.getComponent(PlayerMovement);

		const input = entity.getComponent(PlayerInputController);
		if (!input?.isEnabled(PlayerInputPermission.Movement)) return;
		const moveInput = InputManagerInstance.getVector2(GameplayAction.Move);
		const moveLeft = moveInput.x < 0;
		const moveRight = moveInput.x > 0;

		if (moveRight) dynamicBody.addForce(new Vector2(movement.forceX, 0));
		else if (moveLeft) dynamicBody.addForce(new Vector2(-movement.forceX, 0));
	}
}
