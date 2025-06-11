import { GameObject } from "engine/common/entities/game-object";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import Vector2 from "engine/math/vector2";
import { PlayerIdle } from "../sprite-sequences";
import { Collider } from "engine/physics/components/collider";
import { BodyType } from "engine/physics/enum/body-type";
import { BasicMovement } from "../script-components/basic-movement";
import { PlayerController } from "../script-components/player-controller";
import { HealthComponent } from "../script-components/health-component";
import { FallDamage } from "../script-components/fall-damage";
import { PlayerHud } from "../hud/hud";
import { ShieldComponent } from "../script-components/shield-component";
import { WeaponHolder } from "../script-components/weapon";
import { DynamicBody } from "engine/physics/components/dynamic-body";

export const createPlayer = (position: Vector2): GameObject => {
	const entity = new GameObject({
		position: position,
		rotation: 0,
		size: new Vector2(0.8, 1),
	});
	entity.addTag("player");
	entity.addComponent(new SpriteAnimation(PlayerIdle, entity, true));
	entity.addComponent(new DynamicBody(entity));
	entity.addComponent(new Collider(new Vector2(0, 0), new Vector2(0.5, 1)));
	entity.addComponent(new BasicMovement());
	entity.addComponent(new PlayerController(entity));
	entity.addComponent(new HealthComponent(entity, 100, 100, true));
	entity.addComponent(new ShieldComponent(entity));
	entity.addComponent(new FallDamage(entity));
	entity.addComponent( new PlayerHud(entity));
	entity.addComponent( new WeaponHolder(entity));
	const collider = entity.getComponent(Collider);
	const playerBody = entity.getComponent(DynamicBody);
	const playerMovement = entity.getComponent(BasicMovement);
	playerMovement.direction.x = 1;
	collider.setSize(new Vector2(0.5, entity.transform.size.y));
	collider.setOffsetPosition(new Vector2(0, 0));
	playerBody.gravity = 60;
	playerBody.mass = 80;
	playerBody.friction = 1800;
	playerBody.dragScale = 109;
	playerMovement.forceX = 7000;
	playerMovement.forceY = 12000;
	playerMovement.maxJumpHeight = 1.2;
	playerBody.bounciness = new Vector2(0, 0);
	return entity;
};
