import { Entity } from "../../../ecs/entity";
import { System } from "../../../ecs/system";
import { SpriteAnimation } from "../components/sprite-animation";
import { Sprite } from "../components/sprite";
import { GameObject } from "../../../common/entities/game-object";

export class SpriteSystem extends System {

    constructor() {
        super();
        this.setName('SpriteSystem');
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
				gameObject.sprite = initialSprite;
				continue;
			}

			// Animación frame update
			anim.currentTime += (anim.speed * 10) / deltaTime;
			if (anim.currentTime >= 100) {
				anim.currentTime = 0;
				if (anim.currentFrame < anim.spriteSequence.sprites.length - 1) {
					anim.currentFrame++;
				} else if (anim.loop) {
					anim.currentFrame = 0;
				}
			}

			const nextFrameSprite = anim.spriteSequence.sprites[anim.currentFrame];
			sprite.image = nextFrameSprite.image;
			sprite.imageTransform.position = nextFrameSprite.imageTransform.position.clone();
			sprite.imageTransform.size = nextFrameSprite.imageTransform.size.clone();
		}
	}
}
