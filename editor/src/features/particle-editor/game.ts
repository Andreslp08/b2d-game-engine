import type { ParticleSystemDefinition } from "@/features/particle-editor/model/particle-types";
import { Engine } from "@b2d-engine/core";
import { GameObject } from "@b2d-engine/core/common/entities/game-object";
import { CameraNavigator } from "@b2d-engine/core/graphics/cameras/camera-navigator";
import { ScreenAspectRatio } from "@b2d-engine/core/graphics/enum/aspect-ratio.enum";
import { Screen } from "@b2d-engine/core/graphics/screen/screen";
import { createParticleEmitterFromDefinition } from "@b2d-engine/core/particle-system/particle-effect";
import Vector2 from "@b2d-engine/core/math/vector2";
import { Scene } from "@b2d-engine/core/scenes/scene";

export const startParticleEditorGame = (
	gameRoot: HTMLDivElement,
	resizeContainer: HTMLDivElement,
) => {
	const engine = new Engine({ gameRoot });
	const scene = new Scene();
	engine.setScene(scene);
	const navigator = new GameObject({ position: new Vector2(0, 0), size: new Vector2(1, 1), rotation: 0 });
	navigator.addComponent(new CameraNavigator({ wheelTarget: gameRoot }));
	scene.addEntity(navigator);
	let previewObjects: GameObject[] = [];

	const sync = (systems: ParticleSystemDefinition[]): void => {
		for (const object of previewObjects) scene.destroyEntity(object);
		previewObjects = systems.filter((system) => system.visible).map((system) => {
			const object = new GameObject({ position: new Vector2(0, 0), size: new Vector2(1, 1), rotation: 0 });
			object.addComponent(createParticleEmitterFromDefinition(system.emitter));
			scene.addEntity(object);
			return object;
		});
	};

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

	return {
		sync,
		destroy: () => {
			resizeObserver.disconnect();
			engine.stop();
			gameRoot.replaceChildren();
		},
	};
};
