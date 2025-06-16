import { Transform } from "engine/common/components/transform";
import { GameObject } from "engine/common/entities/game-object";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { Entity } from "engine/ecs/entity";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";
import { BodyType } from "engine/physics/enum/body-type";
import { ScriptComponent } from "engine/scripts/script-component";
import { StaticBody } from "engine/physics/components/static-body";

const BOX_SIZE = 0.7;

export class BoxMessage extends ScriptComponent {
	message: string = "";
	speed: number = 1;
	amplitude: number = 0.1;
	time: number = 0;

	constructor(entity: Entity, message: string) {
		super(entity);
		this.message = message;
	}

	onUpdate(deltaTime: number): void {
		const transform = this.entity.getComponent(Transform);
		this.time += deltaTime;
		if (transform) {
			transform.position.x =
				transform.position.x + Math.cos(this.time * this.speed * Math.PI) * this.amplitude;
		}
	}
}

export const createBox = (positon: Vector2): GameObject => {
	const entity = new GameObject({
		position: positon,
		rotation: 0,
		size: new Vector2(BOX_SIZE, BOX_SIZE),
	});
	entity.addTag("box");
	const sprite = new Sprite({
		id: "box",
		image: AssetsManager.getImageByName("spritesheet:box"),
		framePosition: new Vector2(0, 0),
		frameSize: {w:500, h:500},
	});
	entity.addComponent(new Collider(new Vector2(0, 0), new Vector2(BOX_SIZE, BOX_SIZE)));
	entity.addComponent(new StaticBody(entity));
	if (entity.hasComponent(Sprite)) {
		entity.deleteComponent(Sprite);
	}
	entity.addComponent(sprite);
	// entity.addComponent(new BoxMessage(entity, "hello"));
	return entity;
};
