import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import  { GameObject } from "engine/common/entities/game-object";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import { SpriteSheet } from "engine/graphics/sprites/spritesheet";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { ScriptComponent } from "engine/scripts/script-component";
import Vector2 from "engine/math/vector2";
import { MouseManager } from "engine/input/mouse-manager";
import { WorldCameras } from "engine/graphics/cameras/camera-managers";
import  { WorldCamera } from "engine/graphics/cameras/world-camera";
import { AimingController } from "./aiming-controller";

export class PlayerSpriteController extends ScriptComponent {
	private gameObject: GameObject;
	private playerIdleSS: SpriteSheet;
	private playerIdleNoArmsSS: SpriteSheet;
	private playerRunSS: SpriteSheet;
	private playerRunNoArmSS: SpriteSheet;
	private playerJumpNoArmSS: SpriteSheet;
	private playerJumpSS: SpriteSheet;
	private animationSpeed: number = 0.08;

	onStart(): void {
		this.gameObject = this.entity as GameObject;
		const idleImage = AssetsManager.getImageByName("spritesheet:player-idle");
		const idleNoArms = AssetsManager.getImageByName("spritesheet:player-idle-no-arms");
		const runImage = AssetsManager.getImageByName("spritesheet:player-run");
		const runNoArmImage = AssetsManager.getImageByName("spritesheet:player-run-no-arm");
		const jumpNoArm = AssetsManager.getImageByName("spritesheet:player-jump-no-arm");
		const jump = AssetsManager.getImageByName("spritesheet:player-jump");
		//atlas
		const idleAtlas = AssetsManager.getAtlasByName("atlas:player-idle");
		const idleNoArmsAtlas = AssetsManager.getAtlasByName("atlas:player-idle-no-arms");
		const runAtlas = AssetsManager.getAtlasByName("atlas:player-run");
		const runNoArmAtlas = AssetsManager.getAtlasByName("atlas:player-run-no-arm");
		const jumpNoArmAtlas = AssetsManager.getAtlasByName("atlas:player-jump-no-arm");
		const jumpAtlas = AssetsManager.getAtlasByName("atlas:player-jump");

	

		this.playerIdleSS = SpriteSheet.genereateSpritesheetFromAtlas("idle", idleAtlas, idleImage);

		this.playerIdleNoArmsSS = SpriteSheet.genereateSpritesheetFromAtlas(
			"idle-no-arms",
			idleNoArmsAtlas,
			idleNoArms
		);

		this.playerRunSS = SpriteSheet.genereateSpritesheetFromAtlas("run", runAtlas, runImage);
		this.playerRunSS.sprites.forEach((sprite) => sprite.setScale(new Vector2(1.25, 1)));
		this.playerRunNoArmSS = SpriteSheet.genereateSpritesheetFromAtlas(
			"run-no-arm",
			runNoArmAtlas,
			runNoArmImage
		);
		this.playerRunNoArmSS.sprites.forEach((sprite) => sprite.setScale(new Vector2(1.25, 1)));

		this.playerJumpSS = SpriteSheet.genereateSpritesheetFromAtlas("jump", jumpAtlas, jump);
		this.playerJumpSS.sprites.forEach((sprite) => sprite.setScale(new Vector2(1.5, 1)));
		this.playerJumpNoArmSS = SpriteSheet.genereateSpritesheetFromAtlas(
			"jump-no-arm",
			jumpNoArmAtlas,
			jumpNoArm
		);
		this.playerJumpNoArmSS.sprites.forEach((sprite) => sprite.setScale(new Vector2(1.5, 1)));

		const spriteAnimation = new SpriteAnimation(
			this.playerIdleSS,
			this.gameObject,
			true,
			this.animationSpeed
		);
		spriteAnimation.setZindex(1);
		this.gameObject.addComponent(spriteAnimation);
	}


	onFixedUpdate(): void {
		if (!this.gameObject) return;
		const aimingController = this.gameObject.getComponent(AimingController);
		if(!aimingController) return;
		const isAiming = aimingController.isAiming();
		const aimingDirection = aimingController.getAimingDirection();
		const dynamicBody = this.gameObject.getComponent(DynamicBody);
		if (!dynamicBody) return;
		const spriteAnimation = this.gameObject.getComponent(SpriteAnimation);
		if (!spriteAnimation) return;
		spriteAnimation.setAnimationDirectionInX(dynamicBody.direction.x);
		const {isOnGround} = dynamicBody;
		const velocityX = Math.abs(dynamicBody.velocity.x);
		const epsilon = 0.01;
		const isMoving = velocityX > epsilon;

		const mousePos = MouseManager.getPosition(); // ← posición en PANTALLA
		const mouseWorldPos = (
			WorldCameras.currentCamera as WorldCamera
		).getWorldPositionFromScreenPosition(mousePos);
		if (!mouseWorldPos) {
			return;
		}

		if (isOnGround) {
			if (!isMoving) {
				if (isAiming) {
					spriteAnimation.setAnimation(
						this.playerIdleNoArmsSS,
						true,
						this.animationSpeed,
						false
					);
				
				} else {
					spriteAnimation.setAnimation(this.playerIdleSS, true, this.animationSpeed, false);
					
				}
			} else {
			const shouldReverseAnimation = ()=>{
				if(dynamicBody.direction.x === 1){
					if(aimingDirection.x === -1){
						return true;
					}else{
						return false;
					}
				}
				if(dynamicBody.direction.x === -1){
					if(aimingDirection.x === 1){
						return true;
					}else{
						return false;
					}
				}
			}
			const reverse = shouldReverseAnimation();

				if (isAiming) {
					spriteAnimation.setAnimation(
						this.playerRunNoArmSS,
						true,
						this.animationSpeed,
						reverse
					);
					
				} else {
					spriteAnimation.setAnimation(this.playerRunSS, true, this.animationSpeed, false);
				}
			}
		} else {
			// jumping animation
			if (isAiming) {
				spriteAnimation.setAnimation(this.playerJumpNoArmSS, false, this.animationSpeed, false);
				
			} else {
				spriteAnimation.setAnimation(this.playerJumpSS, false, this.animationSpeed, false);
				
			}
		}

		spriteAnimation.setAnimationDirectionInX(aimingDirection.x);
	}
}
