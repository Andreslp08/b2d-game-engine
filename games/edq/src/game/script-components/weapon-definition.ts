import { Component } from "engine/ecs/component";


export class WeaponDefinition extends Component{
    fireRate:number = 0.5;
    damage:number = 1;
    range:number = 100;
    
}