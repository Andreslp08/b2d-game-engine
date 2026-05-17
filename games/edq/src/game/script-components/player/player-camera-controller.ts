import { ScriptComponent } from "engine/scripts/script-component";
import { Cameras } from "engine/graphics/cameras/camera-manager";
import { MathUtil } from "engine/math/math-util";
import { GameObject } from "engine/common/entities/game-object";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { Time } from "engine/common/interfaces/time";
import Vector2 from "engine/math/vector2";

export class PlayerCameraController extends ScriptComponent {
	onFixedUpdate(): void {
		const camera = Cameras.currentCamera;
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

		const scene = this.entity.getScene();
		const leftBound = scene.getEntityByTag<GameObject>("main-left-bound");
		const rightBound = scene.getEntityByTag<GameObject>("main-right-bound");

		const leftDistance = MathUtil.getDistanceBetweenEntities(this.entity, leftBound);
		const rightDistance = MathUtil.getDistanceBetweenEntities(this.entity, rightBound);
		const db = this.entity.getComponent(DynamicBody);
		const finalCameraPosition = db?.isMoving ? newCameraPos : targetPos;
		if (leftDistance > 6.8 && rightDistance > 6.8) {
			camera.setPosition(finalCameraPosition);
		} else {
			camera.setYPosition(finalCameraPosition.y);
		}
	}
}
