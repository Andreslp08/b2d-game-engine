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
import { WorldCameras } from "engine/graphics/cameras/camera-managers";
import { Transform } from "engine/common/components/transform";
import { MathUtil } from "engine/math/math-util";
import { GameObject } from "engine/common/entities/game-object";

let isClimbKeyPressed = false;

export class PlayerController extends ScriptComponent {
	constructor(entity: Entity) {
		super(entity);
	}

	onUpdate(_deltaTime: number): void {
		const camera = WorldCameras.currentCamera;

		const scene = this.entity.getScene();
		const leftBound = scene.getEntityByTag<GameObject>("main-left-bound");
		const rightBound = scene.getEntityByTag<GameObject>("main-right-bound");


		
		const targetGameObject = (this.entity as GameObject);
		const thresholdX = 0;
		const thresholdY = targetGameObject.transform.size.y;
		const targetPos = targetGameObject.transform.position.clone();
		const cameraPos = camera.getPosition().clone();

		const dx = targetPos.x - cameraPos.x;
		const dy = targetPos.y - cameraPos.y;

		// Solo mover en X si sale del umbral
		if (Math.abs(dx) > thresholdX ) {
			cameraPos.x = targetPos.x - Math.sign(dx) * thresholdX;
		}

		// Solo mover en Y si sale del umbral
		if (Math.abs(dy) > thresholdY) {
			cameraPos.y = targetPos.y - Math.sign(dy) * thresholdY;
		}
		const newCameraPos = new Vector2(
			MathUtil.lerp(camera.getPosition().x, cameraPos.x, 1),
			MathUtil.lerp(camera.getPosition().y, cameraPos.y, 0.3)
		);
		const leftDistance = MathUtil.getDistanceBetweenEntities(this.entity, leftBound);
		const rightDistance = MathUtil.getDistanceBetweenEntities(this.entity, rightBound);

		if(leftDistance > 6.8 && rightDistance > 6.8) {
			camera.setPosition(newCameraPos);
		}else{
			camera.setYPosition(newCameraPos.y);
		}

		// === MOVIMIENTO Y CONTROLES ===
		const entity = this.entity;
		if (!entity.hasComponent(BasicMovement)) return;
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
		if (!entity.hasComponent(BasicMovement)) return;
		const y = gameObject.transform.position.y;
		// Salto
		if (KeyBoardManager.keyDown(movement.inputKeys.up)) {
			// console.log('xd', deltaTime)
			if (rb.isOnGround && !movement.isJumping) {
				movement.isJumping = true;
				movement.jumpStartY = y;
			}
			if (
				movement.jumpStartY !== null &&
				movement.jumpStartY - y < movement.maxJumpHeight &&
				movement.isJumping &&
				collider.collisionDirection.y !== CollisionDirection.TOP
			) {
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
