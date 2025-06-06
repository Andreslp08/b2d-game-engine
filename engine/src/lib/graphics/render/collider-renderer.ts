import { Transform } from "../../common/components/transform";
import { MathUtil } from "../../math/math-util";
import { Collider } from "../../physics/components/collider";
import { Sprite } from "../sprites/components/sprite";
import { Renderer } from "./render";

export class ColliderRenderer extends Renderer {
	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
		if (!this.entity) return;
		const entity = this.entity;
		if (!entity.hasComponent(Collider) || !entity.hasComponent(Transform)) return;
		const collider = entity.getComponent(Collider);
		if (collider.debugMode === false) return;
		context.beginPath();
		context.save();
		context.translate(collider.getPosition().x, collider.getPosition().y);
		context.rotate(MathUtil.degToRad(collider.getEntity().getComponent(Transform).rotation));
		context.translate(-collider.getPosition().x, -collider.getPosition().y);

		context.strokeStyle = "#f00";
		context.lineWidth = 0.02;
		const position = collider.getPosition();
		const size = collider.getSize();
		context.strokeRect(position.x - size.x / 2, position.y - size.y / 2, size.x, size.y);

		context.restore();
		context.closePath();
	}
}
