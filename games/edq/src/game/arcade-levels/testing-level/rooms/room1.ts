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
import { createMapGameZone } from "../../../prefabs/game-zone";
import { WeaponHolder } from "../../../script-components/weapon/weapon";
import { useGameStore } from "../../../../store/store";
import { createToxicWater } from "../../../prefabs/toxic-water";
import { PlayerController } from "../../../script-components/player/player-controller";
import type { GameObject } from "engine/common/entities/game-object";
import {  MarkerType } from "../../../config/constants";
import { Collider } from "engine/physics/components/collider";
import { createTeleport } from "../../../prefabs/teleport";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { PlayerMovement } from "../../../script-components/player/player-movement";
import { isFromLayer } from "../../../util/map-layer";
import { generatePlayerSpawnPointFromMap } from "../../../util/spawn-player";
import { createCameraNavigator } from "engine/graphics/cameras/camera-navigator";

const enemyFactories = {
	Soldier: createSoldier,
	SpinesBug: createSpinesBug,
	TailGunner: createTailGunner,
} as const;
export class Room1 extends Room {
	static readonly id = "room1";
	tiledMap?: TiledMapLoadResult;
	player?: GameObject;

	async load(): Promise<void> {
		Engine.canvas.style.background = "linear-gradient(3deg, rgb(56 79 123), rgb(0, 0, 0))"; // dark blue sky
		// Engine.canvas.style.background = "linear-gradient(3deg, rgb(128 3 3), rgb(0, 0, 0))"; // dark red sky
		DebugMode.enabled = true;
		DebugMode.setMode(DebugTypes.TRIGGER_AREAS);

		try {
			this.tiledMap = await TileMap.generateMapFromTiled(
				this,
				"/assets/maps/map1/room1/test-map.json",
			);
		} catch (error) {
			console.error("Unable to render Tiled map", error);
		}
		// this.addEntity(createCameraNavigator());
	}

	spawn(): void {
		if (!this.tiledMap) return;

		this.createPlayer(this.tiledMap);
		this.createMapEnemies(this.tiledMap);
		this.createToxicWaterAreas(this.tiledMap);
		this.createTeleports(this.tiledMap);
		this.onFadeFinished.subscribe(() => {
			this.enablePlayerInput(this.player, true);
		});
	}

	private createTeleports(map: TiledMapLoadResult) {
		const teleports = map.objects.filter((object) => isFromLayer(object, "Teleport"));
		if (!teleports.length) return;

		for (const teleport of teleports) {
			console.log(teleport.properties);
			this.addEntity(
				createTeleport({
					position: teleport.position.clone().add(teleport.size.clone().multiplyBy(0.5)),
					size: teleport.size,
					levelId: teleport.properties.get("levelId") as string,
					roomId: teleport.properties.get("roomId") as string,
					markerType: teleport.properties.get("markerType") as MarkerType,
					arrowDirection: teleport.properties.get("direction") as any,
					loadContext: {
						spawnPointId: teleport.properties.get("spawnPointId") as string | undefined,
					},
				}),
			);
		}
	}

	private createToxicWaterAreas(map: TiledMapLoadResult): void {
		const areas = map.objects.filter((object) => isFromLayer(object, "ToxicWater"));

		if (!areas.length) return;

		// this.addEntity(createToxicWater({
		// 		position: new Vector2(20, 0),
		// 		size: new Vector2(8,1),
		// 	}));

		for (const area of areas) {
			this.addEntity(
				createToxicWater({
					position: area.position.clone().add(area.size.clone().multiplyBy(0.5)),
					size: area.size,
				}),
			);
		}
	}

	private enablePlayerInput(player: GameObject, enable: boolean) {
		const playerController = player.getComponent(PlayerController);
		if (playerController) {
			playerController.enableInputController = enable;
		}
	}

	private createPlayer(map: TiledMapLoadResult) {
		const mapBounds = map.objects.find((object) => isFromLayer(object, "MapBounds"));
		const spawnPoint = generatePlayerSpawnPointFromMap({
			map,
			roomLoadContext: this.getLoadContext(),
		});

		const player = createPlayer({
			position: spawnPoint.position,
			skin: useGameStore.getState().currentSkin,
		}) as GameObject;
		this.player = player;
		this.enablePlayerInput(player, false);
		this.addEntity(player);
		const direction = spawnPoint.facingDirection === "left" ? -1 : 1;
		player.getComponent(PlayerMovement).direction.x = direction;
		player.getComponent(DynamicBody).direction.x = direction;
		const weapon = createWeapon(Vector2.ZERO.clone());
		weapon.setZindex(-1);
		this.addEntity(weapon);
		player.getComponent(WeaponHolder).attachWeapon(weapon);

		if (!mapBounds) {
			console.warn("Room1 requires a MapBounds object to constrain the player and camera.");
			return;
		}

		createMapGameZone({ bounds: mapBounds, scene: this, player });
	}

	private createMapEnemies(map: TiledMapLoadResult): void {
		const createEnemies = () => {
			for (const enemySpawn of map.objects.filter((object) =>
				isFromLayer(object, "EnemySpawnPoint"),
			)) {
				const enemyType = this.getPropertyIgnoringCase(
					enemySpawn.layerProperties,
					"EnemyType",
				);
				const factory =
					typeof enemyType === "string"
						? enemyFactories[enemyType as keyof typeof enemyFactories]
						: undefined;
				if (!factory) {
					console.warn(
						`Unsupported enemy type '${String(enemyType)}' at Tiled object ${enemySpawn.id}`,
					);
					continue;
				}
				const enemy = factory(this.getSpawnCenter(enemySpawn.position, enemySpawn.size));
				this.placeOnSpawnFloor(enemy, enemySpawn);
				this.addEntity(enemy);
			}
		};

		createEnemies();
	}

	private getSpawnCenter(position: Vector2, size: Vector2): Vector2 {
		return position.clone().add(size.clone().multiplyBy(0.5));
	}

	private placeOnSpawnFloor(
		enemy: GameObject,
		spawn: TiledMapLoadResult["objects"][number],
	): void {
		const collider = enemy.getComponent(Collider);
		if (!collider) return;

		const floorY = spawn.position.y + spawn.size.y;
		enemy.transform.position.y =
			floorY - collider.getOffsetPosition().y - collider.getSize().y / 2;
	}

	private getPropertyIgnoringCase(
		properties: ReadonlyMap<string, unknown>,
		name: string,
	): unknown {
		const property = Array.from(properties.entries()).find(
			([key]) => key.toLowerCase() === name.toLowerCase(),
		);
		return property?.[1];
	}
}
