import { Transform } from "@b2d-engine/core/common/components/transform";
import { GameObject } from "@b2d-engine/core/common/entities/game-object";
import { AssetsManager } from "@b2d-engine/core/common/assets-manager/assets-manager";
import { Sprite } from "@b2d-engine/core/graphics/sprites/components/sprite";
import Vector2 from "@b2d-engine/core/math/vector2";
import { Collider } from "@b2d-engine/core/physics/components/collider";
import { ScriptComponent } from "@b2d-engine/core/scripts/script-component";
import { StaticBody } from "@b2d-engine/core/physics/components/static-body";
import { Time } from "@b2d-engine/core/common/interfaces/time";

const BOX_SIZE = 0.7;

export class BoxMessage extends ScriptComponent {
	message: string = "";
	speed: number = 1;
	amplitude: number = 0.1;
	time: number = 0;

	constructor(message: string) {
		super();
		this.message = message;
	}

	onUpdate(): void {
		const transform = this.entity.getComponent(Transform);
		this.time += Time.deltaTime;
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
		image: AssetsManager.getImageByName("spritesheet:box"),
		framePosition: new Vector2(0, 0),
		frameSize: {w:500, h:500},
	});
	entity.addComponent(new Collider(new Vector2(0, 0), new Vector2(BOX_SIZE, BOX_SIZE)));
	entity.addComponent(new StaticBody());
	if (entity.hasComponent(Sprite)) {
		entity.deleteallComponentsByClass(Sprite);
	}
	entity.addComponent(sprite);
	// entity.addComponent(new BoxMessage(entity, "hello"));
	return entity;
};
