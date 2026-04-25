import { Transform } from "../../common/components/transform";
import { Component } from "../../ecs/component";
import { Entity } from "../../ecs/entity";
import Vector2 from "../../math/vector2";

export class TriggerArea extends Component {
	active: boolean = true;
	protected _ignoreEntities: Entity[] = [];
	protected offsetPosition: Vector2;
	protected size: Vector2;

	constructor(offsetPosition: Vector2, size: Vector2) {
		super();
		this.unique = false;
		this.offsetPosition = offsetPosition;
		this.size = size;
	}

	intersects(other: TriggerArea): boolean {
		const positionA = this.getPosition();
		const positionB = other.getPosition();
		const sizeA = this.size;
		const sizeB = other.getSize();

		return (
			positionA.x + sizeA.x / 2 > positionB.x - sizeB.x / 2 &&
			positionA.x - sizeA.x / 2 < positionB.x + sizeB.x / 2 &&
			positionA.y + sizeA.y / 2 > positionB.y - sizeB.y / 2 &&
			positionA.y - sizeA.y / 2 < positionB.y + sizeB.y / 2
		);
	}

	ignoreEntity(entity: Entity) {
		this._ignoreEntities.push(entity);
		return this;
	}

	unignoreEntity(entity: Entity) {
		this._ignoreEntities = this._ignoreEntities.filter((e) => e.id !== entity?.id);
		return this;
	}

	getIgnoreEntities() {
		return this._ignoreEntities;
	}

	setIgnoreEntities(entities: Entity[]) {
		this._ignoreEntities = entities;
		return this;
	}

	isIgnoringEntity(entity: Entity): boolean {
		return this._ignoreEntities.some((e) => e?.id === entity?.id);
	}

	clearIgnoreEntities() {
		this._ignoreEntities = [];
		return this;
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
}
