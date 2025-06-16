import { Entity } from "engine/ecs/entity";
import { KeyBoardManager } from "engine/input/interfaces/keyboard-manager";
import { ScriptComponent } from "engine/scripts/script-component";
import { BasicMovement } from "./basic-movement";
import Vector2 from "engine/math/vector2";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import { Collider } from "engine/physics/components/collider";
import { CollisionDirection } from "engine/physics/enum/collision-direction";
import { WorldCameras } from "engine/graphics/cameras/camera-managers";
import { MathUtil } from "engine/math/math-util";
import { GameObject } from "engine/common/entities/game-object";
import { DynamicBody } from "engine/physics/components/dynamic-body";

let isClimbKeyPressed = false;

export class PlayerController extends ScriptComponent {
	constructor(entity: Entity) {
		super(entity);
	}

	onFixedUpdate(_deltaTime: number): void {
		const camera = WorldCameras.currentCamera;
		const targetGameObject = this.entity as GameObject;
		const cameraFOV = camera.getFieldOfView();

		// Considerar el tamaño del viewport visible tras aplicar FOV
		const adjustedViewportHalfHeight = targetGameObject.transform.size.y / 2 / cameraFOV;

		const thresholdX = 0; // Opcional para suavizar el movimiento en X
		const thresholdY = adjustedViewportHalfHeight;

		const targetPos = targetGameObject.transform.position.clone();
		const cameraPos = camera.getPosition().clone();

		const dx = targetPos.x - cameraPos.x;
		const dy = targetPos.y - cameraPos.y;

		// Solo mover en X si sale del umbral
		if (Math.abs(dx) > thresholdX) {
			cameraPos.x = targetPos.x - Math.sign(dx) * thresholdX;
		}

		// Solo mover en Y si sale del umbral (ajustado con FOV)
		if (Math.abs(dy) > thresholdY) {
			cameraPos.y = targetPos.y - Math.sign(dy) * thresholdY;
		}

		// Lerp final
		const newCameraPos = new Vector2(
			MathUtil.lerp(camera.getPosition().x, cameraPos.x, 1),
			MathUtil.lerp(camera.getPosition().y, cameraPos.y, 20 * _deltaTime)
		);

		// Mantén tus límites laterales si lo necesitas
		const scene = this.entity.getScene();
		const leftBound = scene.getEntityByTag<GameObject>("main-left-bound");
		const rightBound = scene.getEntityByTag<GameObject>("main-right-bound");

		const leftDistance = MathUtil.getDistanceBetweenEntities(this.entity, leftBound);
		const rightDistance = MathUtil.getDistanceBetweenEntities(this.entity, rightBound);

		if (leftDistance > 6.8 && rightDistance > 6.8) {
			camera.setPosition(newCameraPos);
		} else {
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
		const dynamicBody = entity.getComponent(DynamicBody);
		const gameObject = dynamicBody.gameObject;
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
		const dynamicBody = entity.getComponent(DynamicBody);
		const gameObject = dynamicBody.gameObject;
		const movement = gameObject.getComponent(BasicMovement);
		const collider = entity.getComponent(Collider);
		if (!entity.hasComponent(BasicMovement)) return;
		const y = gameObject.transform.position.y;
		// Salto
		if (KeyBoardManager.keyDown(movement.inputKeys.up)) {
			// console.log('xd', deltaTime)
			if (dynamicBody.isOnGround && !movement.isJumping) {
				movement.isJumping = true;
				movement.jumpStartY = y;
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
		const gameObject = dynamicBody.gameObject;
		const movement = gameObject.getComponent(BasicMovement);

		if (!entity.hasComponent(BasicMovement)) return;
		// Movimiento horizontal
		const moveLeft = KeyBoardManager.keyDown(movement.inputKeys.left);
		const moveRight = KeyBoardManager.keyDown(movement.inputKeys.right);

		if (moveRight) dynamicBody.addForce(new Vector2(movement.forceX, 0));
		else if (moveLeft) dynamicBody.addForce(new Vector2(-movement.forceX, 0));
	}

	private spriteAnimationsController() {
		const entity = this.entity;
		const dynamicBody = entity.getComponent(DynamicBody);
		const gameObject = dynamicBody.gameObject;
		const movement = gameObject.getComponent(BasicMovement);
		const spriteAnimation = gameObject.getComponent(SpriteAnimation);

		if (!entity.hasComponent(BasicMovement)) return;
		// Dirección (solo si velocidad supera un umbral)
		if (Math.abs(dynamicBody.velocity.x) > 0.01) {
			movement.direction.x = dynamicBody.velocity.x > 0 ? 1 : -1;
		}
		if (Math.abs(dynamicBody.velocity.y) > 0.01) {
			movement.direction.y = dynamicBody.velocity.y > 0 ? 1 : -1;
		}
	}
}
