import { FlashEffect } from "./flash-effect";

/** Green flash used when the player restores health. */
export class HealingFlashEffect extends FlashEffect {
	constructor() {
		super("sepia(1) hue-rotate(80deg) saturate(5) brightness(1.1)", 1);
	}
}
