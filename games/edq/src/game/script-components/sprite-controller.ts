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

export class PlayerSpriteController extends ScriptComponent {
	private gameObject: GameObject;
	private playerIdleSS: SpriteSheet;
	private playerIdleNoArmsSS: SpriteSheet;
	private aimingArmSprite: Sprite;
	private defaultAimingArmAnchor = new Vector2(-0.17, 0.15);

	onStart(): void {
		this.gameObject = this.entity as GameObject;
		const idleImage = AssetsManager.getImageByName("spritesheet:player-idle");
		const idleNoArms = AssetsManager.getImageByName("spritesheet:player-idle-no-arms");
		const rightArm = AssetsManager.getImageByName("spritesheet:player-right-arm");
		//atlas
		const idleAtlas = AssetsManager.getAtlasByName("atlas:player-idle");
		const idleNoArmsAtlas = AssetsManager.getAtlasByName("atlas:player-idle-no-arms");

		const pivot = new Vector2(0.25, 0.1);

		this.playerIdleSS = SpriteSheet.genereateSpritesheetFromAtlas("idle", idleAtlas, idleImage);

		this.playerIdleNoArmsSS = SpriteSheet.genereateSpritesheetFromAtlas(
			"idle-no-arms",
			idleNoArmsAtlas,
			idleNoArms
		);

		const spriteAnimation = new SpriteAnimation(this.playerIdleSS, this.gameObject, true, 0.12);
		spriteAnimation.setZindex(1);
		this.gameObject.addComponent(spriteAnimation);

		this.aimingArmSprite = new Sprite({
			id: "player-right-arm",
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
		// Diferencia entre mouse y centro
		const dir = mouseWorldPos.clone().substract(this.gameObject.transform.position).normalize();
		// Ángulo en radianes, luego a grados
		let angleRad = Math.atan2(dir.y, dir.x * dynamicBody.direction.x);
		// Limitar a ±90 grados (es decir, entre -PI/2 y +PI/2 radianes)
		const minAngle = -Math.PI / 2;
		const maxAngle = Math.PI / 2;
		angleRad = Math.max(minAngle, Math.min(maxAngle, angleRad));
		const armRotation = MathUtil.radToDeg(angleRad) - 45;

		// Asignar ro

		if (isOnGround && velocityX <= epsilon) {
			if (
				loot &&
				currentSlot &&
				currentSlot?.item &&
				currentSlot?.item?.type === LootType.WEAPON
			) {
				spriteAnimation.setAnimation(this.playerIdleNoArmsSS, true, 0.12);
				this.aimingArmSprite.setVisible(true);
			} else {
				spriteAnimation.setAnimation(this.playerIdleSS, true, 0.12);
				this.aimingArmSprite.setVisible(false);
			}
		}

		spriteAnimation.setAnimationDirectionInX(dynamicBody.direction.x);
		this.aimingArmSprite.setDirection(dynamicBody.direction);
		if (dynamicBody.direction.x === 1) {
			this.aimingArmSprite.setAnchor(this.defaultAimingArmAnchor.clone().multiply(new Vector2(-1, 1)));

			this.aimingArmSprite.setRotation(armRotation);
		} else {
			this.aimingArmSprite.setAnchor(this.defaultAimingArmAnchor.clone().multiply(new Vector2(1, 1)));
			this.aimingArmSprite.setRotation(-armRotation);
		}
		// if (isOnGround && velocityX > epsilon) {
		// 	spriteAnimation.setAnimation(this.playerIdleNoArmsSS, true, 0.12);
		// }
	}
}
