import { Tags } from "../common/tags";
import { Entity } from "./entity";

export type ComponentClass<T extends Component> = new (...args: any[]) => T;

export abstract class Component {
	private static idIncrementator: number = 0;
	readonly id: string;
	readonly tags: Tags;
	protected entity: Entity;
	protected zIndex: number = 1;
	protected unique: boolean = true;
	debugMode: boolean = false;

	constructor() {
		this.tags = new Tags();
		this.id = `component-${Component.idIncrementator}`;
		Component.idIncrementator++;
	}

	setZindex(zIndex: number) {
		this.zIndex = zIndex;
	}

	getZindex(): number {
		return this.zIndex;
	}

	setEntity(entity: Entity) {
		this.entity = entity;
	}

	getEntity(): Entity {
		return this.entity;
	}

	isUnique(): boolean {
		return this.unique;
	}

	getId() {
		return this.id;
	}
}
