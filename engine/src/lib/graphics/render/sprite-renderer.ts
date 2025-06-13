import { Transform } from "../../common/components/transform";
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
		if (!sprite.image) return;
		if (!sprite.trimPosition || !sprite.trimSize) return;
		const offsetTransform = sprite.renderTransform;
		if (!offsetTransform) return;
		if (!sprite.visible) return;

		renderingContext.save();
		const finalScaleX = offsetTransform.size.x;
		const finalScaleY = offsetTransform.size.y;
		renderingContext.translate(entityTransform.position.x, entityTransform.position.y);
		renderingContext.scale(finalScaleX, finalScaleY);
		renderingContext.scale(sprite.direction.x, sprite.direction.y);
		renderingContext.rotate(MathUtil.degToRad(entityTransform.rotation));
		renderingContext.rotate(MathUtil.degToRad(offsetTransform.rotation));
		renderingContext.translate(-entityTransform.position.x, -entityTransform.position.y);
		if (sprite.image && sprite.image.loaded) {
			renderingContext.drawImage(
				sprite.image.nativeElement,
				sprite.trimPosition.x,
				sprite.trimPosition.y,
				sprite.trimSize.x,
				sprite.trimSize.y,
				entityTransform.position.x - entityTransform.size.x / 2,
				entityTransform.position.y - entityTransform.size.y / 2,
				entityTransform.size.x,
				entityTransform.size.y
			);
		} else {
			if (!sprite.showBlankSprite) {
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
			if (component instanceof SpriteAnimation ) {
				this.renderSingleSprite(renderingContext, component.currentSprite);
			} else {
				this.renderSingleSprite(renderingContext, component);
			}
		}
	}
}
