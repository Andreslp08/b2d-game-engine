import { Entity } from "../../../ecs/entity";
import { System } from "../../../ecs/system";
import { SpriteAnimation } from "../components/sprite-animation";
import { Sprite } from "../components/sprite";
import { GameObject } from "../../../common/entities/game-object";

export class SpriteSystem extends System {
	constructor() {
		super();
		this.setName("SpriteSystem");
	}
	update(deltaTime: number, entities: Set<Entity>): void {
		for (const entity of entities) {
			const gameObject = entity as GameObject;
			if (!gameObject.hasComponent(SpriteAnimation)) continue;

			const anim = gameObject.getComponent(SpriteAnimation);
			const sprite = gameObject.getComponent(Sprite);

			// Si aún no tiene sprite, agregar el primero de la secuencia
			if (!sprite) {
				const initialSprite = anim.spriteSequence.sprites[0];
				gameObject.addComponent(initialSprite);
				gameObject.setSprite(initialSprite);
				continue;
			}

			// Animación frame update
			anim.currentTime += deltaTime;

			const frameDuration =  anim.speed; // e.g., speed = 10 => 100ms por frame

			if (anim.currentTime >= frameDuration) {
				anim.currentTime = 0;
				anim.currentFrame++;

				if (anim.currentFrame >= anim.spriteSequence.sprites.length) {
					anim.currentFrame = anim.loop ? 0 : anim.spriteSequence.sprites.length - 1;
				}
			}

			const nextFrameSprite = anim.spriteSequence.sprites[anim.currentFrame];
			sprite.image = nextFrameSprite.image;
			sprite.imageClipTransform.position =
			nextFrameSprite.imageClipTransform.position.clone();
			sprite.imageClipTransform.size = nextFrameSprite.imageClipTransform.size.clone();
			gameObject.setSprite(nextFrameSprite);
		}
	}
}
