import { FlashEffect } from "./flash-effect";

/** Brief red flash used when an entity takes damage. */
export class DamageFlashEffect extends FlashEffect {
	constructor() {
		super("sepia(1) hue-rotate(-50deg) saturate(6) brightness(1.1)", 0.3);
	}
}
