import { Entity } from "../ecs/entity";
import { System } from "../ecs/system";
import { CullingTarget } from "../performance/enum/culling-type";
import { ScriptComponent } from "./script-component";

export class ScriptSystem extends System {
	private startedScripts: Set<ScriptComponent> = new Set();

	update(): void {
		const scene = this.getScene();

		const entities = scene
			.getEntitiesByComponents([ScriptComponent])
			.filter(
				(entity) =>
					!Entity.isBeingCulling(entity, [
						CullingTarget.ALL,
						CullingTarget.LOGIC,
					]),
			);

		for (const entity of entities) {
			const scripts = entity.getComponents(ScriptComponent);

			for (const script of scripts) {
				if (
					typeof script.onStart === "function" &&
					script.getEntity() &&
					!this.startedScripts.has(script)
				) {
					script.onStart();
					this.startedScripts.add(script);
				}

				if (typeof script.onUpdate === "function" && this.startedScripts.has(script)) {
					script.onUpdate();
				}

				if (typeof script.onLateUpdate === "function" && this.startedScripts.has(script)) {
					script.onLateUpdate();
				}
			}
		}
	}

	fixedUpdate(): void {
		const scene = this.getScene();

		const entities = scene
			.getEntitiesByComponents([ScriptComponent])
			.filter(
				(entity) =>
					!Entity.isBeingCulling(entity, [
						CullingTarget.ALL,
						CullingTarget.LOGIC,
					]),
			);

		for (const entity of entities) {
			const scripts = entity.getComponents(ScriptComponent);

			for (const script of scripts) {
				if (typeof script.onFixedUpdate === "function" && this.startedScripts.has(script)) {
					script.onFixedUpdate();
				}
			}
		}
	}
}
