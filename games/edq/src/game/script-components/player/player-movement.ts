/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component } from "engine/ecs/component";

export class PlayerMovement extends Component {
	isJumping: boolean = false;
	isDashing: boolean = false;
	forceX: number = 100;
	forceY: number = 100;
	dashForceX: number = 10000;
	dashMaxSpeedX: number = 16;
	dashFrictionMultiplier: number = 0.08;
	dashDragMultiplier: number = 0.12;
	dashCooldown: number = 0.5;
	dashDuration: number = 0.16;
	direction: { x: 1 | 0 | -1; y: 1 | 0 | -1 } = { x: 1, y: 0 };
	inputKeys = { up: "w", down: "s", left: "a", right: "d", horizontalDash: "q" };
	jumpStartY: number | null = null;
	maxJumpHeight: number = 150;
	hasAppliedJumpForce: boolean = false;
}
