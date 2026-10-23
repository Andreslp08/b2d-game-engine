import { Time } from "@b2d-engine/core/common/interfaces/time";
import Vector2 from "@b2d-engine/core/math/vector2";
import { UIComponent } from "@b2d-engine/core/ui/components/ui-component";

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;
const FRAME_INSET = 0;
const FRAME_WIDTH = 50;

/** Red screen frame for recent damage and persistent critical health feedback. */
export class DamageFrameUI extends UIComponent {
	private health = 0;
	private maxHealth = 1;
	private damageFlashRemaining = 0;
	private damageFlashDuration = 0;

	constructor() {
		super({ position: Vector2.ZERO.clone(), rotation: 0, size: Vector2.ZERO.clone() });
	}

	setHealth(health: number, maxHealth: number): void {
		this.health = health;
		this.maxHealth = Math.max(maxHealth, 1);
	}

	triggerDamageFlash(duration: number): void {
		this.damageFlashDuration = duration;
		this.damageFlashRemaining = duration;
	}

	render(context: CanvasRenderingContext2D): void {
		const healthRatio = this.health / this.maxHealth;
		const isCritical = healthRatio > 0 && healthRatio < 0.40;
		if (this.damageFlashRemaining <= 0 && !isCritical) return;

		this.damageFlashRemaining = Math.max(0, this.damageFlashRemaining - Time.unscaledDeltaTime);
		const damageProgress = this.damageFlashDuration > 0
			? 1 - this.damageFlashRemaining / this.damageFlashDuration
			: 1;
		const damageAlpha = this.damageFlashRemaining > 0
			? 0.35 + Math.abs(Math.sin(damageProgress * Math.PI * 3)) * 0.65
			: 0;
		const criticalAlpha = isCritical
			? 0.2 + (Math.sin(Time.time * Math.PI * 2) + 1) * 0.25
			: 0;
		context.save();
		context.setTransform(
			context.canvas.width / DESIGN_WIDTH,
			0,
			0,
			context.canvas.height / DESIGN_HEIGHT,
			0,
			0,
		);
		context.filter = "blur(50px)";
		context.globalAlpha = Math.max(damageAlpha, criticalAlpha);
		context.strokeStyle = "#ff1a1a";
		context.lineWidth = FRAME_WIDTH;
		context.strokeRect(
			FRAME_INSET,
			FRAME_INSET,
			DESIGN_WIDTH - FRAME_INSET * 2,
			DESIGN_HEIGHT - FRAME_INSET * 2,
		);
		context.restore();
	}
}
