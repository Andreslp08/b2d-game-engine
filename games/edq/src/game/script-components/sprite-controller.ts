import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import type { GameObject } from "engine/common/entities/game-object";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import { SpriteSheet } from "engine/graphics/sprites/spritesheet";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { ScriptComponent } from "engine/scripts/script-component";
import { WeaponHolder } from "./weapon";
import { Loot, LootType } from "./loot";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import Vector2 from "engine/math/vector2";
import { MouseManager } from "engine/input/mouse-manager";
import { WorldCameras } from "engine/graphics/cameras/camera-managers";
import type { WorldCamera } from "engine/graphics/cameras/world-camera";
import { MathUtil } from "engine/math/math-util";
import { DrawDebugLine } from "engine/debug/components/draw-line";
import { DebugMode, DebugTypes } from "engine/debug/debug";
import { BasicMovement } from "./basic-movement";

export class PlayerSpriteController extends ScriptComponent {
	private gameObject: GameObject;
	private playerIdleSS: SpriteSheet;
	private playerIdleNoArmsSS: SpriteSheet;
	private playerRunSS: SpriteSheet;
	private playerRunNoArmSS: SpriteSheet;
	private aimingArmSprite: Sprite;
	private playerJumpNoArmSS: SpriteSheet;
	private playerJumpSS: SpriteSheet;
	private defaultAimingArmAnchor = new Vector2(-0.17, 0.15);
	private runningAimingArmAnchor = new Vector2(-0.08, 0.15);
	private jumpingAimingArmAnchor = new Vector2(-0.08, 0.15);
	private animationSpeed: number = 0.08;
	private debugAngleX: DrawDebugLine;
	private debugAngleY: DrawDebugLine;
	private debugAimingLine: DrawDebugLine;
	private spritesDirection: { x: 1 | -1; y: 1 | -1 } = { x: 1, y: 1 };

	onStart(): void {
		this.gameObject = this.entity as GameObject;
		const idleImage = AssetsManager.getImageByName("spritesheet:player-idle");
		const idleNoArms = AssetsManager.getImageByName("spritesheet:player-idle-no-arms");
		const runImage = AssetsManager.getImageByName("spritesheet:player-run");
		const runNoArmImage = AssetsManager.getImageByName("spritesheet:player-run-no-arm");
		const rightArm = AssetsManager.getImageByName("spritesheet:player-right-arm");
		const jumpNoArm = AssetsManager.getImageByName("spritesheet:player-jump-no-arm");
		const jump = AssetsManager.getImageByName("spritesheet:player-jump");
		//atlas
		const idleAtlas = AssetsManager.getAtlasByName("atlas:player-idle");
		const idleNoArmsAtlas = AssetsManager.getAtlasByName("atlas:player-idle-no-arms");
		const runAtlas = AssetsManager.getAtlasByName("atlas:player-run");
		const runNoArmAtlas = AssetsManager.getAtlasByName("atlas:player-run-no-arm");
		const jumpNoArmAtlas = AssetsManager.getAtlasByName("atlas:player-jump-no-arm");
		const jumpAtlas = AssetsManager.getAtlasByName("atlas:player-jump");

		const pivot = new Vector2(0.25, 0.1);

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

		this.aimingArmSprite = new Sprite({
			framePosition: new Vector2(0, 0),
			frameSize: { w: 118, h: 151 },
			image: rightArm,
			scale: new Vector2(0.43, 0.24),
			rotation: 45,
			anchor: this.defaultAimingArmAnchor.clone(),
			pivot,
		});

		this.aimingArmSprite.setZindex(2);
		this.gameObject.addComponent(this.aimingArmSprite);
		this.debugAngleX = new DrawDebugLine(new Vector2(0, 0), new Vector2(0, 0), "#0f0");
		this.debugAngleY = new DrawDebugLine(new Vector2(0, 0), new Vector2(0, 0), "#f00");
		this.debugAimingLine = new DrawDebugLine(new Vector2(0, 0), new Vector2(0, 0), "#00f");
		this.gameObject.addComponent(this.debugAngleX);
		this.gameObject.addComponent(this.debugAngleY);
		this.gameObject.addComponent(this.debugAimingLine);
		DebugMode.enabled = true;
		DebugMode.check(DebugTypes.SHAPES);
	}

	debugAngle() {
		const transform = this.gameObject.transform;
		this.debugAngleY.start = transform.position.clone();
		this.debugAngleY.end = transform.position.clone().add(new Vector2(0, -1));
		this.debugAngleX.start = transform.position.clone();
		this.debugAngleX.end = transform.position.clone().add(new Vector2(1, 0));
		const mousePos = MouseManager.getPosition(); // ← posición en PANTALLA
		const mouseWorldPos = (
			WorldCameras.currentCamera as WorldCamera
		).getWorldPositionFromScreenPosition(mousePos);
		if (!mouseWorldPos) {
			return;
		}
		this.debugAimingLine.start = transform.position.clone();
		this.debugAimingLine.end = mouseWorldPos.clone();
	}

