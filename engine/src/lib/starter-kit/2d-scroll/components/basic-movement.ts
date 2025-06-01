import { Component } from "../../../ecs/component";
import Vector2 from "../../../math/vector2";

export class BasicMovement extends Component {
	isJumping: boolean = false;
	isMoving: boolean = false;
	isRunning: boolean = false;
	forceX: number = 100;
	forceY: number = 100;
	direction: { x: 1 | 0 | -1; y: 1 | 0 | -1 } = { x: 0, y: 0 };
	inputKeys = { up: "w", down: "s", left: "a", right: "d" };
	jumpStartY: number | null = null;
	maxJumpHeight: number = 150;
	hasAppliedJumpForce: boolean = false;

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {}
}
