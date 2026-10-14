import { Transform } from "engine/common/components/transform";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { Time } from "engine/common/interfaces/time";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import Vector2 from "engine/math/vector2";
import { ScriptComponent } from "engine/scripts/script-component";
import { MarkerType } from "../../config/constants";
import type { MarkerArrowDirection, MarkerParams } from "../../interfaces/marker";

export class MarkerSpriteController extends ScriptComponent {
	private sprite: Sprite;
	private arrowSprite: Sprite;
	private readonly animationDuration = 2;
	private readonly scaleAmplitude = 0.1;

	constructor(private params: Pick<MarkerParams, "arrowDirection" | "markerType">) {
		super();
	}

	private getSpriteFrame(markerType: MarkerType): {
		framePosition: Vector2;
		frameSize: { w: number; h: number };
	} {
		const cylinder = { framePosition: new Vector2(0, 0), frameSize: { w: 500, h: 500 } };
		switch (markerType) {
			case MarkerType.cylinder:
				return cylinder;
			case MarkerType.corona:
				return { framePosition: new Vector2(1500, 0), frameSize: { w: 1000, h: 1000 } };
			default:
				return cylinder;
		}
	}

	onStart(): void {
		const currentSprite = this.entity.getComponent(Sprite);
		if (currentSprite) this.entity.deleteallComponentsByClass(Sprite);
		const { framePosition, frameSize } = this.getSpriteFrame(this.params.markerType);
		this.sprite = new Sprite({
			image: AssetsManager.getImageByName("spritesheet:markers"),
			framePosition,
			frameSize,
		});
		this.arrowSprite = new Sprite({
			image: AssetsManager.getImageByName("spritesheet:markers"),
			framePosition: new Vector2(1000, 0),
			frameSize: { w: 500, h: 500 },
			useEntityTransform: false,
			worldTransform: new Transform({
				position: new Vector2(0, 0),
				size: new Vector2(1, 1),
				rotation: 0,
			}),
		});
		this.entity.addComponent(this.arrowSprite);
		this.entity.addComponent(this.sprite);
	}

	private getArrowRotation(arrowDirection: MarkerArrowDirection): number {
		switch (arrowDirection) {
			case "Up":
				return 180;
			case "Right":
				return -90;
			case "Down":
				return 0;
			case "Left":
				return 90;
			default:
				return 0;
		}
	}

	onUpdate(): void {
		if (!this.sprite) return;
		const phase = (Time.time / this.animationDuration) * Math.PI * 2;
		const scale = 1 + ((Math.cos(phase) + 1) / 2) * this.scaleAmplitude;
		this.sprite.setScale(new Vector2(scale, scale));
		const isArrowVisible = this.params.arrowDirection !== "None";
		if (!isArrowVisible) {
			this.arrowSprite.setVisible(false);
			return;
		}
		this.arrowSprite.setWorldTransform(
			new Transform({
				position: this.entity
					.getComponent(Transform)
					.position.clone()
					.multiply(new Vector2(1, scale)),
				size: new Vector2(0.5, 0.5),
				rotation: this.getArrowRotation(this.params.arrowDirection),
			}),
		);
	}
}
