import { GameObject } from "engine/common/entities/game-object";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { HealthComponent } from "../script-components/health-component";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import { PlayerIdle } from "../sprite-sequences";

export const createSoldier = (position: Vector2) => {
	const size = new Vector2(0.4, 0.4);
	const soldier = new GameObject({
		position: position.clone(),
		rotation: 0,
		size: size,
	});
	const dynamicbody = new DynamicBody(soldier);
	const collider = new Collider(new Vector2(0, 0), size);
	const health = new HealthComponent(soldier, 100, 100, true);
	const idleImage = AssetsManager.getImage("/assets/textures/Soldier.png");
	const sprite = new Sprite("soldier", idleImage, new Vector2(0, 0), new Vector2(500, 500), {
		position: new Vector2(0, 0),
		rotation: 0,
		size: new Vector2(1, 1),
	});

    soldier.addComponent(sprite);
	dynamicbody.bounciness = new Vector2(0.6, 0.6);
	soldier.addComponent(dynamicbody);
	soldier.addComponent(collider);
	soldier.addComponent(health);
	soldier.addTag("soldier");

	return soldier;
};
