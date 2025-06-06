import { Scene } from "../graphics/scenes/scene";
import { Renderable } from "../common/interfaces/renderable";
import { Updatable } from "../common/interfaces/updatable";

export abstract class System implements Updatable {
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

	abstract update(deltaTime: number): void;
}
