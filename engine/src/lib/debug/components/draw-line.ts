import { Component } from "../../ecs/component";
import Vector2 from "../../math/vector2";

export class DrawDebugLine extends Component{
    constructor(public start: Vector2, public end: Vector2, public color: string, public width?:number) {
        super()
        this.unique = false;
    }
}