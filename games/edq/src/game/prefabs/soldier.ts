import { GameObject } from "engine/common/entities/game-object";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { HealthComponent } from "../script-components/shared/health-component";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import { SpriteSheet } from "engine/graphics/sprites/spritesheet";
import { Damageable } from "../script-components/shared/damageable";

import { DamageFlashEffect } from "../script-components/shared/damage-flash-effect";
import { ContactDamage } from "../script-components/shared/contact-damage";
import { DeathParticleEffect } from "../script-components/shared/death-particle-effect";

export const createSoldier = (position: Vector2) => {
	const idleImage = AssetsManager.getImageByName("spritesheet:soldier-idle");
	const idleAtlas = AssetsManager.getAtlasByName("atlas:soldier-idle");
	const PlayerIdle = SpriteSheet.genereateSpritesheetFromAtlas("idle", idleAtlas, idleImage);

	const size = new Vector2(1.6, 2);
	const soldier = new GameObject({
		position: position.clone(),
		rotation: 0,
		size: size,
	});
	soldier.addComponent(new SpriteAnimation(PlayerIdle, soldier, true, 0.07));
	const dynamicbody = new DynamicBody();
	const collider = new Collider(
		new Vector2(0, 0.1),
		size.clone().multiply(new Vector2(0.6, 0.9)),
	);
	const health = new HealthComponent(100, 100, true);
	soldier.addComponent(new DeathParticleEffect());
	soldier.addComponent(new DamageFlashEffect());
	soldier.addComponent(new Damageable());
	soldier.addComponent(new ContactDamage({ targetTags: ["player"], damage: 50 }));
	soldier.addComponent(dynamicbody);
	soldier.addComponent(collider);
	soldier.addComponent(health);
	soldier.addTag("soldier");

	return soldier;
};
