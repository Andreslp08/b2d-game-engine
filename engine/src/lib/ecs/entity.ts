import { Tags } from "../common/tags";
import { Component, ComponentClass } from "./component";
import { RenderLayerTypes } from "../graphics/enum/render-layer-types.enum";

export class Entity {
	private static idIncrementator: number = 0;
	readonly id: string;
	protected components: Set<Component>;
	protected tags: Tags;
	protected _renderLayer: RenderLayerTypes;
	protected zIndex: number = 1;

	constructor() {
		this.id = `entity-${Entity.idIncrementator}`;
		Entity.idIncrementator++;
		this.components = new Set();
		this.tags = new Tags();
		this.addTag("entity");
	}

	get renderLayer(): RenderLayerTypes {
		return this._renderLayer;
	}

	set renderLayer(renderLayer: RenderLayerTypes) {
		this._renderLayer = renderLayer;
	}

	setZindex(zIndex: number): void {
		this.zIndex = zIndex;
	}

	getZindex(): number {
		return this.zIndex;
	}

	getComponent<T extends Component>(component: ComponentClass<T>): T | null {
		let c = null;
		for (const iterator of this.components) {
			if (iterator instanceof component) {
				c = iterator;
				break;
			}
		}
		return c;
	}

	hasComponent<T extends Component>(component: ComponentClass<T>): boolean {
		let has = false;
		for (const iterator of this.components) {
			if (iterator instanceof component) {
				has = true;
				break;
			}
		}
		return has;
	}

	addComponent(component: Component) {
		if (!component) {
			throw new Error("Cannot add null component");
		}
		this.components.add(component);
		component.setEntity(this);
	}

	getComponents<T extends Component>(componentClass: ComponentClass<T>): T[] {
		return Array.from(this.components).filter((c): c is T => c instanceof componentClass);
	}

	getAllComponents(): Component[] {
		return Array.from(this.components);
	}

	deleteAllComponent(): void {
		this.components = new Set();
	}

	deleteComponent<T extends Component>(component: ComponentClass<T>): void {
		for (const iterator of this.components) {
			if (iterator instanceof component) {
				this.components.delete(iterator);
			}
		}
	}

	addTag(tag: string): void {
		this.tags.add(tag);
	}

	removeTag(tag: string): void {
		this.tags.remove(tag);
	}

	hasTag(tag: string): boolean {
		return this.tags.has(tag);
	}

	getTags(): string[] {
		return this.tags.getall();
	}
}
