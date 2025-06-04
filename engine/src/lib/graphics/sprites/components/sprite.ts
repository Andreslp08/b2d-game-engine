import { GameImage } from "../../../common/assets-manager/assets-manager";
import { Transform } from "../../../common/components/transform";
import { Component } from "../../../ecs/component";
import { ITranform } from "../../../input/interfaces/transform.interface";
import { MathUtil } from "../../../math/math-util";

export class Sprite extends Component {
	imageClipTransform: ITranform;
	entityTransform: ITranform;
	image: GameImage;
	id: string;
	visible: boolean;
	direction: { x: 1 | -1; y: 1 | -1 } = { x: 1, y: 1 };

	/**
	 * Constructor for a Sprite component.
	 * @param {string} id - unique identifier for the sprite
	 * @param {GameImage} image - the image to be rendered
	 * @param {ITranform} imageClipTransform - the real transform values for the image
	 * clip (i.e. the sub-section of the real image to be rendered)
	 */
	constructor(id: string, image: GameImage, imageClipTransform: ITranform) {
		super();
		this.id = id;
		this.image = image;
		this.imageClipTransform = imageClipTransform;
		this.visible = true;
	}

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
		if (!this.entity) return;
		if (!this.entity || !this.entity.hasComponent(Transform)) return;
		this.entityTransform = this.entity.getComponent(Transform);
		context.beginPath();
		if (this.visible) {
			context.save();
			context.translate(this.entityTransform.position.x, 0);
			context.scale(this.direction.x, this.direction.y);
			context.translate(-this.entityTransform.position.x, 0);

			context.translate(
				this.entityTransform.position.x -
					this.entityTransform.size.x / 2 +
					this.entityTransform.size.x / 2,
				this.entityTransform.position.y -
					this.entityTransform.size.y / 2 +
					this.entityTransform.size.y / 2
			);
			context.rotate(
				MathUtil.degToRad(this.entityTransform.rotation + this.imageClipTransform.rotation)
			);
			context.translate(
				-(
					this.entityTransform.position.x -
					this.entityTransform.size.x / 2 +
					this.entityTransform.size.x / 2
				),
				-(
					this.entityTransform.position.y -
					this.entityTransform.size.y / 2 +
					this.entityTransform.size.y / 2
				)
			);
			if (this.image && this.image.loaded) {
				context.drawImage(
					this.image.nativeElement,
					this.imageClipTransform.position.x,
					this.imageClipTransform.position.y,
					this.imageClipTransform.size.x,
					this.imageClipTransform.size.y,
					this.entityTransform.position.x - this.entityTransform.size.x / 2,
					this.entityTransform.position.y - this.entityTransform.size.y / 2,
					this.entityTransform.size.x,
					this.entityTransform.size.y
				);
			} else {
				context.beginPath();
				context.fillStyle = "#fff";
				context.fillRect(
					this.entityTransform.position.x - this.entityTransform.size.x / 2,
					this.entityTransform.position.y - this.entityTransform.size.y / 2,
					this.entityTransform.size.x,
					this.entityTransform.size.y
				);
				context.closePath();
			}

			context.restore();
		}
		context.closePath();
	}
}
