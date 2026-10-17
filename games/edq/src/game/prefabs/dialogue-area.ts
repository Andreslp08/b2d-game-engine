import type { Scene } from "engine/scenes/scene";
import Vector2 from "engine/math/vector2";
import { MarkerType } from "../config/constants";
import { DialogueAreaController } from "../dialogue/dialogue-area-controller";
import { DialogueManager } from "../dialogue/dialogue-manager";
import type { MarkerParams } from "../interfaces/marker";
import { createMarker } from "./marker";

type DialogueAreaMarkerProps = Partial<
	Pick<MarkerParams, "color" | "arrowDirection" | "markerType">
>;

type DialogueAreaParams = {
	scene: Scene;
	position: Vector2;
	size?: Vector2;
	promptText: string;
	dialogueManager: DialogueManager;
	playerFacingDirection: "left" | "right";
	marker?: DialogueAreaMarkerProps;
};

/** Creates a cylindrical dialogue trigger that starts its supplied manager. */
export const createDialogueArea = ({
	scene,
	position,
	size = new Vector2(2, 2),
	promptText,
	dialogueManager,
	playerFacingDirection,
	marker = {},
}: DialogueAreaParams) => {
	const markerColor = marker.color ?? "rgba(195, 218, 91,0.5)";
	const controller = new DialogueAreaController(
		dialogueManager,
		promptText,
		markerColor,
		playerFacingDirection,
	);
	const area = createMarker({
		position,
		size,
		markerType: marker.markerType ?? MarkerType.cylinder,
		arrowDirection: marker.arrowDirection ?? "None",
		color: markerColor,
		triggerForEntitiesWithTags: ["player"],
		onEnter: controller.onMarkerEnter,
		onExit: controller.onMarkerExit,
		onStay: controller.onMarkerStay,
	});
	area.addComponent(controller);
	controller.setMarker(area);
	scene.addEntity(area);
	return area;
};
