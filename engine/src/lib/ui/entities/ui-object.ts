import { Transform } from "../../common/components/transform";
import { Entity } from "../../ecs/entity";
import { RenderLayerTypes } from "../../graphics/enum/render-layer-types.enum";
import { ITranform } from "../../input/interfaces/transform.interface";

export class UIObject extends Entity {
	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
		this.components.forEach((component) => component.render(canvas, context));
        // draw a fill rctangle
        context.fillStyle = "red";
        context.fillRect(0, 0, 500, 500);
	}
	constructor(transform: ITranform) {
		super();
		this._renderLayer = RenderLayerTypes.UI;
        this.addComponent(new Transform(transform));
	}
}
