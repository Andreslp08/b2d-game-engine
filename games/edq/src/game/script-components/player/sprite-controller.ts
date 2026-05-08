import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { GameObject } from "engine/common/entities/game-object";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import { SpriteSheet } from "engine/graphics/sprites/spritesheet";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { ScriptComponent } from "engine/scripts/script-component";
import Vector2 from "engine/math/vector2";
import { MouseManager } from "engine/input/mouse-manager";
import { Cameras } from "engine/graphics/cameras/camera-manager";
import { OrthographicCamera } from "engine/graphics/cameras/orthographic-camera";
import { AimingController } from "./aiming-controller";
import { PlayerSkinComponent } from "./player-skin-component";
import { PlayerSkin } from "../../config/constants";

export enum PlayerAnimationKey {
	IDLE = "idle",
	IDLE_NO_ARMS = "idle-no-arms",
	RUN = "run",
	RUN_NO_ARM = "run-no-arm",
	JUMP = "jump",
	JUMP_NO_ARM = "jump-no-arm",
}

type PlayerSkinAssetDefinition = {
	animationName: string;
	imageKey: string;
	atlasKey: string;
	scale?: Vector2;
};

type PlayerSkinDefinition = Record<PlayerAnimationKey, PlayerSkinAssetDefinition>;

const PLAYER_SKIN_DEFINITIONS: Record<PlayerSkin, PlayerSkinDefinition> = {
	[PlayerSkin.SKIN1]: {
		[PlayerAnimationKey.IDLE]: {
			animationName: "idle",
			imageKey: "spritesheet:player-skin1-idle",
			atlasKey: "atlas:player-skin1-idle",
		},
		[PlayerAnimationKey.IDLE_NO_ARMS]: {
			animationName: "idle-no-arms",
			imageKey: "spritesheet:player-skin1-idle-no-arms",
			atlasKey: "atlas:player-skin1-idle-no-arms",
		},
		[PlayerAnimationKey.RUN]: {
			animationName: "run",
			imageKey: "spritesheet:player-skin1-run",
			atlasKey: "atlas:player-skin1-run",
			scale: new Vector2(1.25, 1),
		},
		[PlayerAnimationKey.RUN_NO_ARM]: {
			animationName: "run-no-arm",
			imageKey: "spritesheet:player-skin1-run-no-arm",
			atlasKey: "atlas:player-skin1-run-no-arm",
			scale: new Vector2(1.25, 1),
		},
		[PlayerAnimationKey.JUMP]: {
			animationName: "jump",
			imageKey: "spritesheet:player-skin1-jump",
			atlasKey: "atlas:player-skin1-jump",
			scale: new Vector2(1.5, 1),
		},
		[PlayerAnimationKey.JUMP_NO_ARM]: {
			animationName: "jump-no-arm",
			imageKey: "spritesheet:player-skin1-jump-no-arm",
			atlasKey: "atlas:player-skin1-jump-no-arm",
			scale: new Vector2(1.5, 1),
		},
	},

	[PlayerSkin.SKIN2]: {
		[PlayerAnimationKey.IDLE]: {
			animationName: "idle",
			imageKey: "spritesheet:player-skin2-idle",
			atlasKey: "atlas:player-skin2-idle",
		},
		[PlayerAnimationKey.IDLE_NO_ARMS]: {
			animationName: "idle-no-arms",
			imageKey: "spritesheet:player-skin2-idle-no-arms",
			atlasKey: "atlas:player-skin2-idle-no-arms",
		},
		[PlayerAnimationKey.RUN]: {
			animationName: "run",
			imageKey: "spritesheet:player-skin2-run",
			atlasKey: "atlas:player-skin2-run",
			scale: new Vector2(1.25, 1),
		},
		[PlayerAnimationKey.RUN_NO_ARM]: {
			animationName: "run-no-arm",
			imageKey: "spritesheet:player-skin2-run-no-arm",
			atlasKey: "atlas:player-skin2-run-no-arm",
			scale: new Vector2(1.25, 1),
		},
		[PlayerAnimationKey.JUMP]: {
			animationName: "jump",
			imageKey: "spritesheet:player-skin2-jump",
			atlasKey: "atlas:player-skin2-jump",
			scale: new Vector2(1.5, 1),
		},
		[PlayerAnimationKey.JUMP_NO_ARM]: {
			animationName: "jump-no-arm",
			imageKey: "spritesheet:player-skin2-jump-no-arm",
			atlasKey: "atlas:player-skin2-jump-no-arm",
			scale: new Vector2(1.5, 1),
		},
	},
};

class PlayerSkinSpritesheetFactory {
	static create(skin: PlayerSkin): Record<PlayerAnimationKey, SpriteSheet> {
		const definition = PLAYER_SKIN_DEFINITIONS[skin];

		const spritesheets = {} as Record<PlayerAnimationKey, SpriteSheet>;

		Object.entries(definition).forEach(([animationKey, assetDefinition]) => {
			const image = AssetsManager.getImageByName(assetDefinition.imageKey);
			const atlas = AssetsManager.getAtlasByName(assetDefinition.atlasKey);

			const spritesheet = SpriteSheet.genereateSpritesheetFromAtlas(
				assetDefinition.animationName,
				atlas,
				image,
			);

			if (assetDefinition.scale) {
				spritesheet.sprites.forEach((sprite) => {
					sprite.setScale(assetDefinition.scale!);
				});
			}

			spritesheets[animationKey as PlayerAnimationKey] = spritesheet;
		});

		return spritesheets;
	}
}

