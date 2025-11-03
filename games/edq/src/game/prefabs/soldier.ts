import { GameObject } from "engine/common/entities/game-object";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { HealthComponent } from "../script-components/health-component";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import { KinematicBody } from "engine/physics/components/kinematic-body";
import { SpriteSheet } from "engine/graphics/sprites/spritesheet";

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
	const dynamicbody = new KinematicBody();
	const collider = new Collider(
		new Vector2(0, -0.02),
		size.clone().multiply(new Vector2(0.8, 0.8))
	);
	const health = new HealthComponent(100, 100, true);
	// const spriteAnim = new SpriteAnimation(SoldierIdleSequence, soldier, true, 0.07);
	// spriteAnim.setAnimation(SoldierIdleSequence, true);
	// soldier.addComponent(spriteAnim);
	// dynamicbody.bounciness = new Vector2(0.6, 0.6);
	soldier.addComponent(dynamicbody);
	soldier.addComponent(collider);
	soldier.addComponent(health);
	soldier.addTag("soldier");

	return soldier;
};
