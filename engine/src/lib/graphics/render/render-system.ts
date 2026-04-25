import { Transform } from "../../common/components/transform";
import { System } from "../../ecs/system";
import { Scene } from "../../scenes/scene";
import { Sprite } from "../sprites/components/sprite";
import { SpriteRenderer } from "./sprite-renderer";
import { TransformRenderer } from "./transform-renderer";
import { ColliderRenderer } from "./collider-renderer";
import { TriggerAreaRenderer } from "./trigger-area-renderer";
import { Entity } from "../../ecs/entity";
import { Collider } from "../../physics/components/collider";
import { TriggerArea } from "../../trigger-area/components/trigger-area";
import { UIRenderer } from "./ui-renderer";
import { SpriteAnimation } from "../sprites/components/sprite-animation";
import { CullingTarget } from "../../performance/enum/culling-type";
import { Culling } from "../../performance/culling";
import { DrawDebugLine } from "../../debug/components/draw-line";
import { DebugShapesRenderer } from "./debug-shapes-renderer";
import { ParticleEmitter } from "../../particle-system/component/particle-emitter";
import { ParticleRenderer } from "./particle-renderer";
import { Parallax } from "../components/parallax";
import { OrthographicCamera } from "../cameras/orthographic-camera";
import { RenderLayer } from "./render-layer";
import { RenderLayers } from "./render-layers";

export class RenderSystem extends System {
	private readonly warnedParallaxColliderEntities = new Set<string>();

	constructor(scene: Scene) {
		super(scene);
		this.setName("RenderSystem");
	}
	update(): void {}
	fixedUpdate(): void {}

	fadeLayerHandler(context: CanvasRenderingContext2D, layer: RenderLayer) {
		if (!layer.isFade) return;
		context.save();
		context.setTransform(1, 0, 0, 1, 0, 0);
		context.globalAlpha = layer.fadeAlpha;
		context.fillStyle = layer.fadeColor;
		const sizeX = context.canvas.width;
		const sizeY = context.canvas.height;
		context.fillRect(0, 0, sizeX, sizeY);
		context.globalAlpha = 1;
		context.restore();
	}

	private applyEntityParallax(
		renderingContext: CanvasRenderingContext2D,
		entity: Entity,
		layer: RenderLayer
	): void {
		const parallax = entity.getComponent(Parallax);
		if (!parallax || !(layer.camera instanceof OrthographicCamera)) return;
		if (entity.hasComponent(Collider) && !this.warnedParallaxColliderEntities.has(entity.id)) {
			console.warn(
				`Entity ${entity.id} has both Parallax and Collider. Parallax only changes render position; physics and collision keep using the real world position.`
			);
			this.warnedParallaxColliderEntities.add(entity.id);
		}

		const offset = layer.camera.getParallaxRenderOffset(layer.parallax, parallax.getFactor());
		renderingContext.translate(offset.x, offset.y);
	}

	renderLayerEntities = (
		renderingContext: CanvasRenderingContext2D,
		entities: Entity[],
		layer: RenderLayer
	) => {
		const filteredEntities = entities.filter((entity) => entity.renderLayer === layer.type);
		for (const entity of filteredEntities) {
			if (Entity.isBeingCulling(entity, [CullingTarget.ALL, CullingTarget.RENDER])) continue;
			renderingContext.save();
			this.applyEntityParallax(renderingContext, entity, layer);
			const spriteComponents = entity.getComponents(Sprite);
			const spriteAnimations = entity.getComponents(SpriteAnimation);
			const particleEmitters = entity.getComponents(ParticleEmitter);
			const allSprites = [...spriteComponents, ...spriteAnimations];
			const colliderComponents = entity.getComponents(Collider);
			const triggerAreaComponents = entity.getComponents(TriggerArea);
			const transformComponents = entity.getComponents(Transform);
			const debugLines = entity.getComponents(DrawDebugLine);
			allSprites.forEach((_) => {
				const render = new SpriteRenderer(entity);
				render.render(renderingContext);
			});
			if (particleEmitters.length > 0) {
				const render = new ParticleRenderer(entity);
				render.render(renderingContext);
			}
			transformComponents.forEach((_) => {
				const render = new TransformRenderer(entity);
				render.render(renderingContext);
			});
			colliderComponents.forEach((_) => {
				const render = new ColliderRenderer(entity);
				render.render(renderingContext);
			});
			triggerAreaComponents.forEach((_) => {
				const render = new TriggerAreaRenderer(entity);
				render.render(renderingContext);
			});
			debugLines.forEach((_) => {
				const render = new DebugShapesRenderer(entity);
				render.render(renderingContext);
			});
			const uiRenderer = new UIRenderer(entity);
			uiRenderer.render(renderingContext);
			renderingContext.restore();
		}
	};

	render(renderingContext: CanvasRenderingContext2D): void {
		const entities = this.getScene()
			.getEntitiesByQuery({ all: [], none: [Culling] })
			.sort((a, b) => a.getZindex() - b.getZindex());
		const scene = this.getScene();
		if (!scene) return;

		const isValidFilters = (filters: string) => filters && filters !== "none";

		renderingContext.save();
		const filters = scene.getRenderFilters();
		if (isValidFilters(filters)) renderingContext.filter = filters;

		for (const layer of RenderLayers.getOrderedLayers()) {
			if (!layer.visible || !layer.camera) continue;
			renderingContext.save();
			const layerFilters = layer.getRenderFilters();
			if (isValidFilters(layerFilters)) renderingContext.filter = layerFilters;
			layer.camera.applyTransform(renderingContext, layer.parallax);
			this.renderLayerEntities(renderingContext, entities, layer);
			this.fadeLayerHandler(renderingContext, layer);
			renderingContext.restore();
		}

		renderingContext.restore();
	}
}
