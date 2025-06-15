import { Transform } from "../../common/components/transform";
import { GameObject } from "../../common/entities/game-object";
import { Time } from "../../common/interfaces/time";
import { Sprite } from "../sprites/components/sprite";
import { SpriteAnimation } from "../sprites/components/sprite-animation";
import { Renderer } from "./render";

export class SpriteRenderer extends Renderer {

	renderSprite(renderingContext: CanvasRenderingContext2D, sprite: Sprite) {
		if (!sprite || !sprite.getEntity()) return;
		const entity = sprite.getEntity() as GameObject;
		const transform = entity.getComponent(Transform);
		if (!transform || !sprite.isVisible()) return;
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
		renderingContext.filter = filter;
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
		const transform = entity.getComponent(Transform);
		if (!transform || !sprite.isVisible()) return;
		const size = transform.size;
		const framePos = sprite.getFramePosition(); // (x, y) del recorte dentro del atlas
		const frameSize = sprite.getFrameSize(); // (w, h) del recorte
		// const sourceSize = sprite.getSourceSize(); // tamaño total del sprite original
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
			size.x,
			size.y
		);
	}

	renderDefaultShape(renderingContext: CanvasRenderingContext2D, sprite: Sprite) {
		if (!sprite || !sprite.getEntity()) return;
		const entity = sprite.getEntity();
		const transform = entity.getComponent(Transform);
		if (!transform) return;
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
		const transform = gameObject.getComponent(Transform);
		if (!transform) return;
		const size = transform.size;
		const pos = transform.position;
		const scale = sprite.getScale();
		const pivot = sprite.getPivot();
		const anchor = sprite.getAnchor();
		const direction = sprite.getDirection();

		renderingContext.translate(pos.x - anchor.x, pos.y - anchor.y);
		renderingContext.rotate(transform.rotation);
		renderingContext.rotate(sprite.getRotation());
		renderingContext.scale(scale.x * direction.x , scale.y * direction.y);
		renderingContext.translate(-size.x * pivot.x, -size.y * pivot.y);
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
