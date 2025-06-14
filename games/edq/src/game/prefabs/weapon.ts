import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { GameObject } from "engine/common/entities/game-object";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import type { ITranform } from "engine/input/interfaces/transform.interface";
import Vector2 from "engine/math/vector2";
import { WeaponController } from "../script-components/weapon";

export const createWeapon = (position: Vector2) => {
		const sprite = new Sprite({
			id: "bullet",
			image: AssetsManager.getImageByName("spritesheet:desert_eagle"),
			framePosition: new Vector2(0, 0),
			frameSize: { w: 500, h: 500 },
		});
	const weapon = new GameObject(
		{
			position,
			rotation: 0,
			size: new Vector2(0.4, 0.4),
		},
		sprite
	);
	weapon.addTag("weapon");
	weapon.addComponent(new WeaponController(weapon));
	return weapon;
};
