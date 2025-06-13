import { GameObject } from "../../../common/entities/game-object";
import { Component } from "../../../ecs/component";
import { SpriteSequence } from "../sprite-sequence";
import { Sprite } from "./sprite";

export class SpriteAnimation extends Component {
	spriteSequence: SpriteSequence;
	loop: boolean;
	speed: number;
	currentFrame: number;
	currentTime: number;
	gameObject: GameObject;
	currentSprite: Sprite;

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
		this.currentFrame = 0;
		this.currentTime = 0;
		this.gameObject = gameObject;
	}
	setAnimation(sequence: SpriteSequence, loop: boolean, speed?: number) {
		sequence.updateSpritesEntity(this.gameObject);
		if (this.spriteSequence === sequence) return; // Ya está esta animación
		this.spriteSequence = sequence;
		this.loop = loop;
		this.speed = speed ?? this.speed;
		this.currentFrame = 0;
		this.currentTime = 0;
	}

	setAnimationDirectionInX(direction: 1 | -1) {
		this.spriteSequence.sprites.forEach((sprite) => sprite.direction.x = direction);
	}
	setAnimationDirectionInY(direction: 1 | -1) {
		this.spriteSequence.sprites.forEach((sprite) => sprite.direction.y = direction);
	}
}
