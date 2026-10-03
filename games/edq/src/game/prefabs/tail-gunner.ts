import { TailGunnerShotController } from "../script-components/tail-gunner/tail-gunner-shot-controller";
import { TailGunnerSpriteController } from "../script-components/tail-gunner/tail-gunner-sprite-controller";
import { GameObject } from "engine/common/entities/game-object";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { HealthComponent } from "../script-components/shared/health-component";
import { Damageable } from "../script-components/shared/damageable";
import { DamageFlashEffect } from "../script-components/shared/damage-flash-effect";
import { DeathParticleEffect } from "../script-components/shared/death-particle-effect";
import { ContactDamage } from "../script-components/shared/contact-damage";
import { TailAIController } from "../script-components/tail-gunner/tail-gunner-controller";

export const createTailGunner = (position: Vector2) => {

	const size = new Vector2(3.5, 3.5);
	const entity = new GameObject({
		position: position.clone(),
		rotation: 0,
		size: size,
	});

	const spriteController = new TailGunnerSpriteController();
	entity.addComponent(spriteController);
	const shotController = new TailGunnerShotController();
	entity.addComponent(shotController);
	const AIController = new TailAIController();
	entity.addComponent(AIController);
	const body = new DynamicBody();
	const collider = new Collider(new Vector2(0, 0), size.clone().multiply(new Vector2(0.8, 0.7)));
	collider.setOffsetPosition(new Vector2(0, 0.35));
	const health = new HealthComponent(500, 500, true);
	entity.addComponent(body);
	entity.addComponent(collider);
	entity.addComponent(health);
	entity.addComponent(new Damageable());
	entity.addComponent(new DamageFlashEffect());
	entity.addComponent(new DeathParticleEffect());
	entity.addComponent(new ContactDamage({ targetTags: ["player"], damage:30}));
	entity.addTag("tail-gunner");
	entity.addTag("enemy");

	body.gravity = 60;
	body.mass = 2000;
	body.friction = 1800;
	body.dragScale = 109;
	body.bounciness = new Vector2(0, 0);

	return entity;
};
