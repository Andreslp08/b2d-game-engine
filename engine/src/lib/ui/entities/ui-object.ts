import { Transform } from "../../common/components/transform";
import { Entity } from "../../ecs/entity";
import { RenderLayerTypes } from "../../graphics/enum/render-layer-types.enum";
import { Sprite } from "../../graphics/sprites/components/sprite";
import { ITranform } from "../../input/interfaces/transform.interface";

export class UIObject extends Entity{

	constructor() {
		super();
		this._renderLayer = RenderLayerTypes.UI;
	}
}

export class DebugObject extends Entity {

	constructor(transform: ITranform) {
		super();
		this._renderLayer = RenderLayerTypes.Debug;
        this.addComponent(new Transform(transform));
		this.addComponent(new Sprite("default-sprite", null, transform ))
	}
}
