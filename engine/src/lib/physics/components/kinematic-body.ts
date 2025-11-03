import { Component } from "../../ecs/component";
import Vector2 from "../../math/vector2";
import { BodyType } from "../enum/body-type";

export class KinematicBody extends Component {
  private _bodyType: BodyType = BodyType.Kinematic;
  velocity: Vector2 = new Vector2(0, 0);
  direction: { x: 1 | -1; y: 1 | -1 } = { x: 1, y: 1 };

  constructor() {
    super();
  }

  get bodyType(): BodyType {
    return this._bodyType;
  }

  setVelocity(x: number, y: number) {
    this.velocity.set(x, y);
  }

  move(transformPosition: Vector2, deltaTime: number): Vector2 {
    // movimiento controlado manualmente
    return transformPosition.add(this.velocity.clone().multiplyBy(deltaTime));
  }
}
