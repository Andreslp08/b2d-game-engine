export class DebugMode{
   

    private static  _currentMode: 'all' | 'transforms' | 'colliders' = 'all';
    static enabled = false;

    static get currentMode(){
        return DebugMode._currentMode
    }

   static check(debug:'all' | 'transforms' | 'colliders'){
        DebugMode._currentMode = debug;
    }
}
