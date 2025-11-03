import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { Transform } from "engine/common/components/transform";
import { GameObject } from "engine/common/entities/game-object";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import Vector2 from "engine/math/vector2";
import { ScriptComponent } from "engine/scripts/script-component";
import { AimingController } from "./aiming-controller";
import { DynamicBody } from "engine/physics/components/dynamic-body";

export class PlayerAimingArm extends ScriptComponent {
	arm: GameObject;

	constructor() {
		super();
	}

	onStart(): void {
		const rightArm = AssetsManager.getImageByName("spritesheet:player-right-arm");

		const sprite = new Sprite({
			framePosition: new Vector2(0, 0),
			frameSize: { w: 118, h: 151 },
			image: rightArm,
			scale: new Vector2(1, 1),
			rotation: 0,
			anchor: new Vector2(0, 0),
			pivot: new Vector2(0.25, 0.1),
		});

		this.arm = new GameObject(
			{
				position: new Vector2(0, 0),
				rotation: 0,
				size: new Vector2(0.35, 0.45),
			},
			sprite
		);
	}

	private attachArmToPlayer() {
		const idleOffset = new Vector2(-0.18, -0.15);
		const runningOffset = new Vector2(-0.08, -0.18);
		const jumpingOffset = new Vector2(-0.05, -0.16);
		let offset = idleOffset;
		if (!this.entity) return;
		this.entity.setZindex(1)
		if (!this.arm) return;
		const sprite = this.arm.getComponent(Sprite);
		const transform = this.entity.getComponent(Transform);
		if (!transform) return;
		const aimingController = this.entity.getComponent(AimingController);
		const isAiming = aimingController.isAiming();
		const aimingDirectionInX = aimingController.getAimingDirection().x;
		const angle = aimingController.getAngleInDeg();
		if (!aimingController) return;
		const dynamicBody = this.entity.getComponent(DynamicBody);
		const { isOnGround } = dynamicBody;
		const velocityX = Math.abs(dynamicBody.velocity.x);
		const epsilon = 0.01;
		const isMoving = velocityX > epsilon;

		if (isOnGround) {
			offset = isMoving ? runningOffset : idleOffset;
		} else {
			offset = jumpingOffset;
		}

		if (aimingDirectionInX === 1) {
			sprite.setDirection({ x: 1, y: 1 });
		} else {
			sprite.setDirection({ x: -1, y: 1 });
		}
		this.arm.getComponent(Transform).position = transform.position
			.clone()
			.add(new Vector2(offset.x * aimingDirectionInX, offset.y));

		const finalRotation = aimingDirectionInX === 1 ? angle - 45 : angle - 180 + 45;
		this.arm.transform.rotation = finalRotation;

		if (!isAiming) {
			sprite.setVisible(false);
		} else {
			sprite.setVisible(true);
		}
	}
	private autoAddEntityToScene() {
		if (!this.entity) return;
		const scene = this.entity.getScene();
		if (!scene) return;
		if (this.arm.getScene() === null || this.arm.getScene() !== scene) {
			scene.addEntity(this.arm);
		}
	}

	onFixedUpdate(): void {}

	onUpdate(): void {
		this.autoAddEntityToScene();
		this.attachArmToPlayer();
	}

	onLateUpdate(): void {}
}
