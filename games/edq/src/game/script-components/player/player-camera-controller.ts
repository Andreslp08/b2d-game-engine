import { ScriptComponent } from "engine/scripts/script-component";
import { Cameras } from "engine/graphics/cameras/camera-manager";
import { MathUtil } from "engine/math/math-util";
import { GameObject } from "engine/common/entities/game-object";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { Time } from "engine/common/interfaces/time";
import Vector2 from "engine/math/vector2";
import { OrthographicCamera } from "engine/graphics/cameras/orthographic-camera";

export class PlayerCameraController extends ScriptComponent {

	playerCamera: OrthographicCamera;
	enabled = true;
	lockAxis = {
		x: false,
		y: false
	}

	onStart(): void {
		this.createCamera();
	}
	createCamera(): void {
		this.playerCamera = new OrthographicCamera(new Vector2(0, 0), this.entity.getScene());
		Cameras.setCurrentCamera(this.playerCamera);
	}
	onFixedUpdate(): void {
		if(!this.enabled) return;
		const camera = this.playerCamera;
		if(!camera) return;
		if(Cameras.currentCamera !== camera) return;
		const targetGameObject = this.entity as GameObject;
		if(!camera || !targetGameObject) throw new Error("Camera or target game object not found");
		const cameraFOV = camera.getFieldOfView();
		const thresholdY = targetGameObject.transform.size.y / 2 / cameraFOV;

		const targetPos = targetGameObject.transform.position.clone();
		const cameraPos = camera.getPosition().clone();

		const dy = targetPos.y - cameraPos.y;

		if (Math.abs(dy) > thresholdY) {
			cameraPos.y = targetPos.y - Math.sign(dy) * thresholdY;
		}

		const newCameraPos = new Vector2(
			MathUtil.lerp(camera.getPosition().x, cameraPos.x, 1),
			MathUtil.lerp(camera.getPosition().y, cameraPos.y, 20 * Time.deltaTime),
		);


		const db = this.entity.getComponent(DynamicBody);
		const finalCameraPosition = db?.isMoving ? newCameraPos : targetPos;
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
