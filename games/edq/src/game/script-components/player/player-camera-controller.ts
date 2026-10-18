import { ScriptComponent } from "@b2d-engine/core/scripts/script-component";
import { Cameras } from "@b2d-engine/core/graphics/cameras/camera-manager";
import { MathUtil } from "@b2d-engine/core/math/math-util";
import { GameObject } from "@b2d-engine/core/common/entities/game-object";
import { DynamicBody } from "@b2d-engine/core/physics/components/dynamic-body";
import { Time } from "@b2d-engine/core/common/interfaces/time";
import Vector2 from "@b2d-engine/core/math/vector2";
import { OrthographicCamera } from "@b2d-engine/core/graphics/cameras/orthographic-camera";
import {
	VIEWPORT_HEIGHT_IN_WORLD_UNITS,
	VIEWPORT_WIDTH_IN_WORLD_UNITS,
} from "@b2d-engine/core/common/constants";
import { GAME_FOV } from "../../config/constants";

type CameraBounds = {
	position: Vector2;
	size: Vector2;
};

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
	fieldOfView = GAME_FOV;
	private verticalLookAhead = 0;
	private bounds: CameraBounds | null = null;


	onStart(): void {
		if (!this.playerCamera) {
			const player = this.entity as GameObject;
			this.initialCameraPosition = player.transform.position.clone();
			this.createCamera();
		}
		this.snapToTarget();
	}
	createCamera(): void {
		this.playerCamera = new OrthographicCamera( this.initialCameraPosition, this.entity.getScene());
		this.playerCamera.setFieldOfView(this.fieldOfView);

		this.playerCamera.tags.add("player-camera");
		Cameras.setCurrentCamera(this.playerCamera);
	}

	setBounds(position: Vector2, size: Vector2): void {
		this.bounds = { position: position.clone(), size: size.clone() };
	}

	snapToTarget(): void {
		if (!this.playerCamera) return;
		const player = this.entity as GameObject;
		this.playerCamera.setPosition(this.constrainToBounds(player.transform.position.clone()));
	}

	private constrainToBounds(position: Vector2): Vector2 {
		if (!this.bounds || !this.playerCamera) return position;

		const fieldOfView = this.playerCamera.getFieldOfView();
		const halfViewportWidth = VIEWPORT_WIDTH_IN_WORLD_UNITS / fieldOfView / 2;
		const halfViewportHeight = VIEWPORT_HEIGHT_IN_WORLD_UNITS / fieldOfView / 2;
		const minX = this.bounds.position.x - this.bounds.size.x / 2 + halfViewportWidth;
		const maxX = this.bounds.position.x + this.bounds.size.x / 2 - halfViewportWidth;
		const minY = this.bounds.position.y - this.bounds.size.y / 2 + halfViewportHeight;
		const maxY = this.bounds.position.y + this.bounds.size.y / 2 - halfViewportHeight;

		return new Vector2(
			minX > maxX ? this.bounds.position.x : MathUtil.clamp(position.x, minX, maxX),
			minY > maxY ? this.bounds.position.y : MathUtil.clamp(position.y, minY, maxY),
		);
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

		const finalCameraPosition = this.constrainToBounds(new Vector2(
			MathUtil.lerp(camera.getPosition().x, targetPos.x, followAmount),
			MathUtil.lerp(camera.getPosition().y, cameraPos.y, followAmount),
		));
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
