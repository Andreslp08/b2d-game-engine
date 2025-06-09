import { System } from "../ecs/system";
import { ScriptComponent } from "./script-component";

export class ScriptSystem extends System {
  private accumulatedTime: number = 0;
  private fixedDeltaTime: number = 1 / 50; // 50 veces por segundo (como Unity)
  private startedScripts: Set<ScriptComponent> = new Set();

  update(deltaTime: number): void {
    const entities = this.getScene().getEntitiesAsArray();

        // ⏱️ Llamar Update
    for (const entity of entities) {
      const scripts = entity.getComponents(ScriptComponent);
      scripts.forEach((script) => {
        if (typeof script.onStart === "function" && script.getEntity() && !this.startedScripts.has(script)) {
          script.onStart();
          this.startedScripts.add(script);
        }
      });
    }
    // 🔁 Llamar FixedUpdate según el tiempo acumulado
    this.accumulatedTime += deltaTime;
    while (this.accumulatedTime >= this.fixedDeltaTime) {
      for (const entity of entities) {
        const scripts = entity.getComponents(ScriptComponent);
        scripts.forEach((script) => {
          if (typeof script.onFixedUpdate === "function") {
            script.onFixedUpdate(this.fixedDeltaTime);
          }
        });
      }
      this.accumulatedTime -= this.fixedDeltaTime;
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
}