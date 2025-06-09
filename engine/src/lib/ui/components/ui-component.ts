import { Renderable } from "../../common/interfaces/renderable";
import { Updatable } from "../../common/interfaces/updatable";
import { Component } from "../../ecs/component";
import { ITranform } from "../../input/interfaces/transform.interface";
import Vector2 from "../../math/vector2";

export  class UIComponent extends Component implements Renderable{

    constructor(protected  transform:ITranform){
        super();
    }

    setPosition(position:Vector2){

        this.transform.position = position;
    }

    setSize(size:Vector2){
        this.transform.size = size;
    }

    render(context: CanvasRenderingContext2D): void {

    }
}