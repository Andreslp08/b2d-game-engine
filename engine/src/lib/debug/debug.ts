export enum DebugTypes{
    ALL = 'all',
    TRANSFORMS = 'transforms',
    COLLIDERS = 'colliders',
    TRIGGER_AREAS = 'trigger-areas',
    SHAPES = 'shapes'
}
export class DebugMode{
   

    private static  _currentMode:DebugTypes = DebugTypes.ALL;
    static enabled = false;

    static get currentMode(){
        return DebugMode._currentMode
    }

   static check(debug:DebugTypes){
        DebugMode._currentMode = debug;
    }
}
