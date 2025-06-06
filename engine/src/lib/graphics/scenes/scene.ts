import { UICamera } from "../cameras/ui-camera";
import { BackgroundCamera } from "../cameras/background-camera";
import { ForegroundCamera } from "../cameras/foreground-camera";
import { DebugCamera } from "../cameras/debug-camera";
import { EffectCamera } from "../cameras/effect-camera";
import { WorldCamera } from "../cameras/world-camera";
import {
	BackgroundCameras,
	DebugCameras,
	EffectsCameras,
	ForegroundCameras,
	UICameras,
	WorldCameras,
} from "../cameras/camera-managers";
import { SpriteSystem } from "../sprites/system/sprites-system";
import { PhysicsSystem } from "../../physics/system/physics-system";
import { CollisionSystem } from "../../physics/system/collision-system";
import { ScriptSystem } from "../../scripts/script-system";
import { DebugSystem } from "../../debug/debug-system";
import { ZIndexSortingSystem } from "../render/render-sorting-system";
import { Updatable } from "../../common/interfaces/updatable";
import { System } from "../../ecs/system";
import { Component, ComponentClass } from "../../ecs/component";
import { Entity } from "../../ecs/entity";
import { RenderSystem } from "../render/render-system";
import Vector2 from "../../math/vector2";

export class Scene implements Updatable {
	protected entities: Set<Entity> = new Set();
	protected systems: Set<System> = new Set();
	private _renderer: RenderSystem;

	constructor() {
		this.addSystem(new PhysicsSystem(this)); // 1. Mueve entidades según velocidad/aceleración
		this.addSystem(new CollisionSystem(this)); // 2. Detecta y resuelve colisiones
		this.addSystem(new ScriptSystem(this)); // 3. Ejecuta scripts que pueden reaccionar a colisiones
		this.addSystem(new ZIndexSortingSystem(this)); // 4. Ordena entidades visualmente
		this.addSystem(new SpriteSystem(this)); // 5. Actualiza animaciones/sprites si es necesario
		this.addSystem(new RenderSystem(this)); // 6. Renderiza todo en pantalla
		this.addSystem(new DebugSystem(this)); // 7. Dibuja colisiones, info, etc. encima
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

	update(deltaTime: number): void {
		this.systems.forEach((system) => system.update(deltaTime));
	}

	get renderer() {
		return this._renderer;
	}

	addEntity(entity: Entity): string {
		this.entities.add(entity);
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
		this.entities.delete(entity);
	}

	destroyEntityById(id: string): void {
		this.entities.delete(this.getEntityById(id) as Entity);
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
}
