import { System } from "../ecs/system";
import { ScriptComponent } from "./script-component";

export class ScriptSystem extends System {
	// 50 veces por segundo (como Unity)
	private startedScripts: Set<ScriptComponent> = new Set();

	update(deltaTime: number): void {
		const entities = this.getScene().getEntitiesAsArray();

		// ⏱️ Llamar start
		for (const entity of entities) {
			const scripts = entity.getComponents(ScriptComponent);
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
			const scripts = entity.getComponents(ScriptComponent);
			scripts.forEach((script) => {
				if (typeof script.onUpdate === "function") {
					script.onUpdate(deltaTime);
				}
			});
		}

		// 🕓 Llamar LateUpdate
		for (const entity of entities) {
			const scripts = entity.getComponents(ScriptComponent);
			scripts.forEach((script) => {
				if (typeof script.onLateUpdate === "function") {
					script.onLateUpdate(deltaTime);
				}
			});
		}
	}

	fixedUpdate(deltaTime: number): void {
		const entities = this.getScene().getEntitiesAsArray();
		for (const entity of entities) {
			const scripts = entity.getComponents(ScriptComponent);
			scripts.forEach((script) => {
				if (typeof script.onFixedUpdate === "function") {
					script.onFixedUpdate(deltaTime);
				}
			});
		}
	}
}
