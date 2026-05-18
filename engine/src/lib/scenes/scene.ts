import { Cameras } from "../graphics/cameras/camera-manager";
import { OrthographicCamera } from "../graphics/cameras/orthographic-camera";
import { RenderLayers } from "../graphics/render/render-layers";
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
import { ParticleSystem } from "../particle-system/system";
import { TriggerAreaSystem } from "../trigger-area/system/trigger-area-system";

/**
 * Represents a game scene that manages entities, systems, and cameras.
 * Each scene contains its own ECS context, renderer, and lifecycle.
 */
export class Scene implements Updatable {
	protected entities: Set<Entity> = new Set();
	protected indexedEntitiesByComponents: Map<ComponentClass<Component>, Entity[]> = new Map();
	protected systems: Set<System> = new Set();
	private _renderer: RenderSystem | null;
	private renderFilters: string = "";
	private destroyed = false;

	constructor() {
		this.addSystem(new CullingSystem(this));
		this.addSystem(new ScriptSystem(this));
		this.addSystem(new PhysicsSystem(this));
		this.addSystem(new TriggerAreaSystem(this));
		this.addSystem(new SpriteAnimationSystem(this));
		this.addSystem(new DebugSystem(this));
		this.addSystem(new ParticleSystem(this));
		// this.addSystem(new TileMapSystem(this));
		this.addSystem(new RenderSystem(this));
		this._renderer = Array.from(this.systems).find(
			(s) => s instanceof RenderSystem && s.getName() === "RenderSystem"
		) as RenderSystem;
		RenderLayers.reset();
		Cameras.removeAllCameras();
		const worldCamera = new OrthographicCamera(new Vector2(0, 0), this, "world");
		Cameras.setCurrentCamera(worldCamera);

		const uiCamera = new OrthographicCamera(new Vector2(0, 0), this, "screen");
		Cameras.setCurrentScreenCamera(uiCamera);
	}

	/**
	 * Updates all systems in the scene every frame.
	 */
	update(): void {
		this.systems.forEach((system) => system.update());
	}

	/**
	 * Updates all systems at a fixed time step (useful for physics).
	 */
	fixedUpdate(): void {
		this.systems.forEach((system) => system.fixedUpdate());
	}

	/**
	 * Destroys the scene, removing all entities, clearing systems and cameras.
	 */
	destroy(): void {
		if (this.destroyed) return;
		this.destroyed = true;

		const entities = Array.from(this.entities);
		for (const entity of entities) {
			this.destroyEntity(entity);
		}

		this.indexedEntitiesByComponents.clear();
		this.systems.clear();
		this._renderer = null;
		this.renderFilters = "";
		RenderLayers.reset();
		Cameras.removeAllCameras();
	}

	/**
	 * The render system used by this scene, if any.
	 */
	get renderer() {
		return this._renderer;
	}

	/**
	 * Indexes an entity by all of its component types (including inherited ones).
	 * @param entity - The entity to index.
	 */
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

	/**
	 * Removes an entity from the component index. If specific components are provided,
	 * only those are unindexed; otherwise the entity is fully unindexed.
	 * @param entity - The entity to unindex.
	 * @param components - Optional list of specific component types to unindex.
	 */
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

	/**
	 * Adds an entity to the scene and indexes its components.
	 * @param entity - The entity to add.
	 * @returns The entity's unique id.
	 */
	addEntity(entity: Entity): string {
		if (!entity) {
			throw new Error("Entity is null");
		}
		this.entities.add(entity);
		entity.setScene(this);
		this.indexEntity(entity);
		return entity.id;
	}

	/**
	 * Finds an entity by its unique id.
	 * @template T - The expected entity type.
	 * @param id - The entity id to search for.
	 * @returns The entity if found, or null.
	 */
	getEntityById<T>(id: string): T | null {
		for (const entity of this.entities) {
			if (entity.id === id) {
				return entity as T;
			}
		}
		return null;
	}

	/**
	 * Finds the first entity with the given tag.
	 * @template T - The expected entity type.
	 * @param tag - The tag to search for.
	 * @returns The entity if found, or null.
	 */
	getEntityByTag<T>(tag: string): T | null {
		for (const entity of this.entities) {
			if (entity.hasTag(tag)) {
				return entity as T;
			}
		}
		return null;
	}

