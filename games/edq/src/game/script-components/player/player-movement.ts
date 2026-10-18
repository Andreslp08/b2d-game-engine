import { Component } from "@b2d-engine/core/ecs/component";
import { PhysicalKey } from "@b2d-engine/core/input/keyboard-manager";

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
	inputCodes = {
		up: PhysicalKey.W,
		down: PhysicalKey.S,
		left: PhysicalKey.A,
		right: PhysicalKey.D,
		horizontalDash: PhysicalKey.Q,
	};
	jumpStartY: number | null = null;
	maxJumpHeight: number = 150;
	hasAppliedJumpForce: boolean = false;
}
