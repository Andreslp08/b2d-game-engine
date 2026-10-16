import type { GameObject } from "engine/common/entities/game-object";
import Vector2 from "engine/math/vector2";
import type { MarkerType } from "../config/constants";

export type MarkerArrowDirection = "Up" | "Down" | "Left" | "Right" | "None";

export type MarkerParams = {
	position: Vector2;
	size: Vector2;
	markerType: MarkerType;
	color?: string;
	zIndex?: number;
	onEnter?: (_entity: GameObject) => void;
	onExit?: (_entity: GameObject) => void;
	onStay?: (_entity: GameObject) => void;
	triggerForEntitiesWithTags?: string[];
	arrowDirection?: MarkerArrowDirection;
};
