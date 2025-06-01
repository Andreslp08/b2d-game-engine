export class MathUtil{
    
    static degToRad(grades:number):number{
        return grades * (Math.PI/180);
    }

    static radToDeg(radians:number):number{
        return radians / (Math.PI/180)
    }
}