export class PlayerSpriteController extends ScriptComponent {
	private gameObject: GameObject;
	private spritesheets: Record<PlayerAnimationKey, SpriteSheet>;
	private animationSpeed: number = 0.08;
	private currentSkin: PlayerSkin;
	private skinComponent: PlayerSkinComponent;

	onStart(): void {
		this.gameObject = this.entity as GameObject;

		const currentSkinComponent = this.gameObject.getComponent(PlayerSkinComponent);
		if (!currentSkinComponent) throw new Error("Player skin component not found");
		this.skinComponent = currentSkinComponent;
		this.skinComponent.onChangeSkin.subscribe(this.changeSkinListener);
		this.currentSkin = this.skinComponent.getCurrentSkin();
		this.spritesheets = PlayerSkinSpritesheetFactory.create(this.currentSkin);

		const spriteAnimation = new SpriteAnimation(
			this.spritesheets[PlayerAnimationKey.IDLE],
			this.gameObject,
			true,
			this.animationSpeed,
		);

		spriteAnimation.setZindex(1);
		this.gameObject.addComponent(spriteAnimation);
	}

	private changeSkinListener(skin: PlayerSkin): void {
		this.setSkin(skin);
	}

	setSkin(skin: PlayerSkin): void {
		if (this.currentSkin === skin) return;

		this.currentSkin = skin;
		this.spritesheets = PlayerSkinSpritesheetFactory.create(skin);

		const spriteAnimation = this.gameObject.getComponent(SpriteAnimation);

		if (!spriteAnimation) return;

		spriteAnimation.setAnimation(
			this.spritesheets[PlayerAnimationKey.IDLE],
			true,
			this.animationSpeed,
			false,
		);
	}

	onFixedUpdate(): void {
		if (!this.gameObject || !this.spritesheets) return;

		const aimingController = this.gameObject.getComponent(AimingController);
		if (!aimingController) return;

		const isAiming = aimingController.isAiming();
		const aimingDirection = aimingController.getAimingDirection();

		const dynamicBody = this.gameObject.getComponent(DynamicBody);
		if (!dynamicBody) return;

		const spriteAnimation = this.gameObject.getComponent(SpriteAnimation);
		if (!spriteAnimation) return;

		spriteAnimation.setAnimationDirectionInX(dynamicBody.direction.x);

		const { isOnGround } = dynamicBody;
		const velocityX = Math.abs(dynamicBody.velocity.x);
		const epsilon = 0.01;
		const isMoving = velocityX > epsilon;

		const mousePos = MouseManager.getPosition();
		const mouseWorldPos = (
			Cameras.currentCamera as OrthographicCamera
		).getWorldPositionFromScreenPosition(mousePos);

		if (!mouseWorldPos) return;

		if (isOnGround) {
			if (!isMoving) {
				if (isAiming) {
					spriteAnimation.setAnimation(
						this.spritesheets[PlayerAnimationKey.IDLE_NO_ARMS],
						true,
						this.animationSpeed,
						false,
					);
				} else {
					spriteAnimation.setAnimation(
						this.spritesheets[PlayerAnimationKey.IDLE],
						true,
						this.animationSpeed,
						false,
					);
				}
			} else {
				const reverse = this.shouldReverseRunAnimation(
					dynamicBody.direction.x,
					aimingDirection.x,
				);

				if (isAiming) {
					spriteAnimation.setAnimation(
						this.spritesheets[PlayerAnimationKey.RUN_NO_ARM],
						true,
						this.animationSpeed,
						reverse,
					);
				} else {
					spriteAnimation.setAnimation(
						this.spritesheets[PlayerAnimationKey.RUN],
						true,
						this.animationSpeed,
						false,
					);
				}
			}
		} else {
			if (isAiming) {
				spriteAnimation.setAnimation(
					this.spritesheets[PlayerAnimationKey.JUMP_NO_ARM],
					false,
					this.animationSpeed,
					false,
				);
			} else {
				spriteAnimation.setAnimation(
					this.spritesheets[PlayerAnimationKey.JUMP],
					false,
					this.animationSpeed,
					false,
				);
			}
		}

		spriteAnimation.setAnimationDirectionInX(aimingDirection.x);
	}

	private shouldReverseRunAnimation(
		movementDirectionX: number,
		aimingDirectionX: number,
	): boolean {
		return (
			movementDirectionX !== 0 &&
			aimingDirectionX !== 0 &&
			movementDirectionX !== aimingDirectionX
		);
	}

	onDestroy(): void {
		if (this.skinComponent) {
			this.skinComponent.onChangeSkin.unsubscribe(this.changeSkinListener);
		}
	}
}
