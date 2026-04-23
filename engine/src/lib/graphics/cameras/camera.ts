import { Scene } from "../../scenes/scene";
import Vector2 from "../../math/vector2";

export abstract class Camera {
	protected _fieldOfView: number = 1;
	protected position: Vector2;
	scene: Scene;
	private _rotation: number = 0;

	constructor(initialPosition: Vector2, scene: Scene) {
		this.position = initialPosition;
		this.scene = scene;
	}

	public setPosition(vector2: Vector2): void {
		this.position = vector2;
	}
	public getPosition(): Vector2 {
		return this.position;
	}

	public getRawPosition(): Vector2 {
		return this.position;
	}

	public setXPosition(x: number): void {
		this.position.x = x;
	}

	public setYPosition(y: number): void {
		this.position.y = y;
	}

	setFieldOfView(fieldOfView: number): void {
		this._fieldOfView = fieldOfView;
	}

	getFieldOfView(): number {
		return this._fieldOfView;
	}

	setRotation(rotation: number): void {
		this._rotation = rotation;
	}

	getRotation(): number {
		return this._rotation;
	}

	abstract applyTransform(context: CanvasRenderingContext2D, parallax?: Vector2): void;
}
