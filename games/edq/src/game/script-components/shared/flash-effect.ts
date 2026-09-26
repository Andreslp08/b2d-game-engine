import { GameObject } from "engine/common/entities/game-object";
import { Time } from "engine/common/interfaces/time";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import { ScriptComponent } from "engine/scripts/script-component";
import type { VisualEffect } from "../../interfaces/visual-effect";

/** Applies a configurable visual filter to an entity's sprites for a duration. */
export class FlashEffect extends ScriptComponent implements VisualEffect {
	private activeUntil = 0;
	private active = false;

	constructor(
		private readonly filter: string,
		private readonly durationSeconds: number,
	) {
		super();
	}

	play(): void {
		this.active = true;
		this.activeUntil = Time.time + this.durationSeconds;
	}

	onUpdate(): void {
		const entity = this.entity as GameObject;
		if (!entity) return;

		const sprites = new Set<Sprite>(entity.getComponents(Sprite));
		const animation = entity.getComponent(SpriteAnimation);
		animation?.spritesheet.sprites.forEach((sprite) => sprites.add(sprite));

		const filter = this.active && Time.time < this.activeUntil ? this.filter : "none";
		for (const sprite of sprites) sprite.setFilter(filter);
		if (this.active && Time.time >= this.activeUntil) this.active = false;
	}
}
