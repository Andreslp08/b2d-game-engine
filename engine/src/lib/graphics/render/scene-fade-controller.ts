import { RenderLayerTypes } from "../enum/render-layer-types.enum";
import { RenderLayers } from "./render-layers";

export type SceneFadeTarget = "screen" | RenderLayerTypes | RenderLayerTypes[];

export interface SceneFadeOptions {
	color?: string;
	/** Duration in seconds. */
	duration?: number;
	/** Delay before the fade starts, in seconds. */
	delay?: number;
	target?: SceneFadeTarget;
	to: number;
}

interface FadeState {
	color: string;
	delay: number;
	duration: number;
	elapsed: number;
	from: number;
	to: number;
}

export class SceneFadeController {
	private screenFade?: FadeState;
	private readonly layerFades = new Map<RenderLayerTypes, FadeState>();

	fade(options: SceneFadeOptions): void {
		const target = options.target ?? "screen";
		const alpha = Math.max(0, Math.min(1, options.to));
		const duration = Math.max(0, options.duration ?? 0);
		const delay = Math.max(0, options.delay ?? 0);
		const color = options.color ?? "#000";
		const createState = (from: number): FadeState => ({
			color,
			delay,
			duration,
			elapsed: 0,
			from,
			to: alpha,
		});

		if (target === "screen") {
			this.screenFade = createState(this.getAlpha(this.screenFade));
			return;
		}

		for (const fadeTarget of Array.isArray(target) ? target : [target]) {
			this.layerFades.set(fadeTarget, createState(RenderLayers.getLayer(fadeTarget)?.fadeAlpha ?? 0));
		}
	}

	update(deltaTime: number): void {
		this.screenFade = this.updateState(this.screenFade, deltaTime);

		for (const [type, fade] of this.layerFades) {
			const nextFade = this.updateState(fade, deltaTime);
			const layer = RenderLayers.getLayer(type);
			if (!layer) {
				this.layerFades.delete(type);
				continue;
			}

			const alpha = this.getAlpha(nextFade);
			layer.fadeLayer(alpha > 0, alpha, fade.color);
			if (!nextFade || alpha === 0) this.layerFades.delete(type);
			else this.layerFades.set(type, nextFade);
		}
	}

	render(context: CanvasRenderingContext2D): void {
		const fade = this.screenFade;
		if (!fade) return;
		const alpha = this.getAlpha(fade);
		if (alpha <= 0) return;

		context.save();
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.globalAlpha = alpha;
		context.fillStyle = fade.color;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);
		context.restore();
	}

	private updateState(fade: FadeState | undefined, deltaTime: number): FadeState | undefined {
		if (!fade) return fade;

		let remainingDelta = deltaTime;
		if (fade.delay > 0) {
			const consumedDelay = Math.min(fade.delay, remainingDelta);
			fade.delay -= consumedDelay;
			remainingDelta -= consumedDelay;
			if (fade.delay > 0) return fade;
		}
		if (fade.duration === 0) return fade;

		fade.elapsed = Math.min(fade.duration, fade.elapsed + remainingDelta);
		return fade.elapsed === fade.duration && fade.to === 0 ? undefined : fade;
	}

	private getAlpha(fade: FadeState | undefined): number {
		if (!fade) return 0;
		if (fade.delay > 0) return fade.from;
		if (fade.duration === 0) return fade.to;
		const progress = fade.elapsed / fade.duration;
		return fade.from + (fade.to - fade.from) * progress;
	}
}
