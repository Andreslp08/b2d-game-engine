import { Transform } from "../common/components/transform";
import { System } from "../ecs/system";
import { Culling } from "../performance/culling";
import { Collider } from "../physics/components/collider";
import { DrawDebugLine } from "./components/draw-line";
import { DebugMode, DebugTypes } from "./debug";



export class DebugSystem extends System{
    update(): void {
        const entities = this.getScene().getEntitiesByQuery({all:[Transform, Collider, DrawDebugLine], none: [Culling]});
        if(DebugMode.enabled === false) return
        entities.forEach((entity) => {
            if(DebugMode.currentMode === DebugTypes.ALL || DebugMode.currentMode === DebugTypes.TRANSFORMS){
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
            if(DebugMode.currentMode === DebugTypes.ALL || DebugMode.currentMode === DebugTypes.COLLIDERS){
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
            if(DebugMode.currentMode === DebugTypes.ALL || DebugMode.currentMode === DebugTypes.SHAPES){
                const drawLine = entity.getComponents(DrawDebugLine);
                if(drawLine){
                   drawLine.forEach((line) => line.debugMode = true);
                }
            } else{
                const drawLine = entity.getComponents(DrawDebugLine);
                if(drawLine){
                   drawLine.forEach((line) => line.debugMode = false);
                }
            }


              
        });
    }

    fixedUpdate(): void {
        
    }

}