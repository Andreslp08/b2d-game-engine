import { GameObject } from "engine/common/entities/game-object";
import { DrawDebugLine } from "engine/debug/components/draw-line";
import { Cameras } from "engine/graphics/cameras/camera-manager";
import { OrthographicCamera } from "engine/graphics/cameras/orthographic-camera";
import { MouseManager } from "engine/input/mouse-manager";
import { MathUtil } from "engine/math/math-util";
import Vector2 from "engine/math/vector2";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { ScriptComponent } from "engine/scripts/script-component";
import { Loot, LootType } from "./loot";

export class AimingController extends ScriptComponent {
	private _isAiming = false;
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
		const loot = this.entity.getComponent(Loot);
		if (!loot) return;
		const currentSlot = loot.getCurrentSlot();
		const dynamicBody = this.gameObject.getComponent(DynamicBody);
		if (!dynamicBody) return;

		this._isAiming = !dynamicBody.isOnGround
			? false
			: !!(currentSlot?.item && currentSlot.item.type === LootType.WEAPON);
		MouseManager.setCursorInputEnabled(this._isAiming);

		const mousePos = MouseManager.getRelativePosition();
		const mouseWorldPos = Cameras.currentCamera
			? (Cameras.currentCamera as OrthographicCamera).getWorldPositionFromScreenPosition(
					mousePos,
				)
			: new Vector2(0, 0);
		const mouseDirection = mouseWorldPos
			.clone()
			.substract(this.gameObject.transform.position)
			.normalize();

		this._radAngle = Math.atan2(mouseDirection.y, mouseDirection.x);

		if (this._isAiming) {
			if (mouseDirection.x < -0.24) {
				this._aimingDirection.x = -1;
			} else if (mouseDirection.x > 0.24) {
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

		const mousePos = MouseManager.getRelativePosition();
		const mouseWorldPos = (
			Cameras.currentCamera as OrthographicCamera
		).getWorldPositionFromScreenPosition(mousePos);
		if (!mouseWorldPos) return;

		this.debugAimingLine.start = transform.position.clone();
		this.debugAimingLine.end = mouseWorldPos.clone();
	}

	isAiming() {
		return this._isAiming;
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
