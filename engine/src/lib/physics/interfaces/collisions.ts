import { Collider } from "../components/collider";

export interface CollisionDetectionStategy {
    intersects(other: Collider): boolean;
}

export interface CollisionSubscriber {
    onCollisionDetected(other: Collider): void;
}


