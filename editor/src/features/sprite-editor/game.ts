import { Engine } from "@b2d-engine/core";
import { GameObject } from "@b2d-engine/core/common/entities/game-object";
import { DebugMode, DebugTypes } from "@b2d-engine/core/debug/debug";
import { CameraNavigator } from "@b2d-engine/core/graphics/cameras/camera-navigator";
import { ScreenAspectRatio } from "@b2d-engine/core/graphics/enum/aspect-ratio.enum";
import { Screen } from "@b2d-engine/core/graphics/screen/screen";
import Vector2 from "@b2d-engine/core/math/vector2";
import { Scene } from "@b2d-engine/core/scenes/scene";


export const startSpriteEditorGame = (
	gameRoot: HTMLDivElement,
	resizeContainer: HTMLDivElement,
): (() => void) => {
	const engine = new Engine({ gameRoot });
	engine.setScene(new Scene());
    const scene = engine.getScene();
    DebugMode.enabled = true;
    DebugMode.setMode(DebugTypes.ALL);
const previewObject = new GameObject({
        position: new Vector2(0, 0),
        size: new Vector2(1, 1),
        rotation:0
    })
    scene.addEntity(previewObject)

    previewObject.addComponent(new CameraNavigator())

	const resize = (): void => {
		if (!resizeContainer.clientWidth || !resizeContainer.clientHeight) return;
		Screen.getInstance().resize(
			new Vector2(resizeContainer.clientWidth, resizeContainer.clientHeight),
			ScreenAspectRatio["16:9"],
		);
	};
	const resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(resizeContainer);
	resize();
	engine.start();

	return () => {
		resizeObserver.disconnect();
		engine.stop();
		gameRoot.replaceChildren();
	};
};
