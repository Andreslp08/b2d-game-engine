import { UIComponent } from "../../ui/components/ui-component";
import { Renderer } from "./render";

export class UIRenderer extends Renderer {
	render(renderingContext: CanvasRenderingContext2D): void {
		if (!this.entity) return;
		const entity = this.entity;
		if (!entity.hasComponent(UIComponent)) return;
		const uiComponents = entity.getComponents(UIComponent);
		uiComponents.forEach((uiComponent) => {
			uiComponent.render(renderingContext);
		});
	}
}
