import { GameImage } from "../../../common/assets-manager/assets-manager";
import { Component } from "../../../ecs/component";
import { ITranform } from "../../../input/interfaces/transform.interface";
import { MathUtil } from "../../../math/math-util";

export class Sprite extends Component {
	imageTransform: ITranform;
	attachedElementTransform: ITranform;
	image: GameImage;
	id: string;
	visible: boolean;
	direction: { x: 1 | -1; y: 1 | -1 };

	constructor(
		id: string,
		image: GameImage,
		imageTransform: ITranform,
		attachedElementTransform: ITranform
	) {
		super();
		this.id = id;
		this.image = image;
		this.imageTransform = imageTransform;
		this.attachedElementTransform = attachedElementTransform;
		this.visible = true;
		this.direction = { x: 1, y: 1 };
	}

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
		context.beginPath();
		if (this.visible) {
			context.save();
			if (this.direction.x < 0 || this.direction.y < 0) {
				context.translate(this.attachedElementTransform.position.x, 0);
				context.scale(this.direction.x, this.direction.y);
				context.translate(-this.attachedElementTransform.position.x, 0);
			}

			context.translate(
				this.attachedElementTransform.position.x -
					this.attachedElementTransform.size.x / 2 +
					this.attachedElementTransform.size.x / 2,
				this.attachedElementTransform.position.y -
					this.attachedElementTransform.size.y / 2 +
					this.attachedElementTransform.size.y / 2
			);
			context.rotate(
				MathUtil.degToRad(
					this.attachedElementTransform.rotation + this.imageTransform.rotation
				)
			);
			context.translate(
				-(
					this.attachedElementTransform.position.x -
					this.attachedElementTransform.size.x / 2 +
					this.attachedElementTransform.size.x / 2
				),
				-(
					this.attachedElementTransform.position.y -
					this.attachedElementTransform.size.y / 2 +
					this.attachedElementTransform.size.y / 2
				)
			);
			if (this.image && this.image.loaded) {
				context.drawImage(
					this.image.nativeElement,
					this.imageTransform.position.x,
					this.imageTransform.position.y,
					this.imageTransform.size.x,
					this.imageTransform.size.y,
					this.attachedElementTransform.position.x -
						this.attachedElementTransform.size.x / 2,
					this.attachedElementTransform.position.y -
						this.attachedElementTransform.size.y / 2,
					this.attachedElementTransform.size.x,
					this.attachedElementTransform.size.y
				);
			}
			else{
				context.beginPath();
				context.fillStyle = "#fff"
				context.fillRect(this.attachedElementTransform.position.x - this.attachedElementTransform.size.x/2,
					this.attachedElementTransform.position.y - this.attachedElementTransform.size.y/2,
					this.attachedElementTransform.size.x,
					this.attachedElementTransform.size.y,)
				context.closePath();
			}

			context.restore();
		}
		context.closePath();
	}
}
