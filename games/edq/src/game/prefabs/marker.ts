import { GameObject } from "engine/common/entities/game-object";
import { TriggerArea } from "engine/trigger-area";
import Vector2 from "engine/math/vector2";
import { MarkerType } from "../config/constants";
import type { MarkerParams } from "../interfaces/marker";
import { MarkerController } from "../script-components/marker/marker-controller";
import { MarkerSpriteController } from "../script-components/marker/marker-sprite-controller";

export const createMarker = (params: MarkerParams) => {
	const marker = new GameObject({ position: params.position, rotation: 0, size: params.size });
	marker.addComponent(
		new MarkerController({
			onEnter: params.onEnter,
			onExit: params.onExit,
			onStay: params.onStay,
			triggerForEntitiesWithTags: params.triggerForEntitiesWithTags,
		}),
	);
	marker.addComponent(
		new MarkerSpriteController({
			arrowDirection: params.arrowDirection,
			markerType: params.markerType,
		}),
	);

	const triggerAreas = {
		[MarkerType.cylinder]: {
			offsetPosition: new Vector2(0, 0),
			size: params.size.clone().multiply(new Vector2(0.7, 1)),
		},
		[MarkerType.corona]: {
			offsetPosition: new Vector2(0, 0),
			size: params.size.clone().multiply(new Vector2(0.5, 1)),
		},
	};
	const triggerArea = triggerAreas[params.markerType];
	marker.addComponent(new TriggerArea(triggerArea.offsetPosition, triggerArea.size));
	return marker;
};
