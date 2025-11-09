import { MathUtil } from "./../../math/math-util";
import { Transform } from "../../common/components/transform";
import { GameObject } from "../../common/entities/game-object";
import { Sprite } from "../sprites/components/sprite";
import { SpriteAnimation } from "../sprites/components/sprite-animation";
import { Renderer } from "./render";
import { PIXELS_PER_METER } from "../../common/constants";

export class SpriteRenderer extends Renderer {
	renderSprite(renderingContext: CanvasRenderingContext2D, sprite: Sprite) {
		if (!sprite || !sprite.getEntity()) return;
		const entity = sprite.getEntity() as GameObject;
		const isUsingEntityTransform = sprite.isUsingEntityTransform();
		const transform = isUsingEntityTransform
			? entity.getComponent(Transform)
			: sprite.getWorldTransform();
		if (isUsingEntityTransform && !transform) return;
		if (!sprite.isVisible()) return;
		const image = sprite.getImage();
		const opacity = sprite.getOpacity();
		const shadowColor = sprite.getShadowColor();
		const shadowBlur = sprite.getShadowBlur();
		const shadowOffsetX = sprite.getShadowOffsetX();
		const shadowOffsetY = sprite.getShadowOffsetY();
		const filter = sprite.getFilter();

		renderingContext.save();
		renderingContext.globalAlpha = opacity;
		renderingContext.shadowColor = shadowColor;
		renderingContext.shadowOffsetX = shadowOffsetX;
		renderingContext.shadowOffsetY = shadowOffsetY;
		renderingContext.shadowBlur = shadowBlur;
		if(filter && filter !== "none") renderingContext.filter = filter;
	
		this.renderWorldTransform(renderingContext, sprite);
		if (image && image.loaded) {
			this.renderImage(renderingContext, sprite);
		} else {
			this.renderDefaultShape(renderingContext, sprite);
		}
		renderingContext.restore();
	}

	renderImage(renderingContext: CanvasRenderingContext2D, sprite: Sprite) {
		if (!sprite || !sprite.getEntity()) return;
		const entity = sprite.getEntity() as GameObject;
		const isUsingEntityTransform = sprite.isUsingEntityTransform();
		const transform = isUsingEntityTransform
			? entity.getComponent(Transform)
			: sprite.getWorldTransform();
		if (isUsingEntityTransform && !transform) return;
		if (!sprite.isVisible()) return;
		const framePos = sprite.getFramePosition(); // (x, y) del recorte dentro del atlas
		const frameSize = sprite.getFrameSize(); // (w, h) del recorte
		const sourceSize = sprite.getSourceSize(); // tamaño total del sprite original
		// const spriteSourceSize = sprite.getSpriteSourceSize(); // zona recortada visible
		// const direction = sprite.getDirection();
		const image = sprite.getImage();
		renderingContext.drawImage(
			image.nativeElement,
			framePos.x,
			framePos.y,
			frameSize.w,
			frameSize.h,
			0,
			0,
			sourceSize.w / PIXELS_PER_METER,
			sourceSize.h / PIXELS_PER_METER
		);
	}

	renderDefaultShape(renderingContext: CanvasRenderingContext2D, sprite: Sprite) {
		if (!sprite || !sprite.getEntity()) return;
		const entity = sprite.getEntity();
		const isUsingEntityTransform = sprite.isUsingEntityTransform();
		const transform = isUsingEntityTransform
			? entity.getComponent(Transform)
			: sprite.getWorldTransform();
		if (isUsingEntityTransform && !transform) return;
		if (!sprite.isVisible()) return;
		const showBlankSprite = sprite.shouldShowBlankSprite();
		if (!showBlankSprite) return;
		const shouldShowBlankSprite = sprite.shouldShowBlankSprite();
		if (!shouldShowBlankSprite) return;
		const size = transform.size;
		renderingContext.fillStyle = "#fff";
		renderingContext.fillRect(0, 0, size.x, size.y);
	}

	renderWorldTransform(renderingContext: CanvasRenderingContext2D, sprite: Sprite): void {
		if (!renderingContext || !sprite) return;
		const gameObject = this.entity as GameObject;
		if (!gameObject) return;
		const isUsingEntityTransform = sprite.isUsingEntityTransform();
		const transform = isUsingEntityTransform
			? gameObject.getComponent(Transform)
			: sprite.getWorldTransform();
		if (isUsingEntityTransform && !transform) return;
		if (!sprite.isVisible()) return;
		const pos = transform.position;
		const size = transform.size; // tamaño lógico del GameObject (en metros)
		const spriteScale = sprite.getScale(); // escala visual adicional
		const direction = sprite.getDirection(); // -1 o 1
		const pivot = sprite.getPivot();
		const anchor = sprite.getAnchor();

		const sourceSize = sprite.getSourceSize(); // tamaño original del sprite en px
		const spriteW = sourceSize.w / PIXELS_PER_METER;
		const spriteH = sourceSize.h / PIXELS_PER_METER;

		// Escala visual para que el sprite quepa en el size definido por el transform
		const visualScale = { x: 1, y: 1 };

		visualScale.x = transform.size.x / spriteW;
		visualScale.y = transform.size.y / spriteH;

		// Orden correcto de transformaciones
		renderingContext.translate(pos.x - anchor.x, pos.y - anchor.y);
		renderingContext.rotate(MathUtil.degToRad(transform.rotation));
		renderingContext.rotate(MathUtil.degToRad(sprite.getRotation()));
		renderingContext.scale(
			visualScale.x * spriteScale.x * direction.x,
			visualScale.y * spriteScale.y * direction.y
		);
		renderingContext.translate(-spriteW * pivot.x, -spriteH * pivot.y);
	}
	render(renderingContext: CanvasRenderingContext2D): void {
		if (!this.entity) return;
		const entity = this.entity;
		const sprites = entity.getComponents(Sprite);
		const spritesAnimations = entity.getComponents(SpriteAnimation);
		const ordered = [...sprites, ...spritesAnimations].sort(
			(a, b) => a.getZindex() - b.getZindex()
		);
		for (const component of ordered) {
			if (component instanceof SpriteAnimation) {
				this.renderSprite(renderingContext, component.currentSprite);
			} else {
				this.renderSprite(renderingContext, component);
			}
		}
	}
}
