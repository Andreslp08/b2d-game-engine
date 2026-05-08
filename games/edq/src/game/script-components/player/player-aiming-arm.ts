import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { Transform } from "engine/common/components/transform";
import { GameObject } from "engine/common/entities/game-object";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import Vector2 from "engine/math/vector2";
import { ScriptComponent } from "engine/scripts/script-component";
import { AimingController } from "./aiming-controller";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { PlayerSkin } from "../../config/constants";
import { PlayerSkinComponent } from "./player-skin-component";

type PlayerArmSkinDefinition = {
	imageKey: string;
	frameSize: {
		w: number;
		h: number;
	};
	scale: Vector2;
	anchor: Vector2;
	pivot: Vector2;
	size: Vector2;
};

const PLAYER_ARM_SKIN_DEFINITIONS: Record<PlayerSkin, PlayerArmSkinDefinition> = {
	[PlayerSkin.SKIN1]: {
		imageKey: "spritesheet:player-skin1-right-arm",
		frameSize: { w: 118, h: 151 },
		scale: new Vector2(1, 1),
		anchor: new Vector2(0, 0),
		pivot: new Vector2(0.25, 0.1),
		size: new Vector2(0.35, 0.45),
	},

	[PlayerSkin.SKIN2]: {
		imageKey: "spritesheet:player-skin2-right-arm",
		frameSize: { w: 118, h: 151 },
		scale: new Vector2(1, 1),
		anchor: new Vector2(0, 0),
		pivot: new Vector2(0.25, 0.1),
		size: new Vector2(0.35, 0.45),
	},
};

export class PlayerAimingArm extends ScriptComponent {
	private arm: GameObject;
	private player:GameObject;
	private currentSkin: PlayerSkin = PlayerSkin.SKIN1;
	private skinComponent: PlayerSkinComponent;

	constructor(private skin: PlayerSkin = PlayerSkin.SKIN1) {
		super();
			
	}

	onStart(): void {
		this.arm = this.createArm(this.currentSkin);
		this.player = this.entity as GameObject;
			const currentSkinComponent = this.player.getComponent(PlayerSkinComponent);
				if (!currentSkinComponent) throw new Error("Player skin component not found");
				this.skinComponent = currentSkinComponent;
				this.skinComponent.onChangeSkin.subscribe(this.changeSkinListener);
				this.currentSkin = this.skinComponent.getCurrentSkin();
		this.currentSkin = this.skin;
	}

	private changeSkinListener(skin: PlayerSkin): void {
		this.setSkin(skin);
	}

	setSkin(skin: PlayerSkin): void {
		if (this.currentSkin === skin) return;

		this.currentSkin = skin;

		const oldArm = this.arm;
		const scene = oldArm?.getScene();

		this.arm = this.createArm(skin);

		if (scene) {
			scene.addEntity(this.arm);
		}
		oldArm.destroy();
	}

	private createArm(skin: PlayerSkin): GameObject {
		const definition = PLAYER_ARM_SKIN_DEFINITIONS[skin];
		const rightArm = AssetsManager.getImageByName(definition.imageKey);

		const sprite = new Sprite({
			framePosition: new Vector2(0, 0),
			frameSize: definition.frameSize,
			image: rightArm,
			scale: definition.scale,
			rotation: 0,
			anchor: definition.anchor,
			pivot: definition.pivot,
		});

		return new GameObject(
			{
				position: new Vector2(0, 0),
				rotation: 0,
				size: definition.size,
			},
			sprite
		);
	}

	private attachArmToPlayer(): void {
		if (!this.entity || !this.arm) return;

		const idleOffset = new Vector2(-0.18, -0.15);
		const runningOffset = new Vector2(-0.08, -0.18);
		const jumpingOffset = new Vector2(-0.05, -0.16);

		this.entity.setZindex(1);

		const sprite = this.arm.getComponent(Sprite);
		const transform = this.entity.getComponent(Transform);
		const aimingController = this.entity.getComponent(AimingController);
		const dynamicBody = this.entity.getComponent(DynamicBody);

		if (!sprite || !transform || !aimingController || !dynamicBody) return;

		const isAiming = aimingController.isAiming();
		const aimingDirectionInX = aimingController.getAimingDirection().x;
		const angle = aimingController.getAngleInDeg();

		const { isOnGround } = dynamicBody;
		const velocityX = Math.abs(dynamicBody.velocity.x);
		const epsilon = 0.01;
		const isMoving = velocityX > epsilon;

		let offset = idleOffset;

		if (isOnGround) {
			offset = isMoving ? runningOffset : idleOffset;
		} else {
			offset = jumpingOffset;
		}

		sprite.setDirection({
			x: aimingDirectionInX === 1 ? 1 : -1,
			y: 1,
		});

		this.arm.getComponent(Transform).position = transform.position
			.clone()
			.add(new Vector2(offset.x * aimingDirectionInX, offset.y));

		const finalRotation =
			aimingDirectionInX === 1 ? angle - 45 : angle - 180 + 45;

		this.arm.transform.rotation = finalRotation;
		sprite.setVisible(isAiming);
	}

	private autoAddEntityToScene(): void {
		if (!this.entity || !this.arm) return;

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
	onDestroy(): void {
		if (this.skinComponent) {
			this.skinComponent.onChangeSkin.unsubscribe(this.changeSkinListener);
		}
	}
}