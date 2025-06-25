import { System } from "../../../ecs/system";
import { SpriteAnimation } from "../components/sprite-animation";
import { GameObject } from "../../../common/entities/game-object";
import { Scene } from "../../../scenes/scene";
import { Time } from "../../../common/interfaces/time";
import { Entity } from "../../../ecs/entity";
import { CullingTarget } from "../../../performance/enum/culling-type";

export class SpriteAnimationSystem extends System {
	constructor(scene: Scene) {
		super(scene);
		this.setName("SpriteSystem");
	}

	fixedUpdate(): void {}

	updateAnimations(spriteAnimation: SpriteAnimation) {
		const anim = spriteAnimation;
		// Animación frame update
		anim.currentTime += Time.deltaTime;

		const frameDuration = anim.speed; // e.g., speed = 10 => 100ms por frame

		if (anim.currentTime >= frameDuration) {
			anim.currentTime = 0;
			anim.currentFrame++;

			if (anim.currentFrame >= anim.spritesheet.sprites.length) {
				anim.currentFrame = anim.loop ? 0 : anim.spritesheet.sprites.length - 1;
			}
		}

		const nextFrameSprite = anim.spritesheet.sprites[anim.currentFrame];
		anim.currentSprite = nextFrameSprite;
		// console.log(anim.currentSprite.id)
	}

	update(): void {
		const entities = this.getScene().getEntitiesAsArray();
		for (const entity of entities) {
			if (Entity.isBeingCulling(entity, [CullingTarget.ALL, CullingTarget.LOGIC])) continue;
			const gameObject = entity as GameObject;
			if (!gameObject.hasComponent(SpriteAnimation)) continue;
			const animations = gameObject.getComponents(SpriteAnimation);
			for (const animation of animations) {
				this.updateAnimations(animation);
			}
		}
	}
}
