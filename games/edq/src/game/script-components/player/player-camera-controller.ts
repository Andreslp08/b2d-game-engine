import { ScriptComponent } from "engine/scripts/script-component";
import { Cameras } from "engine/graphics/cameras/camera-manager";
import { MathUtil } from "engine/math/math-util";
import { GameObject } from "engine/common/entities/game-object";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { Time } from "engine/common/interfaces/time";
import Vector2 from "engine/math/vector2";
import { OrthographicCamera } from "engine/graphics/cameras/orthographic-camera";

export class PlayerCameraController extends ScriptComponent {

	playerCamera: OrthographicCamera = null;
	initialCameraPosition: Vector2 = null;
	enabled = true;
	lockAxis = {
		x: false,
		y: false
	}
	verticalLookAheadDistance = 1;
	airborneVerticalDeadZone = 0.5;
	private verticalLookAhead = 0;

	createCamera(): void {
		this.playerCamera = new OrthographicCamera( this.initialCameraPosition, this.entity.getScene());
		this.playerCamera.tags.add("player-camera");
		Cameras.setCurrentCamera(this.playerCamera);
	}
	onFixedUpdate(): void {
		if(!this.initialCameraPosition) return;
		if(!this.enabled) return;
		const camera = this.playerCamera;
		if(!camera) return;
		if(Cameras.currentCamera !== camera) return;
		const targetGameObject = this.entity as GameObject;
		if(!camera || !targetGameObject) throw new Error("Camera or target game object not found");
		const dynamicBody = this.entity.getComponent(DynamicBody);
		const cameraFOV = camera.getFieldOfView();
		const isAirborne = !!dynamicBody && !dynamicBody.isOnGround;
		const followAmount = MathUtil.clamp(20 * Time.fixedDeltaTime, 0, 1);
		const velocityY = dynamicBody?.velocity.y ?? 0;
		const targetLookAhead = !isAirborne
			? 0
			: velocityY < 0
				? -this.verticalLookAheadDistance
				: velocityY > 0
					? this.verticalLookAheadDistance
					: this.verticalLookAhead;
		this.verticalLookAhead = MathUtil.lerp(
			this.verticalLookAhead,
			targetLookAhead,
			followAmount,
		);
		const thresholdY = isAirborne
			? this.airborneVerticalDeadZone
			: targetGameObject.transform.size.y / 2 / cameraFOV;

		const targetPos = targetGameObject.transform.position.clone();
		const cameraPos = camera.getPosition().clone();

		const dy = targetPos.y + this.verticalLookAhead - cameraPos.y;

		if (Math.abs(dy) > thresholdY) {
			cameraPos.y = targetPos.y + this.verticalLookAhead - Math.sign(dy) * thresholdY;
		}

		const finalCameraPosition = new Vector2(
			MathUtil.lerp(camera.getPosition().x, targetPos.x, followAmount),
			MathUtil.lerp(camera.getPosition().y, cameraPos.y, followAmount),
		);
		if(!this.lockAxis.x && !this.lockAxis.y){
			camera.setPosition(finalCameraPosition);
		}
		else if (this.lockAxis.x) {
			camera.setYPosition(finalCameraPosition.y);
		}
		else if (this.lockAxis.y) {
			camera.setXPosition(finalCameraPosition.x);
		}
	}
}
