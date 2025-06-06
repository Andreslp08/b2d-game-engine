import { Transform } from "../../common/components/transform";
import { MathUtil } from "../../math/math-util";
import { Sprite } from "../sprites/components/sprite";
import { Renderer } from "./render";

export class SpriteRenderer extends Renderer {
	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
		if (!this.entity) return;
		const entity = this.entity;

		const sprite = entity.getComponent(Sprite);
		if (!sprite) return;
		if (!sprite.getEntity()) return;
		if (!sprite.getEntity() || !sprite.getEntity().hasComponent(Transform)) return;
		sprite.entityTransform = sprite.getEntity().getComponent(Transform);
		if (sprite.visible) {
			context.save();
			context.translate(sprite.entityTransform.position.x, 0);
			context.scale(sprite.direction.x, sprite.direction.y);
			context.translate(-sprite.entityTransform.position.x, 0);

			context.translate(
				sprite.entityTransform.position.x -
					sprite.entityTransform.size.x / 2 +
					sprite.entityTransform.size.x / 2,
				sprite.entityTransform.position.y -
					sprite.entityTransform.size.y / 2 +
					sprite.entityTransform.size.y / 2
			);
			context.rotate(
				MathUtil.degToRad(
					sprite.entityTransform.rotation + sprite.imageClipTransform.rotation
				)
			);
			context.translate(
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
				context.drawImage(
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
				context.beginPath();
				context.fillStyle = "#fff";
				context.fillRect(
					sprite.entityTransform.position.x - sprite.entityTransform.size.x / 2,
					sprite.entityTransform.position.y - sprite.entityTransform.size.y / 2,
					sprite.entityTransform.size.x,
					sprite.entityTransform.size.y
				);
				context.closePath();
			}

			context.restore();
		}
	}
}
