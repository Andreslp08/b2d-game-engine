import { Component } from "../../ecs/component";
import Vector2 from "../../math/vector2";
import { GameObject } from "../../common/entities/game-object";
import { BodyType } from "../enum/body-type";

export class RigidBody extends Component {
	acceleration: Vector2;
	velocity: Vector2;
	mass: number;
	forces: Vector2[];
	gravity: number = 0;
	friction: number;
	dragScale: number;
	gameObject: GameObject;
	bodyType: BodyType = BodyType.Static; 
	isOnGround:boolean = false;
	isMoving:boolean = false;

	constructor(object: GameObject, bodyType: BodyType) {
		super();
		this.acceleration = new Vector2(0, 0);
		this.velocity = new Vector2(0, 0);
		this.forces = [];
		this.mass = 10;
		this.gravity = 100;
		this.friction = 300;
		this.dragScale = 100;
		this.gameObject = object;
		if (bodyType) this.bodyType = bodyType;
	}

	addForce(force: Vector2): void {
		this.forces.push(force);
	}

	applyGravity(gravity: number): void {
		const gravityForce = new Vector2(0, gravity * this.mass);
		this.addForce(gravityForce);
	}

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {}
}
