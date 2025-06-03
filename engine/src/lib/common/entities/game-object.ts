import { Entity } from "../../ecs/entity";
import { Sprite } from "../../graphics/sprites/components/sprite";
import { ITranform } from "../../input/interfaces/transform.interface";
import Vector2 from "../../math/vector2";
import { Collider } from "../../physics/components/collider";
import { Transform } from "../components/transform";
import { RigidBody } from "../../physics/components/rigid-body";
import { BodyType } from "../../physics/enum/body-type";

export class GameObject extends Entity {
	sprite: Sprite;
	transform: Transform;

	constructor(transform: ITranform, sprite?: Sprite) {
		super();
		this.addTag("game-object");
		this.addComponent(new Transform(transform));
		this.transform = this.getComponent(Transform);
		this.addComponent(
			new Collider( new Vector2(0, 0), this.transform.size.clone())
		);
		if (sprite) {
			this.addComponent(sprite);
		} else {
			this.addComponent(
				new Sprite(
					"default-sprite",
					null,
					{
						position: new Vector2(0, 0),
						rotation: transform.rotation,
						size: new Vector2(500, 500),
					},
					this.getComponent(Transform)
				)
			);
		}
		this.sprite = this.getComponent(Sprite);
		this.getComponent(Transform).drawShape = true;
		this.addComponent(new RigidBody(this));
		this.getComponent(RigidBody).bodyType = BodyType.Static;
	}

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
		super.render(canvas, context);
	}
}
