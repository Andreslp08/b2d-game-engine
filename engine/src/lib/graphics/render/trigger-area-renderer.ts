import { Transform } from "../../common/components/transform";
import { TriggerArea } from "../../trigger-area/components/trigger-area";
import { MathUtil } from "../../math/math-util";
import { Renderer } from "./render";

export class TriggerAreaRenderer extends Renderer {
	render(renderingContext: CanvasRenderingContext2D): void {
		if (!this.entity) return;
		const entity = this.entity;
		if (!entity.hasComponent(TriggerArea) || !entity.hasComponent(Transform)) return;

		const triggerArea = entity.getComponent(TriggerArea);
		if (triggerArea.debugMode === false) return;

		renderingContext.beginPath();
		renderingContext.save();
		renderingContext.translate(triggerArea.getPosition().x, triggerArea.getPosition().y);
		renderingContext.rotate(
			MathUtil.degToRad(triggerArea.getEntity().getComponent(Transform).rotation)
		);
		renderingContext.translate(-triggerArea.getPosition().x, -triggerArea.getPosition().y);

		renderingContext.strokeStyle = "#00e5ff";
		renderingContext.lineWidth = 0.02;
		const position = triggerArea.getPosition();
		const size = triggerArea.getSize();
		renderingContext.strokeRect(
			position.x - size.x / 2,
			position.y - size.y / 2,
			size.x,
			size.y
		);

		renderingContext.restore();
		renderingContext.closePath();
	}
}
