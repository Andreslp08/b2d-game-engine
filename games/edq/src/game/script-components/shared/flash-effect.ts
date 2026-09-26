import { GameObject } from "engine/common/entities/game-object";
import { Time } from "engine/common/interfaces/time";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import { ScriptComponent } from "engine/scripts/script-component";
import type { VisualEffect } from "../../interfaces/visual-effect";

/** Applies a configurable visual filter to an entity's sprites for a duration. */
export class FlashEffect extends ScriptComponent implements VisualEffect {
	private static readonly activeFilters = new WeakMap<Sprite, Map<FlashEffect, string>>();
	private activeUntil = 0;
	private active = false;
	private additionalSpritesProvider?: () => Iterable<Sprite>;
	private appliedSprites = new Set<Sprite>();

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

	setAdditionalSpritesProvider(provider: () => Iterable<Sprite>): void {
		this.additionalSpritesProvider = provider;
	}

	onUpdate(): void {
		const entity = this.entity as GameObject;
		if (!entity) return;

		const sprites = new Set<Sprite>(entity.getComponents(Sprite));
		entity.getComponents(SpriteAnimation).forEach((animation) => {
			animation.spritesheet.sprites.forEach((sprite) => sprites.add(sprite));
			if (animation.currentSprite) sprites.add(animation.currentSprite);
		});
		for (const sprite of this.additionalSpritesProvider?.() ?? []) sprites.add(sprite);

		const isActive = this.active && Time.time < this.activeUntil;
		if (!isActive) this.active = false;

		for (const sprite of this.appliedSprites) {
			if (!isActive || !sprites.has(sprite)) this.unregister(sprite);
		}
		if (isActive) {
			for (const sprite of sprites) this.register(sprite);
			this.appliedSprites = sprites;
		} else {
			this.appliedSprites.clear();
		}
	}

	private register(sprite: Sprite): void {
		let filters = FlashEffect.activeFilters.get(sprite);
		if (!filters) {
			filters = new Map<FlashEffect, string>();
			FlashEffect.activeFilters.set(sprite, filters);
		}
		filters.set(this, this.filter);
		this.refresh(sprite, filters);
	}

	private unregister(sprite: Sprite): void {
		const filters = FlashEffect.activeFilters.get(sprite);
		if (!filters) return;
		filters.delete(this);
		if (filters.size === 0) FlashEffect.activeFilters.delete(sprite);
		this.refresh(sprite, filters);
	}

	private refresh(sprite: Sprite, filters: Map<FlashEffect, string>): void {
		let filter = "none";
		for (const activeFilter of filters.values()) filter = activeFilter;
		sprite.setFilter(filter);
	}
}
