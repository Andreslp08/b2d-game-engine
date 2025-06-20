import { Transform } from "../common/components/transform";
import { VIEWPORT_WIDTH_IN_METERS } from "../common/constants";
import { Entity } from "../ecs/entity";
import { System } from "../ecs/system";
import { Camera } from "../graphics/cameras/camera";
import {
	BackgroundCameras,
	DebugCameras,
	EffectsCameras,
	ForegroundCameras,
	UICameras,
	WorldCameras,
} from "../graphics/cameras/camera-managers";
import { RenderLayerTypes } from "../graphics/enum/render-layer-types.enum";
import { MathUtil } from "../math/math-util";
import Vector2 from "../math/vector2";
import { Culling, CullingConfigComponent } from "./culling";
import { CullingType } from "./enum/culling-type";

export class CullingSystem extends System {
	getCamera(entity: Entity): Camera {
		switch (entity.renderLayer) {
			case RenderLayerTypes.Background:
				return BackgroundCameras.currentCamera;
			case RenderLayerTypes.World:
				return WorldCameras.currentCamera;
			case RenderLayerTypes.Foreground:
				return ForegroundCameras.currentCamera;
			case RenderLayerTypes.Effects:
				return EffectsCameras.currentCamera;
			case RenderLayerTypes.Debug:
				return DebugCameras.currentCamera;
			case RenderLayerTypes.UI:
				return UICameras.currentCamera;
			default:
				return null;
		}
	}

	IsInViewport = (
		entity: Entity,
		xRadius: number,
		yRadius: number,
		strictFrustrum: boolean
	): boolean => {
		const currentCamera = this.getCamera(entity);
		if (!currentCamera) return false;
		const xDistance = Vector2.distance(
			new Vector2(currentCamera.getPosition().x, 0),
			new Vector2(entity.getComponent(Transform).position.x, 0)
		);
		const yDistance = Vector2.distance(
			new Vector2(0, currentCamera.getPosition().y),
			new Vector2(0, entity.getComponent(Transform).position.y)
		);
		return xDistance <= xRadius && yDistance <= yRadius;
	};

	update(): void {
		const scene = this.getScene();
		if (!scene) return;
		const entities = scene.getEntitiesAsArray();
		if (!entities || entities?.length === 0) return;

		for (const entity of entities) {
			const cullingSettings = entity.getComponent(CullingConfigComponent);
			if (!cullingSettings) continue;
			if (cullingSettings.cullingType === CullingType.NONE) {
				if (entity.hasComponent(Culling)) entity.deleteComponent(Culling);
				continue;
			}

			const transform = entity.getComponent(Transform);
			if (!transform) continue;
			const xRadius = cullingSettings.distanceRadius.x;
			const yRadius = cullingSettings.distanceRadius.y;
			const isStrict = cullingSettings.frustrumStrict;
			const isInView = this.IsInViewport(entity, xRadius, yRadius, isStrict);
			if (isInView) {
				if (entity.hasComponent(Culling)) entity.deleteComponent(Culling);
			} else {
				if (!entity.hasComponent(Culling)) entity.addComponent(new Culling());
			}
		}
	}
	fixedUpdate(): void {}
}
