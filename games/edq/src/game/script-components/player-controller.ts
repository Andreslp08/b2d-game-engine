import { Entity } from "engine/ecs/entity";
import { KeyBoardManager } from "engine/input/interfaces/keyboard-manager";
import { RigidBody } from "engine/physics/components/rigid-body";
import { ScriptComponent } from "engine/scripts/script-component";
import { BasicMovement } from "./basic-movement";
import Vector2 from "engine/math/vector2";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import { PlayerIdle, PlayerJumpSequence, RightRunningSequence } from "../sprite-sequences";
import { Collider } from "engine/physics/components/collider";
import { CollisionDirection } from "engine/physics/enum/collision-direction";

let isClimbKeyPressed = false;

export class PlayerController extends ScriptComponent {
	constructor(entity: Entity) {
		super(entity);
	}

	onUpdate(_deltaTime: number): void {
		const entity = this.entity;
		if (!entity.hasComponent(BasicMovement)) return;
		this.climbController();
		this.horizontalController();
		this.jumpController();
		this.spriteAnimationsController();
	}

	private climbController() {
		const entity = this.entity;
		const rb = entity.getComponent(RigidBody);
		const gameObject = rb.gameObject;
		if (!entity.hasComponent(BasicMovement)) return;
		const shift = KeyBoardManager.keyDown("shift");
		isClimbKeyPressed = shift;
	

		// Cambia el zIndex si ambos están activos
		if (isClimbKeyPressed) {
			gameObject.setZindex(1000);
		} else {
			gameObject.setZindex(1);
		}
	}

	private jumpController() {
		const entity = this.entity;
		const rb = entity.getComponent(RigidBody);
		const gameObject = rb.gameObject;
		const movement = gameObject.getComponent(BasicMovement);
		const collider = entity.getComponent(Collider);
		console.log('collision direction', collider.collisionDirection)
		if (!entity.hasComponent(BasicMovement)) return;
		const y = gameObject.transform.position.y;
		// Salto
		if (KeyBoardManager.keyDown(movement.inputKeys.up)) {
			// console.log('xd', deltaTime)
			if (rb.isOnGround && !movement.isJumping) {
				movement.isJumping = true;
				movement.jumpStartY = y;
			}
			if (movement.jumpStartY !== null && movement.jumpStartY - y <  movement.maxJumpHeight && movement.isJumping &&  (collider.collisionDirection.y !== CollisionDirection.TOP)) {
				rb.addForce(new Vector2(0, -movement.forceY));
			}
		}
		if (
			movement.isJumping &&
			(!KeyBoardManager.keyDown(movement.inputKeys.up) || rb.velocity.y > 0)
		) {
			movement.isJumping = false;
		}
	}

	private horizontalController() {
		const entity = this.entity;
		const rb = entity.getComponent(RigidBody);
		const gameObject = rb.gameObject;
		const movement = gameObject.getComponent(BasicMovement);

		if (!entity.hasComponent(BasicMovement)) return;
		// Movimiento horizontal
		const moveLeft = KeyBoardManager.keyDown(movement.inputKeys.left);
		const moveRight = KeyBoardManager.keyDown(movement.inputKeys.right);

		if (moveRight) rb.addForce(new Vector2(movement.forceX, 0));
		else if (moveLeft) rb.addForce(new Vector2(-movement.forceX, 0));
	}

	private spriteAnimationsController() {
		const entity = this.entity;
		const rb = entity.getComponent(RigidBody);
		const gameObject = rb.gameObject;
		const movement = gameObject.getComponent(BasicMovement);
		const spriteAnimation = gameObject.getComponent(SpriteAnimation);

		if (!entity.hasComponent(BasicMovement)) return;
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
