import { Transform } from "../../common/components/transform";
import { Component } from "../../ecs/component";
import { MathUtil } from "../../math/math-util";
import Vector2 from "../../math/vector2";
import { CollisionDetectionStategy } from "../interfaces/collisions";

export class Collider extends Component implements CollisionDetectionStategy {
	collidable: boolean;
	activated: boolean;
	isColliding: boolean;
	ignoreZIndex: boolean = false;
	protected offsetPosition: Vector2;
	protected size: Vector2;

	constructor(offsetPosition: Vector2, size: Vector2) {
		super();
		this.collidable = true;
		this.isColliding = false;
		this.offsetPosition = offsetPosition;
		this.size = size;
	}
	intersects(other: Collider): boolean {
		let isIntersecting = false;
		const positionA = this.getPosition();
		const positionB = other.getPosition();
		const sizeA = this.size;
		const sizeB = other.size;
		if (
			positionA.x + sizeA.x / 2 > positionB.x - sizeB.x / 2 &&
			positionA.x - sizeA.x / 2 < positionB.x + sizeB.x / 2 &&
			positionA.y + sizeA.y / 2 > positionB.y - sizeB.y / 2 &&
			positionA.y - sizeA.y / 2 < positionB.y + sizeB.y / 2
		) {
			isIntersecting = true;
		}
		return isIntersecting;
	}

	setOffsetPosition(position: Vector2) {
		this.offsetPosition = position;
		return this;
	}

	setSize(size: Vector2) {
		this.size = size;
		return this;
	}

	getOffsetPosition() {
		return this.offsetPosition;
	}

	getSize() {
		return this.size;
	}

	getPosition(): Vector2 {
		const position = new Vector2(0, 0);
		if (!this.entity) return position;
		if (!this.entity.hasComponent(Transform)) return position;
		const parentPosition = this.entity.getComponent(Transform).position;

		return new Vector2(
			parentPosition.x + this.offsetPosition.x,
			parentPosition.y + this.offsetPosition.y
		);
	}

	// getSize(): Vector2 {
	// 	let position = new Vector2(0, 0);
	// 	if (!this.entity) return position;
	// 	if (!this.entity.hasComponent(Transform)) return position;
	// 	const parentSize = this.entity.getComponent(Transform).size;

	// 	return new Vector2(parentSize.x + this.size.x, parentSize.y + this.size.y);
	// }

	onCollisionDetected(): void {}
}
