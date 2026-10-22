import { GameObject } from "@b2d-engine/core/common/entities/game-object";
import { DrawDebugLine } from "@b2d-engine/core/debug/components/draw-line";
import { Cameras } from "@b2d-engine/core/graphics/cameras/camera-manager";
import { OrthographicCamera } from "@b2d-engine/core/graphics/cameras/orthographic-camera";
import { MouseManager } from "@b2d-engine/core/input/mouse-manager";
import { GamepadManager } from "@b2d-engine/core/input/gamepad-manager";
import { MathUtil } from "@b2d-engine/core/math/math-util";
import Vector2 from "@b2d-engine/core/math/vector2";
import { DynamicBody } from "@b2d-engine/core/physics/components/dynamic-body";
import { ScriptComponent } from "@b2d-engine/core/scripts/script-component";
import { PlayerMovement } from "./player-movement";
import { InventoryComponent } from "../../items/components/inventory-component";
import { EquipmentComponent } from "../../items/components/equipment-component";
import { PlayerInputController, PlayerInputPermission } from "./player-input-controller";
import { GameplayAction, InputManagerInstance } from "../../input/input-manager";

export class AimingController extends ScriptComponent {
	private _isAiming = false;
	private _isUsingGamepadAim = false;
	private _aimDirection = Vector2.RIGHT.clone();
	private _radAngle = 0;
	private _aimingDirection: { x: 1 | -1; y: 1 | -1 } = { x: 1, y: 1 };
	private debugAngleX: DrawDebugLine;
	private debugAngleY: DrawDebugLine;
	private debugAimingLine: DrawDebugLine;
	private gameObject: GameObject;

	onStart(): void {
		this.gameObject = this.entity as GameObject;
		this.debugAngleX = new DrawDebugLine(new Vector2(0, 0), new Vector2(0, 0), "#0f0");
		this.debugAngleY = new DrawDebugLine(new Vector2(0, 0), new Vector2(0, 0), "#f00");
		this.debugAimingLine = new DrawDebugLine(new Vector2(0, 0), new Vector2(0, 0), "#00f");
		this.gameObject.addComponent(this.debugAngleX);
		this.gameObject.addComponent(this.debugAngleY);
		this.gameObject.addComponent(this.debugAimingLine);
	}

	onFixedUpdate(): void {
		if (!this.gameObject) return;
		const input = this.gameObject.getComponent(PlayerInputController);
		if (!input?.isEnabled(PlayerInputPermission.WeaponUse)) {
			this._isAiming = false;
			this._isUsingGamepadAim = false;
			MouseManager.setCursorInputEnabled(false);
			return;
		}
		const equipment = this.entity.getComponent(EquipmentComponent);
		const inventory = this.entity.getComponent(InventoryComponent);
		const equippedEntryId = equipment?.getEquippedReferenceId();
		const equippedEntry = equippedEntryId && inventory
			? inventory.inventory.get(equippedEntryId)
			: undefined;
		const equippedDefinition = equippedEntry && inventory
			? inventory.inventory.getDefinition(equippedEntry.definitionId)
			: undefined;
		const dynamicBody = this.gameObject.getComponent(DynamicBody);
		if (!dynamicBody) return;
		const movement = this.gameObject.getComponent(PlayerMovement);
		const isDashing = movement ? movement.isDashing : false;

		const hasEquippedWeapon = equippedDefinition?.type === "weapon";
		this._isAiming = !dynamicBody.isOnGround || isDashing
			? false
			: !!inventory && !!equipment && hasEquippedWeapon;
		const gamepadDirection = InputManagerInstance.getVector2(GameplayAction.Aim);
		const hasGamepad = GamepadManager.getGamepads().length > 0;
		const isGamepadAiming = hasGamepad && gamepadDirection.getMagnitude() > 0;
		this._isUsingGamepadAim = hasGamepad;
		MouseManager.setCursorInputEnabled(this._isAiming && !hasGamepad);

		let aimDirection: Vector2;
		if (isGamepadAiming) {
			aimDirection = gamepadDirection.normalize();
		} else if (hasGamepad) {
			const moveDirection = InputManagerInstance.getVector2(GameplayAction.Move);
			const directionX = moveDirection.x === 0 ? dynamicBody.direction.x : moveDirection.x;
			aimDirection = new Vector2(directionX < 0 ? -1 : 1, 0);
		} else {
			const mousePos = MouseManager.getRelativePosition();
			const mouseWorldPos = Cameras.currentCamera
				? (Cameras.currentCamera as OrthographicCamera).getWorldPositionFromScreenPosition(
						mousePos,
					)
				: null;
			if (!mouseWorldPos) return;

			aimDirection = mouseWorldPos
				.clone()
				.substract(this.gameObject.transform.position)
				.normalize();
		}

		this._radAngle = Math.atan2(aimDirection.y, aimDirection.x);
		this._aimDirection = aimDirection;

		if (this._isAiming) {
			if (aimDirection.x < -0.24) {
				this._aimingDirection.x = -1;
			} else if (aimDirection.x > 0.24) {
				this._aimingDirection.x = 1;
			}
		} else {
			this._aimingDirection.x = dynamicBody.direction.x;
		}
	}

	onLateUpdate(): void {
		this.debugAngle();
	}

	debugAngle() {
		const { transform } = this.gameObject;
		this.debugAngleY.start = transform.position.clone();
		this.debugAngleY.end = transform.position.clone().add(new Vector2(0, -1));
		this.debugAngleX.start = transform.position.clone();
		this.debugAngleX.end = transform.position.clone().add(new Vector2(1, 0));

		this.debugAimingLine.start = transform.position.clone();
		this.debugAimingLine.end = transform.position.clone().add(this._aimDirection);
	}

	isAiming() {
		return this._isAiming;
	}

	isUsingGamepadAim() {
		return this._isUsingGamepadAim;
	}

	getAimDirection(): Vector2 {
		return this._aimDirection.clone();
	}

	setAimingDirectionX(direction: 1 | -1): void {
		this._aimingDirection.x = direction;
	}

	getAngleInRads() {
		return this._radAngle;
	}

	getAngleInDeg() {
		return MathUtil.radToDeg(this._radAngle);
	}

	getAimingDirection(): { x: 1 | -1; y: 1 | -1 } {
		return this._aimingDirection;
	}
}
