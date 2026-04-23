import { Transform } from "../common/components/transform";
import { Entity } from "../ecs/entity";
import { System } from "../ecs/system";
import { OrthographicCamera } from "../graphics/cameras/orthographic-camera";
import { Parallax } from "../graphics/components/parallax";
import { RenderLayer } from "../graphics/render/render-layer";
import { RenderLayers } from "../graphics/render/render-layers";
import Vector2 from "../math/vector2";
import { Culling, CullingConfigComponent } from "./culling";
import { CullingType } from "./enum/culling-type";

export class CullingSystem extends System {
	constructor(scene) {
		super(scene);


	}
	getLayer(entity: Entity): RenderLayer {
		return RenderLayers.getLayer(entity.renderLayer);
	}

	getEffectiveCameraPosition(entity: Entity): Vector2 {
		const layer = this.getLayer(entity);
		if (!layer?.camera) return null;

		const cameraPosition = layer.camera.getPosition();
		if (layer.camera instanceof OrthographicCamera && layer.cameraSpace === "world") {
			const parallax = entity.getComponent(Parallax)?.getFactor() ?? layer.parallax;
			return new Vector2(
				cameraPosition.x * parallax.x,
				cameraPosition.y * parallax.y
			);
		}

		return cameraPosition;
	}

	IsInViewport = (
		entity: Entity,
		xRadius: number,
		yRadius: number,
		strictFrustrum: boolean
	): boolean => {
		const cameraPosition = this.getEffectiveCameraPosition(entity);
		if (!cameraPosition) return false;
		const xDistance = Vector2.distance(
			new Vector2(cameraPosition.x, 0),
			new Vector2(entity.getComponent(Transform).position.x, 0)
		);
		const yDistance = Vector2.distance(
			new Vector2(0, cameraPosition.y),
			new Vector2(0, entity.getComponent(Transform).position.y)
		);
		return xDistance <= xRadius && yDistance <= yRadius;
	};

	update(): void {
		
		const scene = this.getScene();
		
		if (!scene) return;
		const entities = scene.getEntitiesByComponents([Transform, CullingConfigComponent]);
		if (!entities || entities.length === 0) return;
		// const entities = scene.getEntities();
		// if (!entities || entities.size === 0) return;
		for (const entity of entities) {
			const cullingSettings = entity.getComponent(CullingConfigComponent);
			if(!cullingSettings) continue;
			if (cullingSettings.cullingType === CullingType.NONE) {
				if (entity.hasComponent(Culling)) entity.deleteallComponentsByClass(Culling);
				continue;
			}
			const xRadius = cullingSettings.distanceRadius.x;
			const yRadius = cullingSettings.distanceRadius.y;
			const isStrict = cullingSettings.frustrumStrict;
			const isInView = this.IsInViewport(entity, xRadius, yRadius, isStrict);
			if (isInView) {
				if (entity.hasComponent(Culling)) entity.deleteallComponentsByClass(Culling);
			} else {
				if (!entity.hasComponent(Culling)) entity.addComponent(new Culling());
			}
		}
	}
	fixedUpdate(): void {}
}
