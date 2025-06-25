import { GameObject } from "../../../common/entities/game-object";
import { Component } from "../../../ecs/component";
import { SpriteSheet } from "../spritesheet";
import { Sprite } from "./sprite";

export class SpriteAnimation extends Component {
	spritesheet: SpriteSheet;
	loop: boolean;
	speed: number;
	currentFrame: number;
	currentTime: number;
	gameObject: GameObject;
	currentSprite: Sprite;

	constructor(
		spritesheet: SpriteSheet,
		gameObject: GameObject,
		loop: boolean,
		speed?: number
	) {
		super();
		this.unique = false;
		this.loop = loop;
		this.speed = speed ?? 1;
		this.spritesheet = spritesheet;
		this.currentFrame = 0;
		this.currentTime = 0;
		this.gameObject = gameObject;
		this.spritesheet.updateSpritesEntity(this.gameObject);
	}
	setAnimation(spritesheet: SpriteSheet, loop: boolean, speed?: number) {
		spritesheet.updateSpritesEntity(this.gameObject);
		if (this.spritesheet === spritesheet) return; // Ya está esta animación
		this.spritesheet = spritesheet;
		this.loop = loop;
		this.speed = speed ?? this.speed;
		this.currentFrame = 0;
		this.currentTime = 0;
	}

	setAnimationDirectionInX(direction: 1 | -1) {
		this.spritesheet.sprites.forEach((sprite) => (sprite.getDirection().x = direction));
	}
	setAnimationDirectionInY(direction: 1 | -1) {
		this.spritesheet.sprites.forEach((sprite) => (sprite.getDirection().y = direction));
	}

	setZindex(zIndex: number): void {
		super.setZindex(zIndex);
		this.spritesheet.sprites.forEach((sprite) => sprite.setZindex(zIndex));
	}
}
