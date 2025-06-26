import { UICamera } from "../graphics/cameras/ui-camera";
import { BackgroundCamera } from "../graphics/cameras/background-camera";
import { ForegroundCamera } from "../graphics/cameras/foreground-camera";
import { DebugCamera } from "../graphics/cameras/debug-camera";
import { EffectCamera } from "../graphics/cameras/effect-camera";
import { WorldCamera } from "../graphics/cameras/world-camera";
import {
	BackgroundCameras,
	DebugCameras,
	EffectsCameras,
	ForegroundCameras,
	UICameras,
	WorldCameras,
} from "../graphics/cameras/camera-managers";
import { SpriteAnimationSystem } from "../graphics/sprites/system/sprite-animation-system";
import { PhysicsSystem } from "../physics/system/physics-system";
import { ScriptSystem } from "../scripts/script-system";
import { DebugSystem } from "../debug/debug-system";
import { Updatable } from "../common/interfaces/updatable";
import { System } from "../ecs/system";
import { Component, ComponentClass } from "../ecs/component";
import { Entity } from "../ecs/entity";
import { RenderSystem } from "../graphics/render/render-system";
import Vector2 from "../math/vector2";
import { ScriptComponent } from "../scripts/script-component";
import { CullingSystem } from "../performance/culling-system";
import { TileMapSystem } from "../tiles/tilemap-system";

export class Scene implements Updatable {
	protected entities: Set<Entity> = new Set();
	protected indexedEntitiesByComponents: Map<ComponentClass<Component>, Entity[]> = new Map();
	protected systems: Set<System> = new Set();
	private _renderer: RenderSystem;
	private renderFilters: string = "";

	constructor() {
		this.addSystem(new CullingSystem(this));
		this.addSystem(new ScriptSystem(this));
		this.addSystem(new PhysicsSystem(this));
		this.addSystem(new SpriteAnimationSystem(this));
		this.addSystem(new DebugSystem(this));
		// this.addSystem(new TileMapSystem(this));
		this.addSystem(new RenderSystem(this));
		this._renderer = Array.from(this.systems).find(
			(s) => s instanceof RenderSystem && s.getName() === "RenderSystem"
		) as RenderSystem;
		BackgroundCameras.removeAllCameras();
		WorldCameras.removeAllCameras();
		ForegroundCameras.removeAllCameras();
		EffectsCameras.removeAllCameras();
		UICameras.removeAllCameras();
		DebugCameras.removeAllCameras();
		const backgroundCamera = new BackgroundCamera(this);
		BackgroundCameras.addCamera(backgroundCamera);
		BackgroundCameras.setCurrentCamera(backgroundCamera);
		const worldCamera = new WorldCamera(new Vector2(0, 0), this);
		WorldCameras.addCamera(worldCamera);
		WorldCameras.setCurrentCamera(worldCamera);
		const foregroundCamera = new ForegroundCamera(this);
		ForegroundCameras.addCamera(foregroundCamera);
		ForegroundCameras.setCurrentCamera(foregroundCamera);
		const effectCamera = new EffectCamera(this);
		EffectsCameras.addCamera(effectCamera);
		EffectsCameras.setCurrentCamera(effectCamera);
		const uiCamera = new UICamera(this);
		UICameras.addCamera(uiCamera);
		UICameras.setCurrentCamera(uiCamera);
		const debugCamera = new DebugCamera(this);
		DebugCameras.addCamera(debugCamera);
		DebugCameras.setCurrentCamera(debugCamera);
	}

	update(): void {
		this.systems.forEach((system) => system.update());
	}

	fixedUpdate(): void {
		this.systems.forEach((system) => system.fixedUpdate());
	}

	get renderer() {
		return this._renderer;
	}

	indexEntity(entity: Entity): void {
		for (const component of entity.getAllComponents()) {
			let proto = component.constructor;

			while (proto && proto.name !== "Object") {
				const compClass = proto as ComponentClass<Component>;

				if (!this.indexedEntitiesByComponents.has(compClass)) {
					this.indexedEntitiesByComponents.set(compClass, []);
				}

				const list = this.indexedEntitiesByComponents.get(compClass);
				if (!list.includes(entity)) {
					list.push(entity);
				}

				proto = Object.getPrototypeOf(proto);
			}
		}
	}

	unindexEntity(entity: Entity, components?: ComponentClass<Component>[]): void {
		// 🔹 Si se pasan componentes específicos, solo procesamos esos
		if (components) {
			for (const component of components) {
				// Solo lo quitamos del índice si el entity ya NO tiene más de ese tipo
				if (!entity.hasComponent(component)) {
					const list = this.indexedEntitiesByComponents.get(component);
					if (list) {
						const index = list.indexOf(entity);
						if (index !== -1) {
							list.splice(index, 1);
						}
					}
				}
			}
			return;
		}

		// 🔹 Si no se pasan componentes: desindexar completamente (respetando herencia)
		for (const component of entity.getAllComponents()) {
			let proto = component.constructor;

			while (proto && proto.name !== "Object") {
				const compClass = proto as ComponentClass<Component>;

				// Verificar si ya no quedan más instancias de este tipo
				if (!entity.hasComponent(compClass)) {
					const list = this.indexedEntitiesByComponents.get(compClass);
					if (list) {
						const index = list.indexOf(entity);
						if (index !== -1) {
							list.splice(index, 1);
						}
					}
				}

				proto = Object.getPrototypeOf(proto);
			}
		}
	}

