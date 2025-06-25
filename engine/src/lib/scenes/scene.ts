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
import { ZIndexSortingSystem } from "../graphics/render/render-sorting-system";
import { Updatable } from "../common/interfaces/updatable";
import { System } from "../ecs/system";
import { Component, ComponentClass } from "../ecs/component";
import { Entity } from "../ecs/entity";
import { RenderSystem } from "../graphics/render/render-system";
import Vector2 from "../math/vector2";
import { ScriptComponent } from "../scripts/script-component";
import { CullingSystem } from "../performance/culling-system";

export class Scene implements Updatable {
	protected entities: Set<Entity> = new Set();
	protected systems: Set<System> = new Set();
	private _renderer: RenderSystem;
	private renderFilters: string = "";

	constructor() {
		this.addSystem(new CullingSystem(this));
		this.addSystem(new ScriptSystem(this));
		this.addSystem(new PhysicsSystem(this));
		this.addSystem(new ZIndexSortingSystem(this));
		this.addSystem(new SpriteAnimationSystem(this));
		this.addSystem(new DebugSystem(this));
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

	addEntity(entity: Entity): string {
		this.entities.add(entity);
		entity.setScene(this);
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
		entity.getComponents(ScriptComponent).forEach((script) => script.onDestroy());
		entity.deleteAllComponent();
		this.entities.delete(entity);
		entity.setScene(null);
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

	sortEntitiesByZIndex(): void {
		const entities = Array.from(this.entities).sort((a, b) => a.getZindex() - b.getZindex());
		this.entities = new Set(entities);
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
