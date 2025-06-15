import { GameImage } from "../../../common/assets-manager/game-image";
import { Component } from "../../../ecs/component";
import Vector2 from "../../../math/vector2";

type SpriteData = {
	id: string;
	image: GameImage;
	framePosition: Vector2;
	frameSize: { w: number; h: number };
	scale?: { x: number; y: number };
	spriteSourceSize?: { x: number; y: number; w: number; h: number };
	sourceSize?: { w: number; h: number };
	direction?: { x: 1 | -1; y: 1 | -1 };
	visible?: boolean;
	showBlankSprite?: boolean;
	rotation?: number;
	anchor?: { x: number; y: number };
	pivot?: { x: number; y: number };
	trimmed?: boolean;
	opacity?: number;
	shadowColor?: string;
	shadowBlur?: number;
	shadowOffsetX?: number;
	shadowOffsetY?: number;
	filter?: string;
};
export class Sprite extends Component {
	private id: string;
	private framePosition: Vector2;
	private frameSize: { w: number; h: number };
	private scale: { x: number; y: number };
	private spriteSourceSize: { x: number; y: number; w: number; h: number };
	private sourceSize: { w: number; h: number };
	private image: GameImage;
	private direction: { x: 1 | -1; y: 1 | -1 };
	private visible: boolean;
	private showBlankSprite: boolean;
	private rotation: number = 0;
	private anchor: { x: number; y: number };
	private pivot: { x: number; y: number };
	private trimmed: boolean;
	private opacity: number = 1;
	private shadowColor: string;
	private shadowBlur: number;
	private shadowOffsetX: number;
	private shadowOffsetY: number;
	private filter: string;


	/**
	 * Constructor for a Sprite component.
	 * @param {string} id - unique identifier for the sprite
	 * @param {GameImage} image - the image to be rendered
	 * @param {ITranform} imageClipTransform - the real transform values for the image
	 * clip (i.e. the sub-section of the real image to be rendered)
	 */
	constructor(spriteData: SpriteData) {
		super();
		this.id = spriteData.id;
		this.image = spriteData.image;
		this.framePosition = spriteData.framePosition;
		this.frameSize = spriteData.frameSize;
		this.scale = spriteData.scale ?? { x: 1, y: 1 };
		this.spriteSourceSize = spriteData.spriteSourceSize || { x: 0, y: 0, w: this.frameSize.w, h: this.frameSize.h };
		this.sourceSize = spriteData.sourceSize || { w: this.frameSize.w, h: this.frameSize.h };
		this.direction = spriteData.direction || { x: 1, y: 1 };
		this.visible = spriteData.visible || true;
		this.showBlankSprite = spriteData.showBlankSprite ?? true;
		this.rotation = spriteData.rotation ?? 0;
		this.anchor = spriteData.anchor || { x: 0, y: 0 };
		this.pivot = spriteData.pivot || { x: 0.5, y: 0.5 };
		this.trimmed = spriteData.trimmed ?? false;
		this.opacity = spriteData.opacity ?? 1;
		this.shadowColor = spriteData.shadowColor ?? "#000";
		this.shadowBlur = spriteData.shadowBlur ?? 0;
		this.shadowOffsetX = spriteData.shadowOffsetX ?? 0;
		this.shadowOffsetY = spriteData.shadowOffsetY ?? 0;
		this.filter = spriteData.filter ?? "";
	}

	// SETTERS

	setVisible(visible: boolean) {
		this.visible = visible;
	}

	setImage(image: GameImage) {
		this.image = image;
	}

	setFramePosition(position: Vector2) {
		this.framePosition = position;
	}

	setFrameSize(size: { w: number; h: number }) {
		this.frameSize = size;
	}

	setScale(scale: { x: number; y: number }) {
		this.scale = scale;
	}

	setDirection(direction: { x: 1 | -1; y: 1 | -1 }) {
		this.direction = direction;
	}

	setSourceSize(sourceSize: { w: number; h: number }) {
		this.sourceSize = sourceSize;
	}

	setSpriteSourceSize(spriteSourceSize: { x: number; y: number; w: number; h: number }) {
		this.spriteSourceSize = spriteSourceSize;
	}

	setShowBlankSprite(showBlankSprite: boolean) {
		this.showBlankSprite = showBlankSprite;
	}

	setRotation(rotation: number) {
		this.rotation = rotation;
	}

	setAnchor(anchor: { x: number; y: number }) {
		this.anchor = anchor;
	}

	setTrimmed(trimmed: boolean) {
		this.trimmed = trimmed;
	}

	setOpacity(opacity: number) {
		this.opacity = opacity;
	}

	setShadowColor(color: string) {
		this.shadowColor = color;
	}

	setShadowBlur(blur: number) {
		this.shadowBlur = blur;
	}

	setShadowOffsetX(offsetX: number) {
		this.shadowOffsetX = offsetX;
	}

	setShadowOffsetY(offsetY: number) {
		this.shadowOffsetY = offsetY;
	}

	setFilter(filter: string) {
		this.filter = filter;
	}

	setPivot(pivot: { x: number; y: number }) {
		this.pivot = pivot;
	}


	// GETTERS

	getImage() {
		return this.image;
	}

	getFramePosition() {
		return this.framePosition;
	}

	getFrameSize() {
		return this.frameSize;
	}

	getScale() {
		return this.scale;
	}

	getDirection() {
		return this.direction;
	}

	getSourceSize() {
		return this.sourceSize;
	}

	getSpriteSourceSize() {
		return this.spriteSourceSize;
	}

	shouldShowBlankSprite() {
		return this.showBlankSprite;
	}

	isVisible() {
		return this.visible;
	}

	getId() {
		return this.id;
	}

	getRotation() {
		return this.rotation;
	}

	getAnchor() {
		return this.anchor;
	}

	isTrimmed() {
		return this.trimmed;
	}

	getOpacity() {
		return this.opacity;
	}

	getShadowColor() {
		return this.shadowColor;
	}

	getShadowBlur() {
		return this.shadowBlur;
	}

	getShadowOffsetX() {
		return this.shadowOffsetX;
	}

	getShadowOffsetY() {
		return this.shadowOffsetY;
	}

	getFilter() {
		return this.filter;
	}

	getPivot() {
		return this.pivot;
	}

}
