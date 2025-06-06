import { Transform } from "../../common/components/transform";
import { System } from "../../ecs/system";
import { Scene } from "../scenes/scene";
import { Sprite } from "../sprites/components/sprite";
import { SpriteRenderer } from "./sprite-renderer";
import { TransformRenderer } from "./transform-renderer";
import { ColliderRenderer } from "./collider-renderer";
import { Screen } from "../screen/screen";
import { PIXELS_PER_METER } from "../../common/constants";
import {
	BackgroundCameras,
	DebugCameras,
	EffectsCameras,
	ForegroundCameras,
	UICameras,
	WorldCameras,
} from "../cameras/camera-managers";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";

export class RenderSystem extends System {
	constructor(scene: Scene) {
		super(scene);
		this.setName("RenderSystem");
	}
	update(deltaTime: number): void {}

	applyMeterScaling(context: CanvasRenderingContext2D) {
		const screen = Screen.getInstance();
		const baseRes = screen.baseResolution;
		const canvasRes = screen.getResolution();

		const scaleX = canvasRes.x / baseRes.x;
		const scaleY = canvasRes.y / baseRes.y;
		const uniformScale = Math.min(scaleX, scaleY);

		const totalScale = PIXELS_PER_METER * uniformScale;

		context.scale(totalScale, totalScale);
		context.imageSmoothingEnabled = false;
	}

	render(renderingContext: CanvasRenderingContext2D): void {
		const entities = this.getScene().getEntitiesAsArray();

		const renderLayerEntities = (layer: RenderLayerTypes) => {
			const worldEntities = entities.filter((entity) => entity.renderLayer === layer);
			for (const entity of worldEntities) {
				const spriteComponents = entity.getComponents(Sprite);
				const colliderComponents = entity.getComponents(Transform);
				const transformComponents = entity.getComponents(Transform);
				spriteComponents.forEach((_) => {
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
			}
		};

		renderingContext.save();
		this.applyMeterScaling(renderingContext);
			// // filter with grayscale an blur
			// renderingContext.filter = "grayscale(1) blur(20px)";	
			// renderingContext.globalAlpha = 0.2;
			// // set blend to multiply 
			// renderingContext.globalCompositeOperation = "multiply";
		// BACKGROUND
		if (BackgroundCameras.currentCamera) {
			BackgroundCameras.currentCamera.render(renderingContext);
			renderLayerEntities(RenderLayerTypes.Background);
		}
		renderingContext.restore();
		renderingContext.save();
		this.applyMeterScaling(renderingContext);
		//WORLD
		if (WorldCameras.currentCamera) {
			WorldCameras.currentCamera.render(renderingContext);
			renderLayerEntities(RenderLayerTypes.World);
		}
		renderingContext.restore();
		renderingContext.save();
		this.applyMeterScaling(renderingContext);

		//FOREGROUND
		if (ForegroundCameras.currentCamera) {
			ForegroundCameras.currentCamera.render(renderingContext);
			renderLayerEntities(RenderLayerTypes.Foreground);
		}
		renderingContext.restore();
		renderingContext.save();
		this.applyMeterScaling(renderingContext);
		//EFFECTS
		if (EffectsCameras.currentCamera) {
			EffectsCameras.currentCamera.render(renderingContext);
			renderLayerEntities(RenderLayerTypes.Effects);
		}
		renderingContext.restore();

		renderingContext.save();
		//UI
		if (UICameras.currentCamera) {
			UICameras.currentCamera.render(renderingContext);
			renderLayerEntities(RenderLayerTypes.UI);
		}
		renderingContext.restore();
		renderingContext.save();
		//DEBUG
		if (DebugCameras.currentCamera) {
			DebugCameras.currentCamera.render(renderingContext);
			renderLayerEntities(RenderLayerTypes.Debug);
		}
		renderingContext.restore();
	}
}
