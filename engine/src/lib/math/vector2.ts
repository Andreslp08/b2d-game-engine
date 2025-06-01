export default class Vector2 {
	public x = 0;
	public y = 0;

	public static readonly ZERO = new Vector2(0, 0);
	public static readonly UP = new Vector2(0, -1);
	public static readonly DOWN = new Vector2(0, 1);
	public static readonly LEFT = new Vector2(-1, 0);
	public static readonly RIGHT = new Vector2(1, 0);

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	public static add(vectorOne: Vector2, vectorTwo: Vector2): Vector2 {
		return new Vector2(vectorOne.x + vectorTwo.x, vectorOne.y + vectorTwo.y);
	}

	public static substract(vectorOne: Vector2, vectorTwo: Vector2): Vector2 {
		return new Vector2(vectorOne.x - vectorTwo.x, vectorOne.y - vectorTwo.y);
	}

	public static distance(vectorA: Vector2, vectorB: Vector2): number {
		const dx = vectorA.x - vectorB.x;
		const dy = vectorA.y - vectorB.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		return distance;
	}

	public static normalize(vector: Vector2): Vector2 {
		return vector.clone().normalize();
	}

	//================================================================================================================

	public equalTo(vector: Vector2): boolean {
		if (vector.x === this.x && vector.y === this.y) {
			return true;
		}
		return false;
	}

	public add(vector: Vector2): Vector2 {
		this.x = this.x + vector.x;
		this.y = this.y + vector.y;
		return this;
	}

	public substract(vector: Vector2): Vector2 {
		this.x = this.x - vector.x;
		this.y = this.y - vector.y;
		return this;
	}

	public multiply(vector: Vector2): Vector2 {
		this.x = this.x * vector.x;
		this.y = this.y * vector.y;
		return this;
	}

	public divide(vector: Vector2): Vector2 {
		this.x = this.x / vector.x;
		this.y = this.y / vector.y;
		return this;
	}

	public multiplyBy(escalar: number): Vector2 {
		this.x = this.x * escalar;
		this.y = this.y * escalar;
		return this;
	}

	public divideBy(escalar: number): Vector2 {
		this.x = this.x / escalar;
		this.y = this.y / escalar;
		return this;
	}

	public getMagnitude(): number {
		const x = this.x;
		const y = this.y;
		return Math.sqrt(x * x + y * y);
	}

	public normalize(): Vector2 {
		if (this.getMagnitude() > 0) {
			const m = this.getMagnitude();
			this.x = this.x / m;
			this.y = this.y / m;
		}
		return this;
	}

	public rotate(radians: number): Vector2 {
		const rx = Math.cos(radians) * this.x - Math.sin(radians) * this.y;
		const ry = Math.sin(radians) * this.x - Math.cos(radians) * this.y;
		this.x = rx;
		this.y = ry;
		return this;
	}

	public setDirection(radAngle: number): Vector2 {
		this.x = Math.cos(radAngle) * this.getMagnitude();
		this.y = Math.sin(radAngle) * this.getMagnitude();
		return this;
	}

	public clone(): Vector2 {
		return new Vector2(this.x, this.y);
	}

	public scale(factor: number): Vector2 {
		this.x *= factor;
		this.y *= factor;
		return this;
	}

	public set (x: number, y: number) {
		this.x = x;
		this.y = y;
		return this;
	}
}
