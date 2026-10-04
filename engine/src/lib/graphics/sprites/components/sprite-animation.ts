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
	reverse = false;
	private animationDirectionInX: 1 | -1 = 1;

	constructor(
		spritesheet: SpriteSheet,
		gameObject: GameObject,
		loop: boolean,
		speed?: number,
		reverse?: boolean
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
		this.reverse = reverse ?? false;
	}
	setAnimation(spritesheet: SpriteSheet, loop: boolean, speed?: number, reverse?: boolean) {
  // ✅ Si ya es la misma animación, solo actualiza el reverse y speed
  if (this.spritesheet === spritesheet) {
    this.reverse = reverse ?? this.reverse;
    this.speed = speed ?? this.speed;
    return;
  }
		spritesheet.updateSpritesEntity(this.gameObject);
		this.spritesheet = spritesheet;
		this.loop = loop;
		this.speed = speed ?? this.speed;
		this.currentFrame = 0;
		this.currentTime = 0;
		this.reverse = reverse ?? this.reverse;
		this.spritesheet.sprites.forEach(
			(sprite) => (sprite.getDirection().x = this.animationDirectionInX),
		);
	}

	setAnimationDirectionInX(direction: 1 | -1) {
		if (this.animationDirectionInX === direction) return;
		this.animationDirectionInX = direction;
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
