import { Transform } from "../../common/components/transform";
import { MathUtil } from "../../math/math-util";
import { Collider } from "../../physics/components/collider";
import { Renderer } from "./render";

export class ColliderRenderer extends Renderer {
	render(renderingContext: CanvasRenderingContext2D): void {
		if (!this.entity) return;
		const entity = this.entity;
		if (!entity.hasComponent(Collider) || !entity.hasComponent(Transform)) return;
		const collider = entity.getComponent(Collider);
		if (collider.debugMode === false) return;
		renderingContext.beginPath();
		renderingContext.save();
		renderingContext.translate(collider.getPosition().x, collider.getPosition().y);
		renderingContext.rotate(MathUtil.degToRad(collider.getEntity().getComponent(Transform).rotation));
		renderingContext.translate(-collider.getPosition().x, -collider.getPosition().y);

		renderingContext.strokeStyle = "#f00";
		renderingContext.lineWidth = 0.02;
		const position = collider.getPosition();
		const size = collider.getSize();
		renderingContext.strokeRect(position.x - size.x / 2, position.y - size.y / 2, size.x, size.y);

		renderingContext.restore();
		renderingContext.closePath();
	}
}
