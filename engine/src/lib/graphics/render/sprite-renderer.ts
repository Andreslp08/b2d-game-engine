import { Transform } from "../../common/components/transform";
import { MathUtil } from "../../math/math-util";
import { Sprite } from "../sprites/components/sprite";
import { Renderer } from "./render";

export class SpriteRenderer extends Renderer {
	render(renderingContext: CanvasRenderingContext2D): void {
		if (!this.entity) return;
		const entity = this.entity;

		const sprite = entity.getComponent(Sprite);
		if (!sprite) return;
		if (!sprite.getEntity()) return;
		if (!sprite.getEntity() || !sprite.getEntity().hasComponent(Transform)) return;
		sprite.entityTransform = sprite.getEntity().getComponent(Transform);
		if (sprite.visible) {
			renderingContext.save();
			renderingContext.translate(sprite.entityTransform.position.x, 0);
			renderingContext.scale(sprite.direction.x, sprite.direction.y);
			renderingContext.translate(-sprite.entityTransform.position.x, 0);

			renderingContext.translate(
				sprite.entityTransform.position.x -
					sprite.entityTransform.size.x / 2 +
					sprite.entityTransform.size.x / 2,
				sprite.entityTransform.position.y -
					sprite.entityTransform.size.y / 2 +
					sprite.entityTransform.size.y / 2
			);
			renderingContext.rotate(
				MathUtil.degToRad(
					sprite.entityTransform.rotation + sprite.imageClipTransform.rotation
				)
			);
			renderingContext.translate(
				-(
					sprite.entityTransform.position.x -
					sprite.entityTransform.size.x / 2 +
					sprite.entityTransform.size.x / 2
				),
				-(
					sprite.entityTransform.position.y -
					sprite.entityTransform.size.y / 2 +
					sprite.entityTransform.size.y / 2
				)
			);
			if (sprite.image && sprite.image.loaded) {
				renderingContext.drawImage(
					sprite.image.nativeElement,
					sprite.imageClipTransform.position.x,
					sprite.imageClipTransform.position.y,
					sprite.imageClipTransform.size.x,
					sprite.imageClipTransform.size.y,
					sprite.entityTransform.position.x - sprite.entityTransform.size.x / 2,
					sprite.entityTransform.position.y - sprite.entityTransform.size.y / 2,
					sprite.entityTransform.size.x,
					sprite.entityTransform.size.y
				);
			} else {
				if (!sprite.showBlankSprite) {
					return;
				}
				renderingContext.beginPath();
				renderingContext.fillStyle = "#fff";
				renderingContext.fillRect(
					sprite.entityTransform.position.x - sprite.entityTransform.size.x / 2,
					sprite.entityTransform.position.y - sprite.entityTransform.size.y / 2,
					sprite.entityTransform.size.x,
					sprite.entityTransform.size.y
				);
				renderingContext.closePath();
			}

			renderingContext.restore();
		}
	}
}
