import { Transform } from "engine/common/components/transform";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { Time } from "engine/common/interfaces/time";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import Vector2 from "engine/math/vector2";
import { ScriptComponent } from "engine/scripts/script-component";
import { MarkerType } from "../../config/constants";
import type { MarkerArrowDirection, MarkerParams } from "../../interfaces/marker";
import { MarkerUI, type MarkerFrame } from "./marker-ui";

export class MarkerSpriteController extends ScriptComponent {
	private readonly markerUI = new MarkerUI();
	private readonly arrowFrame: MarkerFrame = {
		framePosition: new Vector2(0, 0),
		frameSize: { w: 500, h: 500 },
	};
	private markerFrame: MarkerFrame;
	private readonly animationDuration = 2;
	private readonly scaleAmplitude = 0.1;

	constructor(
		private params: Pick<MarkerParams, "arrowDirection" | "color" | "markerType" | "zIndex">,
	) {
		super();
	}

	private getSpriteFrame(markerType: MarkerType): MarkerFrame {
		const cylinder = { framePosition: new Vector2(500, 0), frameSize: { w: 500, h: 1000 } };
		switch (markerType) {
			case MarkerType.cylinder:
				return cylinder;
			case MarkerType.corona:
				return { framePosition: new Vector2(1000, 0), frameSize: { w: 1000, h: 1000 } };
			default:
				return cylinder;
		}
	}

	onStart(): void {
		const currentSprite = this.entity.getComponent(Sprite);
		if (currentSprite) this.entity.deleteallComponentsByClass(Sprite);
		this.markerFrame = this.getSpriteFrame(this.params.markerType);
		const scene = this.entity.getScene();
		if (scene) scene.addEntity(this.markerUI);
		this.markerUI.setZindex((this.params.zIndex ?? -1) - 1);
		this.setZindex(this.params.zIndex ?? 0);
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
		const transform = this.entity.getComponent(Transform);
		if (!transform || !this.markerFrame) return;

		const phase = (Time.time / this.animationDuration) * Math.PI * 2;
		const scale = 1 + ((Math.cos(phase) + 1) / 2) * this.scaleAmplitude;
		const image = AssetsManager.getImageByName("spritesheet:markers");
		this.markerUI.setMarker(
			image,
			this.markerFrame,
			transform.position,
			transform.size.clone().multiply(new Vector2(scale, scale)),
			this.params.color ?? "#ffffff",
		);
		const isArrowVisible = this.params.arrowDirection !== "None";
		if (!isArrowVisible) {
			this.markerUI.hideArrow();
			return;
		}
		const arrowPosition = transform.position.clone().multiply(new Vector2(1, scale));
		this.markerUI.setArrow(
			this.arrowFrame,
			arrowPosition,
			new Vector2(0.5, 0.5),
			this.getArrowRotation(this.params.arrowDirection),
		);
	}

	onDestroy(): void {
		const scene = this.entity.getScene();
		if (scene) scene.destroyEntity(this.markerUI);
	}
}
