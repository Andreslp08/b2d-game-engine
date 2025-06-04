import type { Entity } from "engine/ecs/entity";
import { KeyBoardManager } from "engine/input/interfaces/keyboard-manager";
import { RigidBody } from "engine/physics/components/rigid-body";
import { ScriptComponent } from "engine/scripts/script-component";
import { BasicMovement } from "./basic-movement";
import Vector2 from "engine/math/vector2";
import { Transform } from "engine/common/components/transform";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import { PlayerIdle, PlayerJumpSequence, RightRunningSequence } from "../sprite-sequences";

export class PlayerController extends ScriptComponent {
	constructor(entity: Entity) {
		super(entity);
	}

	onUpdate(deltaTime: number): void {
		const entity = this.entity;
		const transform = entity.getComponent(Transform);
		if (!entity.hasComponent(BasicMovement)) return;

		const rb = entity.getComponent(RigidBody);
		const gameObject = rb.gameObject;
		const movement = gameObject.getComponent(BasicMovement);
		const spriteAnimation = gameObject.getComponent(SpriteAnimation);
		const y = gameObject.transform.position.y;

		// Movimiento horizontal
		const moveLeft = KeyBoardManager.keyDown(movement.inputKeys.left);
		const moveRight = KeyBoardManager.keyDown(movement.inputKeys.right);

		if (moveRight) rb.addForce(new Vector2(movement.forceX, 0));
		else if (moveLeft) rb.addForce(new Vector2(-movement.forceX, 0));

		// Salto
		if (KeyBoardManager.keyDown(movement.inputKeys.up)) {
			if (rb.isOnGround && !movement.isJumping) {
				movement.isJumping = true;
				movement.jumpStartY = y;
			}
			if (movement.jumpStartY !== null && movement.jumpStartY - y < movement.maxJumpHeight) {
				rb.addForce(new Vector2(0, -movement.forceY));
			}
		}
		if (
			movement.isJumping &&
			(!KeyBoardManager.keyDown(movement.inputKeys.up) || rb.velocity.y > 0)
		) {
			movement.isJumping = false;
		}
		if (rb.isOnGround) {
			movement.jumpStartY = null;
		}

		// Dirección (solo si velocidad supera un umbral)
		if (Math.abs(rb.velocity.x) > 0.01) {
			movement.direction.x = rb.velocity.x > 0 ? 1 : -1;
		}
		if (Math.abs(rb.velocity.y) > 0.01) {
			movement.direction.y = rb.velocity.y > 0 ? 1 : -1;
		}

		// Animación según estado
		if (spriteAnimation) {
            gameObject.sprite.direction.x = movement.direction.x > 0 ? 1 : -1;
			if (!rb.isOnGround) {
                spriteAnimation.setAnimation(PlayerJumpSequence, false, 0.08);
			} else {
                if (Math.abs(rb.velocity.x) > 0.01) {
					spriteAnimation.setAnimation(RightRunningSequence, true, 0.08);
				} else {
					spriteAnimation.setAnimation(PlayerIdle, true, 0.08);
				}
			}
		
		}
	}
}
