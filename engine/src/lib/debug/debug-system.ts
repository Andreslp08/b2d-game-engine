import { Transform } from "../common/components/transform";
import { System } from "../ecs/system";
import { Collider } from "../physics/components/collider";
import { DebugMode } from "./debug";



export class DebugSystem extends System{
    update(deltaTime: number): void {
        const entities = this.getScene().getEntitiesAsArray();
        if(DebugMode.enabled === false) return
        entities.forEach((entity) => {
            if(DebugMode.currentMode === 'all' || DebugMode.currentMode === 'transforms'){
                const transform = entity.getComponent(Transform);
                if(transform){
                    transform.debugMode = true;
                }
            }else{
                const transform = entity.getComponent(Transform);
                if(transform){
                    transform.debugMode = false;
                }
            }
            if(DebugMode.currentMode === 'all' || DebugMode.currentMode === 'colliders'){
                const collider = entity.getComponent(Collider);
                if(collider){
                    collider.debugMode = true;
                }
            } else{
                const collider = entity.getComponent(Collider);
                if(collider){
                    collider.debugMode = false;
                }
            }


              
        });
    }

    fixedUpdate(deltaTime: number): void {
        
    }

}