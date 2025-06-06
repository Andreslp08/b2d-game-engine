import { GameObject } from "../../../common/entities/game-object";
import { Component } from "../../../ecs/component";
import { SpriteSequence } from "../sprite-sequence";

export class SpriteAnimation extends Component {
	spriteSequence: SpriteSequence;
	loop: boolean;
	speed: number;
	currentFrame: number;
	currentTime: number;
	gameObject: GameObject;

	constructor(
		spriteSequence: SpriteSequence,
		gameObject: GameObject,
		loop: boolean,
		speed?: number
	) {
		super();
		this.loop = loop;
		this.speed = speed ?? 1;
		this.spriteSequence = spriteSequence;
		this.spriteSequence.sprites.forEach(
			(sprite) => (sprite.entityTransform = gameObject.transform)
		);
		this.currentFrame = 0;
		this.currentTime = 0;
		this.gameObject = gameObject;
	}
	setAnimation(sequence: SpriteSequence, loop: boolean, speed?: number) {
		if (this.spriteSequence === sequence) return; // Ya está esta animación

		this.spriteSequence = sequence;
		this.loop = loop;
		this.speed = speed ?? this.speed;
		this.currentFrame = 0;
		this.currentTime = 0;
	}
}
