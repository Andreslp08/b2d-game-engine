import { startEditorScene } from "@/lib/editor-engine-session";
import { GameObject } from "@b2d-engine/core/common/entities/game-object";
import { CameraNavigator } from "@b2d-engine/core/graphics/cameras/camera-navigator";
import Vector2 from "@b2d-engine/core/math/vector2";
import { Scene } from "@b2d-engine/core/scenes/scene";

export const startSpriteEditorScene = (
	gameRoot: HTMLDivElement,
	resizeContainer: HTMLDivElement,
): (() => void) => {
	const scene = new Scene();
	const previewObject = new GameObject({
		position: new Vector2(0, 0),
		size: new Vector2(1, 1),
		rotation: 0,
	});
	scene.addEntity(previewObject);

	previewObject.addComponent(new CameraNavigator());

	return startEditorScene(gameRoot, resizeContainer, () => scene);
};
