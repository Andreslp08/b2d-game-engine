import { GameImage } from "../../../common/assets-manager/game-image";
import { Component } from "../../../ecs/component";
import { ITranform } from "../../../input/interfaces/transform.interface";
import Vector2 from "../../../math/vector2";

type SpriteData = {
	image: GameImage;
	framePosition: Vector2;
	frameSize: { w: number; h: number };
	scale?: Vector2;
	spriteSourceSize?: { x: number; y: number; w: number; h: number };
	sourceSize?: { w: number; h: number };
	worldTransform?: ITranform;
	useEntityTransform?: boolean;
	direction?: { x: 1 | -1; y: 1 | -1 };
	visible?: boolean;
	showBlankSprite?: boolean;
	rotation?: number;
	anchor?: Vector2;
	pivot?: Vector2;
	trimmed?: boolean;
	opacity?: number;
	shadowColor?: string;
	shadowBlur?: number;
	shadowOffsetX?: number;
	shadowOffsetY?: number;
	filter?: string;
};
export class Sprite extends Component {
	private framePosition: Vector2;
	private frameSize: { w: number; h: number };
	private scale: Vector2;
	private spriteSourceSize: { x: number; y: number; w: number; h: number };
	private sourceSize: { w: number; h: number };
	private image: GameImage;
	private direction: { x: 1 | -1; y: 1 | -1 };
	private visible: boolean;
	private showBlankSprite: boolean;
	private rotation: number = 0;
	private anchor: Vector2;
	private pivot: Vector2;
	private trimmed: boolean;
	private opacity: number = 1;
	private shadowColor: string;
	private shadowBlur: number;
	private shadowOffsetX: number;
	private shadowOffsetY: number;
	private filter: string;
	private useEntityTransform: boolean;
	private worldTransform: ITranform;

	/**
	 * Constructor for a Sprite component.
	 * @param {string} id - unique identifier for the sprite
	 * @param {GameImage} image - the image to be rendered
	 * @param {ITranform} imageClipTransform - the real transform values for the image
	 * clip (i.e. the sub-section of the real image to be rendered)
	 */
	constructor(spriteData: SpriteData) {
		super();
		this.unique = false;
		this.image = spriteData.image;
		this.framePosition = spriteData.framePosition;
		this.frameSize = spriteData.frameSize;
		this.scale = spriteData.scale ?? new Vector2(1, 1);
		this.spriteSourceSize = spriteData.spriteSourceSize || {
			x: 0,
			y: 0,
			w: this.frameSize.w,
			h: this.frameSize.h,
		};
		this.sourceSize = spriteData.sourceSize || { w: this.frameSize.w, h: this.frameSize.h };
		this.direction = spriteData.direction || { x: 1, y: 1 };
		this.visible = spriteData.visible || true;
		this.showBlankSprite = spriteData.showBlankSprite ?? true;
		this.rotation = spriteData.rotation ?? 0;
		this.anchor = spriteData.anchor || new Vector2(0, 0);
		this.pivot = spriteData.pivot || new Vector2(0.5, 0.5);
		this.trimmed = spriteData.trimmed ?? false;
		this.opacity = spriteData.opacity ?? 1;
		this.shadowColor = spriteData.shadowColor ?? "#000";
		this.shadowBlur = spriteData.shadowBlur ?? 0;
		this.shadowOffsetX = spriteData.shadowOffsetX ?? 0;
		this.shadowOffsetY = spriteData.shadowOffsetY ?? 0;
		this.filter = spriteData.filter ?? "";
		this.useEntityTransform = spriteData.useEntityTransform ?? true;
		this.worldTransform = spriteData.worldTransform || null;
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

	setScale(scale: Vector2) {
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

	setAnchor(anchor: Vector2) {
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

	setPivot(pivot: Vector2) {
		this.pivot = pivot;
	}

	setUseEntityTransform(useGameObjectSize: boolean) {
		this.useEntityTransform = useGameObjectSize;
	}

	setWorldTransform(worldTransform: ITranform) {
		this.worldTransform = worldTransform;
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

	isUsingEntityTransform() {
		return this.useEntityTransform;
	}

	getWorldTransform() {
		return this.worldTransform;
	}
}
