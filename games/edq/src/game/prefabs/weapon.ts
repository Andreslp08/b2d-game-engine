import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { GameObject } from "engine/common/entities/game-object";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import Vector2 from "engine/math/vector2";
import { itemRegistry } from "../items/item-catalog";
import { WeaponController } from "../script-components/weapon/weapon";


/** Creates the shared equipped-weapon entity from a weapon definition. */
export const createWeapon = (position: Vector2, definitionId = "desert_eagle") => {
	const definition = itemRegistry.get(definitionId);
	if (definition.type !== "weapon") throw new Error(`${definitionId} is not a weapon`);
	const visual = definition.weaponVisual;
	const image = AssetsManager.getImageByName(visual.image);
	const imageSize = { w: image.nativeElement.naturalWidth, h: image.nativeElement.naturalHeight };
	const sprite = new Sprite({
		image,
		framePosition: new Vector2(0, 0),
		frameSize: imageSize,
		sourceSize: imageSize,
		spriteSourceSize: { x: 0, y: 0, ...imageSize },
		scale: new Vector2(visual.scale.x, visual.scale.y),
		anchor: new Vector2(visual.anchor.x, visual.anchor.y),
		pivot: new Vector2(visual.pivot.x, visual.pivot.y),
	});
	const weapon = new GameObject(
		{
			position,
			rotation: 0,
			size: new Vector2(visual.size.x, visual.size.y),
		},
		sprite,
	);
	weapon.addTag("weapon");
	weapon.addComponent(new WeaponController(definition.id));
	return weapon;
};
