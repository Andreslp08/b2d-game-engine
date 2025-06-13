import { Component } from "../../ecs/component";
import Vector2 from "../../math/vector2";
import { GameObject } from "../../common/entities/game-object";
import { BodyType } from "../enum/body-type";

export class DynamicBody extends Component {
	private _bodyType: BodyType = BodyType.Dynamic;
	acceleration: Vector2;
	velocity: Vector2;
	mass: number;
	forces: Vector2[];
	gravity: number = 0;
	friction: number;
	dragScale: number;
	bounciness: Vector2 = new Vector2(0.4, 0.4);
	gameObject: GameObject;
	isOnGround: boolean = false;
	isMoving: boolean = false;
	movement: Vector2 = new Vector2(0, 0);
	private _lastDirection: { x: 1 | -1; y: 1 | -1 } = { x: 1, y: 1 };

	constructor(object: GameObject) {
		super();
		this.acceleration = new Vector2(0, 0);
		this.velocity = new Vector2(0, 0);
		this.forces = [];
		this.mass = 10;
		this.gravity = 100;
		this.friction = 300;
		this.dragScale = 100;
		this.gameObject = object;
		this.setEntity(object);
	}

	addForce(force: Vector2): void {
		this.forces.push(force);
	}

	applyGravity(gravity: number): void {
		const gravityForce = new Vector2(0, gravity * this.mass);
		this.addForce(gravityForce);
	}

	get bodyType(): BodyType {
		return this._bodyType;
	}

	get direction(): { x: 1 | -1; y: 1 | -1 } {
		return this._lastDirection;
	}

	updateDirection(): void {
	if (this.velocity.x > 0) this._lastDirection.x = 1;
	else if (this.velocity.x < 0) this._lastDirection.x = -1;

	if (this.velocity.y > 0) this._lastDirection.y = 1;
	else if (this.velocity.y < 0) this._lastDirection.y = -1;
}
}
