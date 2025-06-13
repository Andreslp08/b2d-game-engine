import { GameImage } from "../../../common/assets-manager/assets-manager";
import { Transform } from "../../../common/components/transform";
import { Component } from "../../../ecs/component";
import { ITranform } from "../../../input/interfaces/transform.interface";
import { MathUtil } from "../../../math/math-util";
import Vector2 from "../../../math/vector2";

export class Sprite extends Component {
	/**
	 * Constructor for a Sprite component.
	 * @param {string} id - unique identifier for the sprite
	 * @param {GameImage} image - the image to be rendered
	 * @param {ITranform} imageClipTransform - the real transform values for the image
	 * clip (i.e. the sub-section of the real image to be rendered)
	 */
	constructor(
		private _id: string,
		private _image: GameImage,
		private _trimPosition: Vector2,
		private _trimSize: Vector2,
		private _renderTransform: ITranform,
		private _direction: { x: 1 | -1; y: 1 | -1 } = { x: 1, y: 1 },
		private _visible: boolean = true,
		private _showBlankSprite: boolean = true
	) {
		super();
	}

	public setDirection(direction: { x: 1 | -1; y: 1 | -1 }) {
		this._direction = direction;
	}

	public setVisible(visible: boolean) {
		this._visible = visible;
	}

	public setShowBlankSprite(showBlankSprite: boolean) {
		this._showBlankSprite = showBlankSprite;
	}

	public setTrimSize(trimSize: Vector2) {
		this._trimSize = trimSize;
	}

	public setTrimPosition(trimPosition: Vector2) {
		this._trimPosition = trimPosition;
	}

	public setRenderTransform(renderTransformOffset: ITranform) {
		this._renderTransform = renderTransformOffset;
	}
	public get renderTransform(): ITranform {
		return this._renderTransform;
	}

	public get showBlankSprite(): boolean {
		return this._showBlankSprite;
	}

	public get visible(): boolean {
		return this._visible;
	}

	public get trimPosition(): Vector2 {
		return this._trimPosition;
	}

	public get trimSize(): Vector2 {
		return this._trimSize;
	}

	public get image(): GameImage {
		return this._image;
	}

	public get id(): string {
		return this._id;
	}

	public get direction(): { x: 1 | -1; y: 1 | -1 } {
		return this._direction;
	}
}
