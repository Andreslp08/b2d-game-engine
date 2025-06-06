import { Entity } from "../../ecs/entity";
import { Sprite } from "../../graphics/sprites/components/sprite";
import { ITranform } from "../../input/interfaces/transform.interface";
import Vector2 from "../../math/vector2";
import { Transform } from "../components/transform";
import { RenderLayerTypes } from "../../graphics/enum/render-layer-types.enum";


export class GameObject extends Entity {
	protected _sprite: Sprite;
	transform: Transform;

	constructor(transform: ITranform, sprite?: Sprite) {
		super();
		this._renderLayer = RenderLayerTypes.World
		this.addTag("game-object");
		this.addComponent(new Transform(transform));
		this.transform = this.getComponent(Transform);
		if (sprite) {
			this.addComponent(sprite);
		} else {
			this.addComponent(
				new Sprite("default-sprite", null, {
					position: new Vector2(0, 0),
					rotation: transform.rotation,
					size: new Vector2(0, 0),
				})
			);
		}
	}


	// render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
	// 	if (!this.transform){
	// 		return;
	// 	}
	// 	context.beginPath();
	// 	this.components.forEach((c) => {

	// 		c.render(canvas, context);
	// 	});
	// 	context.closePath();
	// }

	setSprite(sprite: Sprite) {
		if (!sprite) return;
		if (!this.hasComponent(Sprite)) {
			this.addComponent(sprite);
		}
		this._sprite = Array.from(this.components).find((c) => c instanceof Sprite);
	}
	public get sprite() {
		return this.getComponent(Sprite);
	}
}
