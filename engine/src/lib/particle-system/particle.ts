import Vector2 from "../math/vector2";

export class Particle {
    position: Vector2;
    velocity: Vector2;
    acceleration: Vector2;
    rotation: number;
    angularVelocity: number;
    startSize: Vector2;
    endSize: Vector2;
    size: Vector2;
    startColor: string;
    endColor: string;
    color: string;
    startOpacity: number;
    endOpacity: number;
    opacity: number;
    age: number;
    lifetime: number;
    active: boolean;
}
