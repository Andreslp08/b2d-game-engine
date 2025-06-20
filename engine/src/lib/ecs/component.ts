import { Tags } from "../common/tags";
import { Entity } from "./entity";

export type ComponentClass<T extends Component> = new (...args: any[]) => T;

export abstract class Component {
	readonly tags: Tags;
	protected entity: Entity;
	protected zIndex: number = 1;
	protected unique: boolean = true;
	debugMode: boolean = false;

	constructor() {
		this.tags = new Tags();
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
}
