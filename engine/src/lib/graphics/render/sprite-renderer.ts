import { Transform } from "../../common/components/transform";
import { GameObject } from "../../common/entities/game-object";
import { MathUtil } from "../../math/math-util";
import { Sprite } from "../sprites/components/sprite";
import { SpriteAnimation } from "../sprites/components/sprite-animation";
import { Renderer } from "./render";

export class SpriteRenderer extends Renderer {
	renderSingleSprite(renderingContext: CanvasRenderingContext2D, sprite: Sprite) {
		if (!sprite) return;
		if (!sprite.getEntity()) return;
		const entityTransform = sprite.getEntity().getComponent(Transform);
		if (!entityTransform) return;
		if (!sprite.getImage()) return;
		if (!sprite.getFramePosition() || !sprite.getFrameSize()) return;
		if (!sprite.getSourceSize()) return;
		if (!sprite.getSpriteSourceSize()) return;
		if (!sprite.isVisible()) return;
		const entity = sprite.getEntity() as GameObject;
		// if(!entity.getTags().includes('player')) return;
		const framePosition = sprite.getFramePosition();
		const frameSize = sprite.getFrameSize();
		const sourceSize = sprite.getSourceSize();
		const spriteSourceSize = sprite.getSpriteSourceSize();
		const scale = sprite.getScale();
		const direction = sprite.getDirection();
		const image = sprite.getImage();
		const showBlankSprite = sprite.shouldShowBlankSprite();
		const spriteRotation = sprite.getRotation();
		const entityRotation = entity.transform.rotation;
		const entityPosX = entityTransform.position.x - entityTransform.size.x / 2;
		const entityPosY = entityTransform.position.y - entityTransform.size.y / 2;
		const entitySizeX = entityTransform.size.x;
		const entitySizeY = entityTransform.size.y;
		const anchor = sprite.getAnchor();
		const destX = entityPosX - anchor.x;
		const destY = entityPosY - anchor.y;
		const opacity = sprite.getOpacity();
		const shadowColor = sprite.getShadowColor();
		const shadowBlur = sprite.getShadowBlur();
		const shadowOffsetX = sprite.getShadowOffsetX();
		const shadowOffsetY = sprite.getShadowOffsetY();
		const filter = sprite.getFilter();

		renderingContext.save();
		renderingContext.translate(entityTransform.position.x, entityTransform.position.y);
		renderingContext.scale(scale, scale);
		renderingContext.scale(direction.x, direction.y);
		renderingContext.rotate(MathUtil.degToRad(entityRotation));
		renderingContext.rotate(MathUtil.degToRad(spriteRotation));
		renderingContext.translate(-entityTransform.position.x, -entityTransform.position.y);
		renderingContext.globalAlpha = opacity;
		renderingContext.shadowColor = shadowColor;
		renderingContext.shadowOffsetX = shadowOffsetX;
		renderingContext.shadowOffsetY = shadowOffsetY;
		renderingContext.shadowBlur = shadowBlur;
		renderingContext.filter = filter;
		
		if (image && image.loaded) {
			renderingContext.drawImage(
				image.nativeElement,
				framePosition.x,
				framePosition.y,
				frameSize.w,
				frameSize.h,
				destX,
				destY,
				entityTransform.size.x,
				entityTransform.size.y
			);
		} else {
			if (!showBlankSprite) {
				return;
			}
			renderingContext.beginPath();
			renderingContext.fillStyle = "#fff";
			renderingContext.fillRect(
				entityTransform.position.x - entityTransform.size.x / 2,
				entityTransform.position.y - entityTransform.size.y / 2,
				entityTransform.size.x,
				entityTransform.size.y
			);
			renderingContext.closePath();
		}

		renderingContext.restore();
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
				this.renderSingleSprite(renderingContext, component.currentSprite);
			} else {
				this.renderSingleSprite(renderingContext, component);
			}
		}
	}
}
