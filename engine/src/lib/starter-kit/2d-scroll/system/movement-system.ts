import { Entity } from "../../../ecs/entity";
import { System } from "../../../ecs/system";
import { KeyBoardManager } from "../../../input/interfaces/keyboard-manager";
import Vector2 from "../../../math/vector2";
import { RigidBody } from "../../../physics/components/rigid-body";
import { BasicMovement } from "../components/basic-movement";

export class BasicMovementSystem extends System {
	update(deltaTime: number, entities: Set<Entity>): void {
		for (const entity of entities) {
			const desireHorizontalForce = 10;
			const isCharacter = entity.hasComponent(BasicMovement) && entity.hasTag("character");
			if (!isCharacter) continue;
			const rb = entity.getComponent(RigidBody);
			const gameObject = rb.gameObject;
			const movement = gameObject.getComponent(BasicMovement);
			const y = gameObject.transform.position.y;
			if (KeyBoardManager.keyDown(movement.inputKeys.right)) {
				rb.addForce(new Vector2(movement.forceX, 0));
			} else if (KeyBoardManager.keyDown(movement.inputKeys.left)) {
				rb.addForce(new Vector2(-movement.forceX, 0));
			}

			// Salto
			if (KeyBoardManager.keyDown(movement.inputKeys.up)) {
				if (rb.isOnGround && !movement.isJumping) {
					movement.isJumping = true;
					movement.jumpStartY = y;
				}

				if (
					movement.jumpStartY !== null &&
					movement.jumpStartY - y < movement.maxJumpHeight
				) {
					rb.addForce(new Vector2(0, -movement.forceY));
				}
			}

			if (rb.isOnGround) {
				movement.isJumping = false;
				movement.jumpStartY = null;
			}

			// Suelo temporal: si tocamos el suelo, se resetea el salto
			// if (y >= 200) {
			// 	movement.isJumping = false;
			// 	movement.hasAppliedJumpForce = false;
			// 	gameObject.transform.position.y = 200;
			// 	rb.velocity.y = 0;
			// }
		}
	}
}
