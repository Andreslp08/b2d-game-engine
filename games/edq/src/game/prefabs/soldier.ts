import { GameObject } from "@b2d-engine/core/common/entities/game-object";
import Vector2 from "@b2d-engine/core/math/vector2";
import { Collider } from "@b2d-engine/core/physics/components/collider";
import { DynamicBody } from "@b2d-engine/core/physics/components/dynamic-body";
import { HealthComponent } from "../script-components/shared/health-component";
import { AssetsManager } from "@b2d-engine/core/common/assets-manager/assets-manager";
import { SpriteAnimation } from "@b2d-engine/core/graphics/sprites/components/sprite-animation";
import { SpriteSheet } from "@b2d-engine/core/graphics/sprites/spritesheet";
import { Damageable } from "../script-components/shared/damageable";

import { DamageFlashEffect } from "../script-components/shared/damage-flash-effect";
import { ContactDamage } from "../script-components/shared/contact-damage";
import { DeathParticleEffect } from "../script-components/shared/death-particle-effect";
import { SoliderIA } from "../script-components/soldier/ia";

export const createSoldier = (position: Vector2) => {
	const idleImage = AssetsManager.getImageByName("spritesheet:enemies:soldier");
	const idleAtlas = AssetsManager.getAtlasByName("atlas:enemies:soldier");
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
	soldier.addComponent(new SoliderIA())
	soldier.addTag("soldier");
	soldier.addTag("enemy");

	return soldier;
};
