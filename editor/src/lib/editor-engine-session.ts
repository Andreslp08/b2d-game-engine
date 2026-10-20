import { Engine } from "@b2d-engine/core/engine";
import { ScreenAspectRatio } from "@b2d-engine/core/graphics/enum/aspect-ratio.enum";
import { Screen } from "@b2d-engine/core/graphics/screen/screen";
import Vector2 from "@b2d-engine/core/math/vector2";
import type { Scene } from "@b2d-engine/core/scenes/scene";

let engine: Engine | null = null;
let activeScene: Scene | null = null;

export const startEditorScene = (
	gameRoot: HTMLDivElement,
	resizeContainer: HTMLDivElement,
	createScene: () => Scene,
): (() => void) => {
	if (!engine) engine = new Engine({ gameRoot });
	else engine.mount(gameRoot);

	const scene = createScene();
	activeScene = scene;
	engine.setScene(scene);

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
		if (activeScene !== scene || !engine) return;
		activeScene = null;
		engine.stop();
	};
};
