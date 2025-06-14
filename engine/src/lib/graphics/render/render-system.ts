import { Transform } from "../../common/components/transform";
import { System } from "../../ecs/system";
import { Scene } from "../scenes/scene";
import { Sprite } from "../sprites/components/sprite";
import { SpriteRenderer } from "./sprite-renderer";
import { TransformRenderer } from "./transform-renderer";
import { ColliderRenderer } from "./collider-renderer";
import {
	BackgroundCameras,
	DebugCameras,
	EffectsCameras,
	ForegroundCameras,
	UICameras,
	WorldCameras,
} from "../cameras/camera-managers";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";
import { Camera } from "../cameras/camera";
import { Entity } from "../../ecs/entity";
import { Collider } from "../../physics/components/collider";
import { UIRenderer } from "./ui-renderer";
import { SpriteAnimation } from "../sprites/components/sprite-animation";

export class RenderSystem extends System {
	constructor(scene: Scene) {
		super(scene);
		this.setName("RenderSystem");
	}
	update(deltaTime: number): void {}
	fixedUpdate(deltaTime: number): void {}

	fadeCameraHandler(context: CanvasRenderingContext2D, camera: Camera) {
		const fade = camera.isFade;
		const alpha = camera.fadeAlpha;
		const color = camera.fadeColor;
		if (!fade) return;
		context.save();
		context.globalAlpha = alpha;
		context.fillStyle = color;
		const sizeX = context.canvas.width;
		const sizeY = context.canvas.height;
		const position = camera.getPosition();
		context.fillRect(position.x - sizeX / 2, position.y - sizeY / 2, sizeX, sizeY);
		context.globalAlpha = 1;
		context.restore();
	}

	renderLayerEntities = (
		renderingContext: CanvasRenderingContext2D,
		entities: Entity[],
		layer: RenderLayerTypes
	) => {
		const worldEntities = entities.filter((entity) => entity.renderLayer === layer);
		for (const entity of worldEntities) {
			const spriteComponents = entity.getComponents(Sprite);
			const spriteAnimations = entity.getComponents(SpriteAnimation);
			const allSprites = [...spriteComponents, ...spriteAnimations];
			const colliderComponents = entity.getComponents(Collider);
			const transformComponents = entity.getComponents(Transform);
			allSprites.forEach((_) => {
				const render = new SpriteRenderer(entity);
				render.render(renderingContext);
			});
			transformComponents.forEach((_) => {
				const render = new TransformRenderer(entity);
				render.render(renderingContext);
			});
			colliderComponents.forEach((_) => {
				const render = new ColliderRenderer(entity);
				render.render(renderingContext);
			});
			const uiRenderer = new UIRenderer(entity);
			uiRenderer.render(renderingContext);
		}
	};

	render(renderingContext: CanvasRenderingContext2D): void {
		const entities = this.getScene().getEntitiesAsArray();
		const scene = this.getScene();
		if(!scene) return;

		renderingContext.save();
		const filters = scene.getRenderFilters();
		if(filters) renderingContext.filter = filters;
		// BACKGROUND
		if (BackgroundCameras.currentCamera) {
			renderingContext.save();
			const filters = BackgroundCameras.currentCamera.getRenderFilters();
			if (filters) renderingContext.filter = filters;
			BackgroundCameras.currentCamera.render(renderingContext);
			this.renderLayerEntities(renderingContext, entities, RenderLayerTypes.Background);
			this.fadeCameraHandler(renderingContext, BackgroundCameras.currentCamera);
			renderingContext.restore();
		}
		//WORLD
		if (WorldCameras.currentCamera) {
			renderingContext.save();
			const filters = WorldCameras.currentCamera.getRenderFilters();
			if (filters) renderingContext.filter = filters;
			WorldCameras.currentCamera.render(renderingContext);
			this.renderLayerEntities(renderingContext, entities, RenderLayerTypes.World);
			this.fadeCameraHandler(renderingContext, WorldCameras.currentCamera);
			renderingContext.restore();
		}
		//FOREGROUND
		if (ForegroundCameras.currentCamera) {
			renderingContext.save();
			const filters = ForegroundCameras.currentCamera.getRenderFilters();
			if (filters) renderingContext.filter = filters;
			ForegroundCameras.currentCamera.render(renderingContext);
			this.renderLayerEntities(renderingContext, entities, RenderLayerTypes.Foreground);
			this.fadeCameraHandler(renderingContext, ForegroundCameras.currentCamera);
			renderingContext.restore();
		}
		// //EFFECTS
		if (EffectsCameras.currentCamera) {
			renderingContext.save();
			EffectsCameras.currentCamera.render(renderingContext);
			this.renderLayerEntities(renderingContext, entities, RenderLayerTypes.Effects);
			this.fadeCameraHandler(renderingContext, EffectsCameras.currentCamera);
			const filters = EffectsCameras.currentCamera.getRenderFilters();
			if (filters) renderingContext.filter = filters;
			renderingContext.restore();
		}

		//UI
		if (UICameras.currentCamera) {
			renderingContext.save();
			const filters = UICameras.currentCamera.getRenderFilters();
			if (filters) renderingContext.filter = filters;
			UICameras.currentCamera.render(renderingContext);
			this.renderLayerEntities(renderingContext, entities, RenderLayerTypes.UI);
			this.fadeCameraHandler(renderingContext, UICameras.currentCamera);
			renderingContext.restore();
		}
		//DEBUG
		if (DebugCameras.currentCamera) {
			renderingContext.save();
			const filters = DebugCameras.currentCamera.getRenderFilters();
			if (filters) renderingContext.filter = filters;
			DebugCameras.currentCamera.render(renderingContext);
			this.renderLayerEntities(renderingContext, entities, RenderLayerTypes.Debug);
			this.fadeCameraHandler(renderingContext, DebugCameras.currentCamera);
			renderingContext.restore();
		}
		renderingContext.restore();
	}
}