	addEntity(entity: Entity): string {
		if (!entity) {
			throw new Error("Entity is null");
		}
		this.entities.add(entity);
		entity.setScene(this);
		this.indexEntity(entity);
		return entity.id;
	}

	getEntityById<T>(id: string): T | null {
		for (const entity of this.entities) {
			if (entity.id === id) {
				return entity as T;
			}
		}
		return null;
	}

	getEntityByTag<T>(tag: string): T | null {
		for (const entity of this.entities) {
			if (entity.hasTag(tag)) {
				return entity as T;
			}
		}
		return null;
	}

	destroyEntity(entity: Entity): void {
		if (!entity) return;
		entity.getComponents(ScriptComponent).forEach((script) => script.onDestroy());
		entity.deleteAllComponents();
		this.entities.delete(entity);
		entity.setScene(null);
		this.unindexEntity(entity);
	}

	destroyEntityById(id: string): void {
		this.destroyEntity(this.getEntityById(id) as Entity);
	}

	addSystem(system: System): string {
		this.systems.add(system);
		return system.getName();
	}

	getSystemByName(name: string): System | null {
		for (const system of this.systems) {
			if (system.getName() === name) {
				return system;
			}
		}
		return null;
	}

	destroySystemByName(name: string): void {
		this.systems.delete(this.getSystemByName(name) as System);
	}

	destroySystem(system: System): void {
		this.systems.delete(system);
	}

	getEntitiesWithComponent<T extends Component>(componentClass: ComponentClass<T>): Entity[] {
		return Array.from(this.entities).filter((e) => e.hasComponent(componentClass));
	}

	getEntitiesAsArray(): Entity[] {
		return Array.from(this.entities);
	}

	getEntities(): Set<Entity> {
		return this.entities;
	}

	getEntitiesByComponents(components: ComponentClass<Component>[]): Entity[] {
		if (components.length === 0) return [];

		if (components.length === 1) {
			// Evitamos ordenamiento, filtros, Sets, etc.
			return this.indexedEntitiesByComponents.get(components[0]) ?? [];
		}

		// No hacemos sort. Vamos cruzando la intersección desde el principio.
		const [first, ...rest] = components;
		let result = this.indexedEntitiesByComponents.get(first);
		if (!result) return [];

		for (let i = 0; i < rest.length; i++) {
			const current = this.indexedEntitiesByComponents.get(rest[i]);
			if (!current) return [];

			// Evitamos usar Set si las listas son pequeñas
			if (result.length < 32) {
				result = result.filter((e) => current.includes(e));
			} else {
				const currentSet = new Set(current);
				result = result.filter((e) => currentSet.has(e));
			}
		}

		return result;
	}

getEntitiesByQuery({
	all = [],
	any = [],
	none = [],
}: {
	all?: ComponentClass<Component>[];
	any?: ComponentClass<Component>[];
	none?: ComponentClass<Component>[];
}): Entity[] {
	const indexed = this.indexedEntitiesByComponents;

	// Si hay ALL: hacemos intersección de todos
	let result: Entity[];
	if (all.length > 0) {
		const sortedAll = [...all].sort(
			(a, b) => (indexed.get(a)?.length ?? 0) - (indexed.get(b)?.length ?? 0)
		);

		result = indexed.get(sortedAll[0])?.slice() ?? [];

		for (let i = 1; i < sortedAll.length; i++) {
			const set = new Set(indexed.get(sortedAll[i]) ?? []);
			result = result.filter((e) => set.has(e));
		}
	} else if (any.length > 0) {
		// Si no hay ALL pero sí ANY: hacemos unión
		result = Array.from(new Set(any.flatMap((comp) => indexed.get(comp) ?? [])));
	} else {
		// Si no hay ALL ni ANY: usamos todos los entities conocidos
		const entitySet = new Set<Entity>();
		for (const list of indexed.values()) {
			for (const entity of list) {
				entitySet.add(entity);
			}
		}
		result = Array.from(entitySet);
	}

	// Aplicar filtro NONE
	if (none.length > 0) {
		const noneSet = new Set(none.flatMap((comp) => indexed.get(comp) ?? []));
		result = result.filter((e) => !noneSet.has(e));
	}

	return result;
}
	getIndexedEntitiesByComponents(): Map<ComponentClass<Component>, Entity[]> {
		return this.indexedEntitiesByComponents;
	}

	get camera(): WorldCamera {
		return WorldCameras.currentCamera as WorldCamera;
	}

	setCamera(camera: WorldCamera) {
		// if not has camera add an then set it
		const hasCamera = WorldCameras.hasCamera(camera);
		if (!hasCamera) {
			WorldCameras.addCamera(camera);
			WorldCameras.setCurrentCamera(camera);
		} else {
			WorldCameras.setCurrentCamera(camera);
		}
	}

	getCurrentCamera() {
		return WorldCameras.currentCamera;
	}

	getCameras() {
		return WorldCameras.cameras;
	}

	removeCamera(camera: WorldCamera) {
		WorldCameras.removeCamera(camera);
	}

	removeAllCameras() {
		WorldCameras.removeAllCameras();
	}

	setRenderFilters(filters: string) {
		this.renderFilters = filters;
	}

	getRenderFilters() {
		return this.renderFilters;
	}
}
