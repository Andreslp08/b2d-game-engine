import { GameObject } from "engine/common/entities/game-object";
import Vector2 from "engine/math/vector2";
import type { AnyItemDefinition } from "../items/definitions/item-definition";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { getProjectileDefinition } from "../items/item-catalog";
import type { GameImage } from "engine/common/assets-manager/game-image";
import { createMarker } from "./marker";
import { MarkerType } from "../config/constants";
import type { Scene } from "engine/scenes/scene";
import { PhysicalKey, type PhysicalKeyCode } from "engine/input/keyboard-manager";
import { PickupController } from "../script-components/pickup/pickup-controller";

type Params = {
	scene: Scene;
	position: Vector2;
	size?: Vector2;
	keybind?: PhysicalKeyCode;
	amount: number;
	definition: AnyItemDefinition;
};

export const createPickup = ({
	scene,
	position,
	size = new Vector2(1, 1),
	keybind = PhysicalKey.E,
	amount,
	definition,
}: Params) => {
	if (!Number.isInteger(amount) || amount <= 0) {
		throw new Error("Pickup amount must be a positive integer");
	}
	console.log(definition);
	let spriteImageId: string = definition.icon;
	let imageRotation = 0;
	const isAmmo = definition.type === "ammo";
	if (isAmmo) {
		spriteImageId = getProjectileDefinition(definition.projectileId).image;
		imageRotation = -90;
	}
	const spriteImage: GameImage = AssetsManager.getImageByName(spriteImageId);

	const frameSize = {
		w: spriteImage.nativeElement.naturalWidth,
		h: spriteImage.nativeElement.naturalHeight,
	};
	const aspectRatio = frameSize.w / frameSize.h;
	const isQuarterTurn = Math.abs(imageRotation) % 180 === 90;
	const spriteSize = isQuarterTurn
		? new Vector2(size.y, size.y / aspectRatio)
		: new Vector2(size.y * aspectRatio, size.y);
	const controller = new PickupController(definition, amount, keybind);
	const marker = createMarker({
		position,
		size: size.clone().scale(2),
		markerType: MarkerType.corona,
		arrowDirection: "None",
		triggerForEntitiesWithTags: ["player"],
		onEnter: controller.onMarkerEnter,
		onExit: controller.onMarkerExit,
		onStay: controller.onMarkerStay,
	});
	marker.addComponent(controller);
	scene.addEntity(marker);
	const obj = new GameObject({ position, rotation: 0, size: spriteSize });
	controller.setPickupObject(obj);
	const itemSprite = new Sprite({
		image: spriteImage,
		framePosition: new Vector2(0, 0),
		frameSize,
		aspectMode: "contain",
		rotation: 0,
		scale: new Vector2(0.45, 0.45),
	});

	obj.addComponent(itemSprite);
	return obj;
};
