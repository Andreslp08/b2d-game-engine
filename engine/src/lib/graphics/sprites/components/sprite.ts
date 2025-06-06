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
}
