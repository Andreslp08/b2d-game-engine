import { Engine } from "engine";
import { TileMap } from "engine/tiles/tilemap";
import type { TiledMapLoadResult } from "engine/tiles/adapters/tiled/tiled-map-adapter";
import { Room } from "../../../levels/room";
import { DebugMode, DebugTypes } from "engine/debug/debug";
import Vector2 from "engine/math/vector2";
import { createPlayer } from "../../../prefabs/player";
import { createSoldier } from "../../../prefabs/soldier";
import { createSpinesBug } from "../../../prefabs/spines-enemy";
import { createTailGunner } from "../../../prefabs/tail-gunner";
import { createWeapon } from "../../../prefabs/weapon";
import { createGameZone } from "../../../prefabs/game-zone";
import { WeaponHolder } from "../../../script-components/weapon/weapon";
import { useGameStore } from "../../../../store/store";

const enemyFactories = {
	Soldier: createSoldier,
	SpinesBug: createSpinesBug,
	TailGunner: createTailGunner,
} as const;

export class Room3 extends Room {
	static readonly id = "room3";
	tiledMap?: TiledMapLoadResult;

	constructor() {
		super();
			Engine.canvas.style.background = "linear-gradient(3deg, rgb(56 79 123), rgb(0, 0, 0))"; // dark blue sky
			// Engine.canvas.style.background = "linear-gradient(3deg, rgb(128 3 3), rgb(0, 0, 0))"; // dark red sky
			DebugMode.enabled = true;
			DebugMode.setMode(DebugTypes.ALL);
		// Cameras.currentCamera.setFieldOfView(1);
		void this.loadWorld();
	}

	private async loadWorld(): Promise<void> {
		try {
			this.tiledMap = await TileMap.generateMapFromTiled(
				this,
				"/assets/maps/map1/room1/test-map.json",
			);

			this.createMapEntities(this.tiledMap);
		} catch (error) {
			console.error("Unable to render Tiled map", error);
		}
	}

	private createMapEntities(map: TiledMapLoadResult): void {
		const playerSpawn = map.objects.find((object) => this.isFromLayer(object, "PlayerSpawnPoint"));
		if (playerSpawn) {
			const player = createPlayer({
				position: this.getSpawnCenter(playerSpawn.position, playerSpawn.size),
				skin: useGameStore.getState().currentSkin,
			});
			this.addEntity(player);

			const weapon = createWeapon(Vector2.ZERO.clone());
			weapon.setZindex(-1);
			this.addEntity(weapon);
			player.getComponent(WeaponHolder).attachWeapon(weapon);

			const map = this.tiledMap;
			const leftBound = map.objects.find((object) => this.isFromLayer(object, "MapBounds") && object.layerProperties.get("side")?.toString()?.toLowerCase() === "left");
			const rightBound = map.objects.find((object) => this.isFromLayer(object, "MapBounds") && object.layerProperties.get("side")?.toString()?.toLowerCase() === "right");
			console.log(	leftBound, rightBound);
				createGameZone({
				startPoint: new Vector2(leftBound.position.x, map.bounds.position.y),
				endPoint: new Vector2(rightBound.position.x, map.bounds.position.y),
				scene: this,
				player,
			});

		}

		for (const enemySpawn of map.objects.filter((object) => this.isFromLayer(object, "EnemySpawnPoint"))) {
			const enemyType = this.getPropertyIgnoringCase(enemySpawn.layerProperties, "EnemyType");
			const factory = typeof enemyType === "string"
				? enemyFactories[enemyType as keyof typeof enemyFactories]
				: undefined;
			if (!factory) {
				console.warn(`Unsupported enemy type '${String(enemyType)}' at Tiled object ${enemySpawn.id}`);
				continue;
			}
			this.addEntity(factory(this.getSpawnCenter(enemySpawn.position, enemySpawn.size)));
		}
	}

	private isFromLayer(
		object: TiledMapLoadResult["objects"][number],
		className: string,
	): boolean {
		return object.className === className || object.layerClassName === className;
	}

	private getSpawnCenter(position: Vector2, size: Vector2): Vector2 {
		return position.clone().add(size.clone().multiplyBy(0.5));
	}

	private getPropertyIgnoringCase(
		properties: ReadonlyMap<string, unknown>,
		name: string,
	): unknown {
		const property = Array.from(properties.entries()).find(([key]) => key.toLowerCase() === name.toLowerCase());
		return property?.[1];
	}
}
