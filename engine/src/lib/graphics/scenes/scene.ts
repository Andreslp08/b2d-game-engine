import { WorldCamera } from "../cameras/camera";
import { ECS } from "../../ecs/ecs";
import { WorldCameras } from "../cameras/camera-managers";
import { SpriteSystem } from "../sprites/system/sprites-system";
import { PhysicsSystem } from "../../physics/system/physics-system";
import { CollisionSystem } from "../../physics/system/collision-system";
import { CollisionResolutionSystem } from "../../physics/system/collision-resolution-system";
import { ScriptSystem } from "../../scripts/script-system";
import { DebugSystem } from "../../debug/debug-system";

export class Scene extends ECS {
	constructor() {
		super();
		this.addSystem(new SpriteSystem());
		this.addSystem(new PhysicsSystem());
		this.addSystem(new CollisionSystem());
		this.addSystem(new CollisionResolutionSystem());
		this.addSystem(new ScriptSystem());
		this.addSystem(new DebugSystem());
	}

	get camera(): WorldCamera {
		return WorldCameras.currentCamera as WorldCamera;
	}

	setCamera(camera: WorldCamera) {
		// if not has camera add an then set it
		const hasCamera = WorldCameras.hasCamera(camera);
		if (!hasCamera) {
			WorldCameras.addCamera(camera);
			WorldCameras.setCurrentCamera(camera);
		} else {
			WorldCameras.setCurrentCamera(camera);
		}
	}

	getCurrentCamera() {
		return WorldCameras.currentCamera;
	}

	getCameras() {
		return WorldCameras.cameras;
	}

	removeCamera(camera: WorldCamera) {
		WorldCameras.removeCamera(camera);
	}

	removeAllCameras() {
		WorldCameras.removeAllCameras();
	}
}