	/**
	 * Destroys an entity, removing it from the scene and clearing its components.
	 * @param entity - The entity to destroy.
	 */
	destroyEntity(entity: Entity): void {
		if (!entity) return;
		entity.getComponents(ScriptComponent).forEach((script) => script.onDestroy());
		entity.deleteAllComponents();
		this.entities.delete(entity);
		entity.setScene(null);
		this.unindexEntity(entity);
	}

	/**
	 * Destroys an entity by its unique id.
	 * @param id - The id of the entity to destroy.
	 */
	destroyEntityById(id: string): void {
		this.destroyEntity(this.getEntityById(id) as Entity);
	}

	/**
	 * Adds a system to the scene.
	 * @param system - The system to add.
	 * @returns The system's name.
	 */
	addSystem(system: System): string {
		this.systems.add(system);
		return system.getName();
	}

	/**
	 * Gets a system by its name.
	 * @param name - The system name to search for.
	 * @returns The system if found, or null.
	 */
	getSystemByName(name: string): System | null {
		for (const system of this.systems) {
			if (system.getName() === name) {
				return system;
			}
		}
		return null;
	}

	/**
	 * Removes a system from the scene by its name.
	 * @param name - The name of the system to remove.
	 */
	destroySystemByName(name: string): void {
		this.systems.delete(this.getSystemByName(name) as System);
	}

	/**
	 * Removes a system from the scene.
	 * @param system - The system to remove.
	 */
	destroySystem(system: System): void {
		this.systems.delete(system);
	}

	/**
	 * Returns all entities that have a specific component type.
	 * @template T - The component type.
	 * @param componentClass - The component class to filter by.
	 */
	getEntitiesWithComponent<T extends Component>(componentClass: ComponentClass<T>): Entity[] {
		return Array.from(this.entities).filter((e) => e.hasComponent(componentClass));
	}

	/**
	 * Returns all entities in the scene as an array.
	 */
	getEntitiesAsArray(): Entity[] {
		return Array.from(this.entities);
	}

	/**
	 * Returns the raw Set of all entities in the scene.
	 */
	getEntities(): Set<Entity> {
		return this.entities;
	}

	/**
	 * Returns entities that have all the specified component types (intersection).
	 * Uses indexed lookups for efficiency, with fallback to linear search for small sets.
	 * @param components - The list of required component types.
	 */
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

/**
 * Returns entities matching a flexible query with optional all/any/none filters.
 * Uses the component index for efficient lookups.
 * @param all - Entities must have all of these components (intersection).
 * @param any - Entities must have at least one of these components (union).
 * @param none - Entities must not have any of these components (exclusion).
 */
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
	/**
	 * Returns the internal entity-by-component index map.
	 */
	getIndexedEntitiesByComponents(): Map<ComponentClass<Component>, Entity[]> {
		return this.indexedEntitiesByComponents;
	}

	/**
	 * The current active camera for this scene.
	 */
	get camera(): OrthographicCamera {
		return Cameras.currentCamera as OrthographicCamera;
	}

	/**
	 * Sets the active camera for this scene. If the camera is not registered, it is added.
	 * @param camera - The camera to set as active.
	 */
	setCamera(camera: OrthographicCamera) {
		// if not has camera add an then set it
		const hasCamera = Cameras.hasCamera(camera);
		if (!hasCamera) {
			Cameras.addCamera(camera);
			Cameras.setCurrentCamera(camera);
		} else {
			Cameras.setCurrentCamera(camera);
		}
	}

	/**
	 * Returns the current active camera.
	 */
	getCurrentCamera() {
		return Cameras.currentCamera;
	}

	/**
	 * Returns all registered cameras.
	 */
	getCameras() {
		return Cameras.cameras;
	}

	/**
	 * Removes a specific camera from the scene.
	 * @param camera - The camera to remove.
	 */
	removeCamera(camera: OrthographicCamera) {
		Cameras.removeCamera(camera);
	}

	/**
	 * Removes all cameras from the scene.
	 */
	removeAllCameras() {
		Cameras.removeAllCameras();
	}

	/**
	 * Sets render filter tags for this scene.
	 * @param filters - The filter string to apply.
	 */
	setRenderFilters(filters: string) {
		this.renderFilters = filters;
	}

	/**
	 * Returns the current render filter tags.
	 */
	getRenderFilters() {
		return this.renderFilters;
	}
}
