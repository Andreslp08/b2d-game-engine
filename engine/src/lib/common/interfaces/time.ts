export class Time {
  private static _deltaTime = 0;
  private static _time = 0;
  public static timeScale = 1;

  public static get deltaTime() {
    return this._deltaTime;
  }

  public static get time() {
    return this._time;
  }

  // Solo el Engine puede actualizar esto
  public static _update(dt: number) {
    this._deltaTime = dt * Time.timeScale;
    this._time += dt;
  }
}