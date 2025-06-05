import { Scene } from "../graphics/scenes/scene";
import { SystemUpdatable } from "./interfaces/system-updatable";
import { Entity } from "./entity";

export abstract class System implements SystemUpdatable {
	private name: string = "System";
	private scene: Scene;
	constructor(scene: Scene) {
		this.scene = scene;
	}

	protected setName(name: string): void {
		this.name = name;
	}

	getName(): string {
		return this.name;
	}

	getScene(): Scene {
		return this.scene;
	}

	setWorld(world: Scene): void {
		this.scene = world;
	}

	abstract update(deltaTime: number, entities: Set<Entity>): void;
}
