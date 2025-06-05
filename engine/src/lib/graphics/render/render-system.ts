import { System } from "../../ecs/system";
import { Scene } from "../scenes/scene";
import { GameLayersRenderer, RenderLayers } from "./renderer";

export class RenderSystem extends System {
	private renderer: GameLayersRenderer;

	constructor(scene: Scene) {
		super(scene);
		this.setName("RenderSystem");
		const renderLayers = new RenderLayers();
		this.renderer = new GameLayersRenderer(renderLayers);
	}
	update(deltaTime: number): void {}

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
		this.renderer.render(canvas, context);
	}
}
