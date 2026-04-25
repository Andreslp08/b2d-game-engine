import { GameObject } from "engine/common/entities/game-object";
import { ScriptComponent } from "engine/scripts/script-component";
import type { VisualEffect } from "../../interfaces/visual-effect";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import { Time } from "engine/common/interfaces/time";

export class DamageFlashEffect extends ScriptComponent implements VisualEffect {
	private filter: string = "sepia(1) hue-rotate(-50deg) saturate(6) brightness(1.1)";
	shouldEnableDamageShader: boolean = false;
	damageShaderTime: number = 0;
	damageShaderDuration: number = 0.3;
	constructor(filter?: string) {
		super();
		if (filter) this.filter = filter;
	}

	damageShader() {
		const gameObject = this.entity as GameObject;
		if (!gameObject) return;
		const spriteAnimation = gameObject.getComponent(SpriteAnimation);
		if (!spriteAnimation) return;
		const damageFilter = this.filter;

		if (this.shouldEnableDamageShader) {
			const delta = Time.time - this.damageShaderTime;
			spriteAnimation.spritesheet.sprites.forEach((sprite) => sprite.setFilter(damageFilter));

			if (delta > this.damageShaderDuration) {
				this.shouldEnableDamageShader = false;
				this.damageShaderTime = Time.time;
			}
		} else {
			spriteAnimation.spritesheet.sprites.forEach((sprite) => sprite.setFilter("none"));
		}
	}

	onUpdate(): void {
		this.damageShader();
	}

	play() {
		this.shouldEnableDamageShader = true;
		this.damageShaderTime = Time.time;
	}
}
