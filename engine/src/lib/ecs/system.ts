import { Entity } from "./entity";
import { SystemUpdatable } from "./interfaces/system-updatable";

export abstract class System implements SystemUpdatable {

	private name: string = 'System';
	constructor() {	
	}

	protected setName(name: string): void {
		this.name = name;
	}

	getName(): string {
		return this.name;
	}


	abstract update(deltaTime: number, entities: Set<Entity>): void;

}
