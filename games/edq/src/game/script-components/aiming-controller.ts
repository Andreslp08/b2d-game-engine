import { DynamicBody } from "engine/physics/components/dynamic-body";
import { ScriptComponent } from "engine/scripts/script-component";
import { Loot, LootType } from "./loot";
import { MathUtil } from "engine/math/math-util";
import { DrawDebugLine } from "engine/debug/components/draw-line";
import { GameObject } from "engine/common/entities/game-object";
import { MouseManager } from "engine/input/mouse-manager";
import Vector2 from "engine/math/vector2";
import { WorldCamera } from "engine/graphics/cameras/world-camera";
import { WorldCameras } from "engine/graphics/cameras/camera-managers";
import { DebugMode, DebugTypes } from "engine/debug/debug";

export class AimingController extends ScriptComponent {
	private _isAiming: boolean = false;
	private _radAngle: number = 0;
	private _aimingDirection: { x: 1 | -1; y: 1 | -1 } = { x: 1, y: 1 };
	private debugAngleX: DrawDebugLine;
	private debugAngleY: DrawDebugLine;
	private debugAimingLine: DrawDebugLine;
	private gameObject: GameObject;
	onStart(): void {
		// DebugMode.enabled = true;
		// DebugMode.check(DebugTypes.ALL);
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
		const currentSlot = loot?.getCurrentSlot();
		const dynamicBody = this.gameObject.getComponent(DynamicBody);
		if (!dynamicBody) return;

		this._isAiming = !dynamicBody.isOnGround ? false:
			loot && currentSlot && currentSlot?.item && currentSlot?.item?.type === LootType.WEAPON;
        if(this._isAiming){
            MouseManager.showCursor(true)
        }else{
            MouseManager.showCursor(false)
        }
		const mousePos = MouseManager.getPosition(); // ← posición en PANTALLA
		const mouseWorldPos = WorldCameras.currentCamera
			? (WorldCameras.currentCamera as WorldCamera).getWorldPositionFromScreenPosition(
					mousePos
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
		const mousePos = MouseManager.getPosition(); // ← posición en PANTALLA
		const mouseWorldPos = (
			WorldCameras.currentCamera as WorldCamera
		).getWorldPositionFromScreenPosition(mousePos);
		if (!mouseWorldPos) {
			return;
		}
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
