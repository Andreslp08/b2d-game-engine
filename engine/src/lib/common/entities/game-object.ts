import { Entity } from "../../ecs/entity";
import { Sprite } from "../../graphics/sprites/components/sprite";
import { ITranform } from "../../input/interfaces/transform.interface";
import Vector2 from "../../math/vector2";
import { Transform } from "../components/transform";
import { RenderLayerTypes } from "../../graphics/enum/render-layer-types.enum";

export class GameObject extends Entity {
	transform: Transform;

	constructor(transform: ITranform, sprite?: Sprite) {
		super();
		this._renderLayer = RenderLayerTypes.World;
		this.addTag("game-object");
		this.addComponent(new Transform(transform));
		this.transform = this.getComponent(Transform);
		if (sprite) {
			this.addComponent(sprite);
		} 
	}
}
