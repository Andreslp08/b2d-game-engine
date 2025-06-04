import { Entity } from "../ecs/entity";
import { System } from "../ecs/system";
import { ScriptComponent } from "./script-component";

export class ScriptSystem extends System{
    
    update(deltaTime: number, entities: Set<Entity>): void {
       const scripts = Array.from(entities).filter((entity) => entity.hasComponent(ScriptComponent));
       scripts.forEach((entity) => entity.getComponent(ScriptComponent).onUpdate(deltaTime));
    }
    
}