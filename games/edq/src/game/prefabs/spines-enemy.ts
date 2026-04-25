import { GameObject } from "engine/common/entities/game-object";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { HealthComponent } from "../script-components/shared/health-component";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import { SpriteSheet } from "engine/graphics/sprites/spritesheet";
import { SpinesBugController } from "../script-components/spines-bug/spines-bug-controller";
import { Damageable } from "../script-components/shared/damageable";
import { DamageFlashEffect } from "../script-components/shared/damage-flash-effect";
import { DeathParticleEffect } from "../script-components/shared/death-particle-effect";
import { ContactDamage } from "../script-components/shared/contact-damage";

export const createSpinesBug = (position: Vector2) => {
	const idleImage = AssetsManager.getImageByName("spritesheet:spines-bug");
	const idleAtlas = AssetsManager.getAtlasByName("atlas:spines-bug");
	const idle = SpriteSheet.genereateSpritesheetFromAtlas("idle", idleAtlas, idleImage, 0, 1);

	const size = new Vector2(1.5, 1.5);
	const entity = new GameObject({
		position: position.clone(),
		rotation: 0,
		size: size,
	});
	entity.addComponent(new SpriteAnimation(idle, entity, true, 0.07));
	const controller = new SpinesBugController();
	entity.addComponent(controller);
	const body = new DynamicBody();
	const collider = new Collider(new Vector2(0, 0), size.clone().multiply(new Vector2(0.7, 0.7)));
	collider.setOffsetPosition(new Vector2(0, 0.15));
	const health = new HealthComponent(50, 50, true);
	entity.addComponent(body);
	entity.addComponent(collider);
	entity.addComponent(health);
	entity.addComponent(new Damageable());
	entity.addComponent(new DamageFlashEffect());
	entity.addComponent(new DeathParticleEffect());
	entity.addComponent(new ContactDamage({ targetTags: ["player"] }));
	entity.addTag("spines-bug");
	entity.addTag("enemy");

	body.gravity = 60;
	body.mass = 140;
	body.friction = 1800;
	body.dragScale = 109;
	body.bounciness = new Vector2(0, 0);

	return entity;
};