	onFixedUpdate(): void {
		if (!this.gameObject) return;
		const dynamicBody = this.gameObject.getComponent(DynamicBody);
		if (!dynamicBody) return;
		const spriteAnimation = this.gameObject.getComponent(SpriteAnimation);
		if (!spriteAnimation) return;
		spriteAnimation.setAnimationDirectionInX(dynamicBody.direction.x);
		const weaponHolder = this.gameObject.getComponent(WeaponHolder);
		const isOnGround = dynamicBody.isOnGround;
		const velocityX = Math.abs(dynamicBody.velocity.x);
		const loot = this.gameObject.getComponent(Loot);
		const currentSlot = loot?.getCurrentSlot();
		const epsilon = 0.01;

		const mousePos = MouseManager.getPosition(); // ← posición en PANTALLA
		const mouseWorldPos = (
			WorldCameras.currentCamera as WorldCamera
		).getWorldPositionFromScreenPosition(mousePos);
		if (!mouseWorldPos) {
			return;
		}
		const isAiming =
			loot && currentSlot && currentSlot?.item && currentSlot?.item?.type === LootType.WEAPON;
		const isMoving = velocityX > epsilon;
		// Diferencia entre mouse y centro
		const mouseDirection = mouseWorldPos
			.clone()
			.substract(this.gameObject.transform.position)
			.normalize();
		// Ángulo en radianes, luego a grados
		const angleRad = Math.atan2(mouseDirection.y, mouseDirection.x);
		const armRotationOffset = 30;
		const armAngleRad = angleRad;

		if (isAiming) {
			if (mouseDirection.x < -0.24) {
				this.spritesDirection.x = -1;
			} else if (mouseDirection.x > 0.24) {
				this.spritesDirection.x = 1;
			}
		} else {
			this.spritesDirection.x = dynamicBody.direction.x;
		}

		const armRotation = MathUtil.radToDeg(armAngleRad) - armRotationOffset;

		// Asignar ro

		let anchor = this.defaultAimingArmAnchor.clone();
		if (isMoving && isOnGround) anchor = this.runningAimingArmAnchor.clone();
		if (!isOnGround) anchor = this.jumpingAimingArmAnchor.clone();

		if (isOnGround) {
			if (!isMoving) {
				if (isAiming) {
					spriteAnimation.setAnimation(
						this.playerIdleNoArmsSS,
						true,
						this.animationSpeed,
						false
					);
					this.aimingArmSprite.setVisible(true);
				} else {
					spriteAnimation.setAnimation(this.playerIdleSS, true, this.animationSpeed, false);
					this.aimingArmSprite.setVisible(false);
				}
			} else {
			const shouldReverseAnimation = ()=>{
				if(dynamicBody.direction.x === 1){
					if(this.spritesDirection.x === -1){
						return true;
					}else{
						return false;
					}
				}
				if(dynamicBody.direction.x === -1){
					if(this.spritesDirection.x === 1){
						return true;
					}else{
						return false;
					}
				}
			}
				if (isAiming) {
					spriteAnimation.setAnimation(
						this.playerRunNoArmSS,
						true,
						this.animationSpeed,
						shouldReverseAnimation()
					);
					this.aimingArmSprite.setVisible(true);
				} else {
					spriteAnimation.setAnimation(this.playerRunSS, true, this.animationSpeed, false);
					this.aimingArmSprite.setVisible(false);
				}
			}
		} else {
			// jumping animation
			if (isAiming) {
				spriteAnimation.setAnimation(this.playerJumpNoArmSS, false, this.animationSpeed, false);
				this.aimingArmSprite.setVisible(true);
			} else {
				spriteAnimation.setAnimation(this.playerJumpSS, false, this.animationSpeed, false);
				this.aimingArmSprite.setVisible(false);
			}
		}

		spriteAnimation.setAnimationDirectionInX(this.spritesDirection.x);
		this.aimingArmSprite.setDirection({
			x: this.spritesDirection.x,
			y: this.spritesDirection.y,
		});
		if (this.spritesDirection.x === 1) {
			this.aimingArmSprite.setAnchor(anchor.clone().multiply(new Vector2(-1, 1)));

			this.aimingArmSprite.setRotation(armRotation);
		} else {
			this.aimingArmSprite.setAnchor(anchor.clone().multiply(new Vector2(1, 1)));
			this.aimingArmSprite.setRotation(armRotation - 90 - armRotationOffset);
		}
		this.debugAngle();
	}
}
