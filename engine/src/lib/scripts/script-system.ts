import { Entity } from "../ecs/entity";
import { System } from "../ecs/system";
import { CullingTarget } from "../performance/enum/culling-type";
import { ScriptComponent } from "./script-component";

export class ScriptSystem extends System {
	// 50 veces por segundo (como Unity)
	private startedScripts: Set<ScriptComponent> = new Set();

	update(): void {
		const entities = this.getScene().getEntitiesAsArray();

		// ⏱️ Llamar start
		for (const entity of entities) {
			const scripts = entity.getComponents(ScriptComponent);
			if (Entity.isBeingCulling(entity, [CullingTarget.ALL, CullingTarget.LOGIC])) continue;
			scripts.forEach((script) => {
				if (
					typeof script.onStart === "function" &&
					script.getEntity() &&
					!this.startedScripts.has(script)
				) {
					script.onStart();
					this.startedScripts.add(script);
				}
			});
		}

		// ⏱️ Llamar Update
		for (const entity of entities) {
			if (Entity.isBeingCulling(entity, [CullingTarget.ALL, CullingTarget.LOGIC])) continue;
			const scripts = entity.getComponents(ScriptComponent);
			scripts.forEach((script) => {
				if (typeof script.onUpdate === "function") {
					script.onUpdate();
				}
			});
		}

		// 🕓 Llamar LateUpdate
		for (const entity of entities) {
			if (Entity.isBeingCulling(entity, [CullingTarget.ALL, CullingTarget.LOGIC])) continue;
			const scripts = entity.getComponents(ScriptComponent);
			scripts.forEach((script) => {
				if (typeof script.onLateUpdate === "function") {
					script.onLateUpdate();
				}
			});
		}
	}

	fixedUpdate(): void {
		const entities = this.getScene().getEntitiesAsArray();
		for (const entity of entities) {
			if (Entity.isBeingCulling(entity, [CullingTarget.ALL, CullingTarget.LOGIC])) continue;
			const scripts = entity.getComponents(ScriptComponent);
			scripts.forEach((script) => {
				if (typeof script.onFixedUpdate === "function") {
					script.onFixedUpdate();
				}
			});
		}
	}
}
