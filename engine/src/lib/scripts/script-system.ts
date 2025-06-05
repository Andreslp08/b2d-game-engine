import { System } from "../ecs/system";
import { ScriptComponent } from "./script-component";

export class ScriptSystem extends System{
    
    update(deltaTime: number): void {
        const entities = this.getScene().getEntitiesAsArray();
       const scripts = Array.from(entities).filter((entity) => entity.hasComponent(ScriptComponent));
       scripts.forEach((entity) => entity.getComponent(ScriptComponent).onUpdate(deltaTime));
    }

    render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {}
    
}