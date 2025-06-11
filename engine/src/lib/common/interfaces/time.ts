export class Time {
	private static _deltaTime = 0;
	private static _fixedDeltaTime = 0;
	private static _time = 0;
	private static _timeScale = 1;
	private static _fixedAccumulator = 0;

	public static get deltaTime() {
		return this._deltaTime;
	}

	public static get time() {
		return this._time;
	}

	public static get fixedDeltaTime() {
		return this._fixedDeltaTime;
	}

	public static get timeScale() {
		return this._timeScale;
	}

	public static get alpha() {
		return this._fixedAccumulator / this._fixedDeltaTime;
	}

	public static get fixedAccumulator() {
		return this._fixedAccumulator;
	}

	// Solo el Engine puede actualizar esto
	public static update(dt: number) {
		this._deltaTime = dt * Time._timeScale;
		this._time += dt;
	}
	public static fixedUpdate(dt: number) {
		this._fixedDeltaTime = dt;
	}

	public static setFixedUpdateAccumulator(accumulator: number) {
		this._fixedAccumulator = accumulator;
	}
}
