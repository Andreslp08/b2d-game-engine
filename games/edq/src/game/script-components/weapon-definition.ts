import type { GameObject } from "engine/common/entities/game-object";

export interface WeaponDefinition{
    fireRate:number;
    damage:number;
    range:number;
}