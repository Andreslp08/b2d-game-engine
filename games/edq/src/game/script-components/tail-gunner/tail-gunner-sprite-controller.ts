import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import type { GameObject } from "engine/common/entities/game-object";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import { SpriteSheet } from "engine/graphics/sprites/spritesheet";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { ScriptComponent } from "engine/scripts/script-component";

export type TailGunnerSpriteState = "idle" | "attack" | "walk";

export class TailGunnerSpriteController extends ScriptComponent {
	currentSpriteState: TailGunnerSpriteState = "idle";
	idleSpriteSheet: SpriteSheet;
	walkSpriteSheet: SpriteSheet;
	attackSpriteSheet: SpriteSheet;

	onStart(): void {
		const spritesheetImage = AssetsManager.getImageByName("spritesheet:enemies:tail-gunner");
		const atlas = AssetsManager.getAtlasByName("atlas:enemies:tail-gunner");
		this.idleSpriteSheet = SpriteSheet.genereateSpritesheetFromAtlas("idle", atlas, spritesheetImage, 0, 5);
		this.walkSpriteSheet = SpriteSheet.genereateSpritesheetFromAtlas("walk", atlas, spritesheetImage, 6, 10);
		this.attackSpriteSheet = SpriteSheet.genereateSpritesheetFromAtlas("attack", atlas, spritesheetImage, 11, 15);

		const obj = this.entity as GameObject;
		if (!obj.getComponent(SpriteAnimation)) {
			obj.addComponent(new SpriteAnimation(this.idleSpriteSheet, obj, true, 0.1));
		}
	}

	onUpdate(): void {
		const spriteAnimation = this.entity.getComponent(SpriteAnimation);
		if (!spriteAnimation) return;

		if (this.currentSpriteState === "attack") {
			spriteAnimation.setAnimation(this.attackSpriteSheet, false, 0.1);
		} else if (this.currentSpriteState === "idle") {
			spriteAnimation.setAnimation(this.idleSpriteSheet, true, 0.1);
		} else {
			spriteAnimation.setAnimation(this.walkSpriteSheet, true, 0.1);
		}

		const body = this.entity.getComponent(DynamicBody);
		if (body) spriteAnimation.setAnimationDirectionInX(-body.direction.x as 1 | -1);
	}
}
