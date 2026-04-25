/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component } from "engine/ecs/component";

export class BasicMovement extends Component {
	isJumping: boolean = false;
	forceX: number = 100;
	forceY: number = 100;
	direction: { x: 1 | 0 | -1; y: 1 | 0 | -1 } = { x: 1, y: 0 };
	inputKeys = { up: "w", down: "s", left: "a", right: "d" };
	jumpStartY: number | null = null;
	maxJumpHeight: number = 150;
	hasAppliedJumpForce: boolean = false;
}
