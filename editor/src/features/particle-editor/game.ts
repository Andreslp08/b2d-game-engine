import type { ParticleSystemDefinition } from "@/features/particle-editor/model/particle-types";
import { startEditorScene } from "@/lib/editor-engine-session";
import { GameObject } from "@b2d-engine/core/common/entities/game-object";
import { CameraNavigator } from "@b2d-engine/core/graphics/cameras/camera-navigator";
import { createParticleEmitterFromDefinition } from "@b2d-engine/core/particle-system/particle-effect";
import Vector2 from "@b2d-engine/core/math/vector2";
import { Scene } from "@b2d-engine/core/scenes/scene";

export const startParticleEditorScene = (
	gameRoot: HTMLDivElement,
	resizeContainer: HTMLDivElement,
) => {
	const scene = new Scene();
	const navigator = new GameObject({
		position: new Vector2(0, 0),
		size: new Vector2(1, 1),
		rotation: 0,
	});
	navigator.addComponent(new CameraNavigator({ wheelTarget: gameRoot }));
	scene.addEntity(navigator);
	let previewObjects: GameObject[] = [];

	const sync = (systems: ParticleSystemDefinition[]): void => {
		for (const object of previewObjects) scene.destroyEntity(object);
		previewObjects = systems
			.filter((system) => system.visible)
			.map((system) => {
				const object = new GameObject({
					position: new Vector2(0, 0),
					size: new Vector2(1, 1),
					rotation: 0,
				});
				object.addComponent(createParticleEmitterFromDefinition(system.emitter));
				scene.addEntity(object);
				return object;
			});
	};

	const destroy = startEditorScene(gameRoot, resizeContainer, () => scene);

	return {
		sync,
		destroy: () => {
			destroy();
		},
	};
};
