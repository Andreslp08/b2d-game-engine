export class MathUtil{
    
    static degToRad(grades:number):number{
        return grades * (Math.PI/180);
    }

    static radToDeg(radians:number):number{
        return radians / (Math.PI/180)
    }
    static lerp(a: number, b: number, t: number): number {
		return a + (b - a) * t;
	}

	static clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, value));
	}

	static moveTowards(current: number, target: number, maxDelta: number): number {
		if (Math.abs(target - current) <= maxDelta) return target;
		return current + Math.sign(target - current) * maxDelta;
	}
}