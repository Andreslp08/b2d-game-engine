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

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
		const entities = this.getScene().getEntitiesAsArray();

		const renderLayerEntities = (layer: RenderLayerTypes) => {
			const worldEntities = entities.filter((entity) => entity.renderLayer === layer);
			for (const entity of worldEntities) {
				const spriteComponents = entity.getComponents(Sprite);
				const colliderComponents = entity.getComponents(Transform);
				const transformComponents = entity.getComponents(Transform);
				spriteComponents.forEach((_) => {
					const render = new SpriteRenderer(entity);
					render.render(canvas, context);
				});
				transformComponents.forEach((_) => {
					const render = new TransformRenderer(entity);
					render.render(canvas, context);
				});
				colliderComponents.forEach((_) => {
					const render = new ColliderRenderer(entity);
					render.render(canvas, context);
				});
			}
		};

		context.save();
		this.applyMeterScaling(context);
			// filter with grayscale an blur
			context.filter = "grayscale(1) blur(20px)";	
			context.globalAlpha = 0.2;
			// set blend to multiply 
			context.globalCompositeOperation = "multiply";
		// BACKGROUND
		if (BackgroundCameras.currentCamera) {
			BackgroundCameras.currentCamera.render(canvas, context);
			renderLayerEntities(RenderLayerTypes.Background);
		}
		context.restore();
		context.save();
		this.applyMeterScaling(context);
		//WORLD
		if (WorldCameras.currentCamera) {
			WorldCameras.currentCamera.render(canvas, context);
			renderLayerEntities(RenderLayerTypes.World);
		}
		context.restore();
		context.save();
		this.applyMeterScaling(context);

		//FOREGROUND
		if (ForegroundCameras.currentCamera) {
			ForegroundCameras.currentCamera.render(canvas, context);
			renderLayerEntities(RenderLayerTypes.Foreground);
		}
		context.restore();
		context.save();
		this.applyMeterScaling(context);
		//EFFECTS
		if (EffectsCameras.currentCamera) {
			EffectsCameras.currentCamera.render(canvas, context);
			renderLayerEntities(RenderLayerTypes.Effects);
		}
		context.restore();

		context.save();
		//UI
		if (UICameras.currentCamera) {
			UICameras.currentCamera.render(canvas, context);
			renderLayerEntities(RenderLayerTypes.UI);
		}
		context.restore();
		context.save();
		//DEBUG
		if (DebugCameras.currentCamera) {
			DebugCameras.currentCamera.render(canvas, context);
			renderLayerEntities(RenderLayerTypes.Debug);
		}
		context.restore();
	}
}
