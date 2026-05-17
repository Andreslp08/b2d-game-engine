import { KeyBoardManager } from "engine/input/interfaces/keyboard-manager";
import { ScriptComponent } from "engine/scripts/script-component";
import { BasicMovement } from "./basic-movement";
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

	onStart(): void {
		this.enabled = true;
	}

	onFixedUpdate(): void {
		if (!this.enabled) return;

		const entity = this.entity;
		if (!entity.hasComponent(BasicMovement)) return;
		if (!this.enableInputController) return;
		this.horizontalController();
		this.jumpController();
	}

	private jumpController() {
		const entity = this.entity;
		const dynamicBody = entity.getComponent(DynamicBody);
		const gameObject = dynamicBody.getEntity() as GameObject;
		const movement = gameObject.getComponent(BasicMovement);
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
		const movement = gameObject.getComponent(BasicMovement);

		const moveLeft = KeyBoardManager.keyDown(movement.inputKeys.left);
		const moveRight = KeyBoardManager.keyDown(movement.inputKeys.right);

		if (moveRight) dynamicBody.addForce(new Vector2(movement.forceX, 0));
		else if (moveLeft) dynamicBody.addForce(new Vector2(-movement.forceX, 0));
	}
}
