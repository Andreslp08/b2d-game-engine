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
import { createToxicWater } from "../../../prefabs/toxic-water";
import { PlayerController } from "../../../script-components/player/player-controller";
import type { GameObject } from "engine/common/entities/game-object";
import { PlayerCameraController } from "../../../script-components/player/player-camera-controller";
import { GAME_FOV } from "../../../config/constants";
import { VIEWPORT_WIDTH_IN_WORLD_UNITS } from "engine/common/constants";

const enemyFactories = {
	Soldier: createSoldier,
	SpinesBug: createSpinesBug,
	TailGunner: createTailGunner,
} as const;
const INITIAL_CAMERA_LEFT_X = -5;

export class Room3 extends Room {
	static readonly id = "room3";
	tiledMap?: TiledMapLoadResult;
	player?: GameObject;

	constructor() {
		super();
		Engine.canvas.style.background = "linear-gradient(3deg, rgb(56 79 123), rgb(0, 0, 0))"; // dark blue sky
		// Engine.canvas.style.background = "linear-gradient(3deg, rgb(128 3 3), rgb(0, 0, 0))"; // dark red sky
		DebugMode.enabled = true;
		DebugMode.setMode(DebugTypes.TRIGGER_AREAS);
		void this.loadWorld();
		console.log('static camera created')
		this.onFadeFinished.subscribe(() => {
			this.enablePlayerInput(this.player, true);
		});
	}

	private async loadWorld(): Promise<void> {
		try {
			this.tiledMap = await TileMap.generateMapFromTiled(
				this,
				"/assets/maps/map1/room1/test-map.json",
			);
			// this.addEntity(createCameraNavigator());
			this.createPlayer(this.tiledMap);
			this.createMapEnemies(this.tiledMap);
			this.createToxicWaterAreas(this.tiledMap);
		} catch (error) {
			console.error("Unable to render Tiled map", error);
		}
	}

	private createToxicWaterAreas(map: TiledMapLoadResult): void {
		const areas = map.objects.filter((object) => this.isFromLayer(object, "ToxicWater"));

		if (!areas.length) return;

		// this.addEntity(createToxicWater({
		// 		position: new Vector2(20, 0),
		// 		size: new Vector2(8,1),
		// 	}));

		for (const area of areas) {
			console.log('toxic water',area)
			this.addEntity(createToxicWater({
				position: area.position.clone().add(area.size.clone().multiplyBy(0.5)),
				size: area.size,
			}));
		}
	}

	private enablePlayerInput(player:GameObject, enable: boolean){
		const playerController = player.getComponent(PlayerController);
		if(playerController){
			playerController.enableInputController = enable;
		}

	}

	private createPlayer(map: TiledMapLoadResult) {
		
		const playerSpawn = map.objects.find((object) =>
			this.isFromLayer(object, "PlayerSpawnPoint"),
		);
		if (playerSpawn) {
			const player = createPlayer({
				position: this.getSpawnCenter(playerSpawn.position, playerSpawn.size),
				skin: useGameStore.getState().currentSkin,
			}) as GameObject;
			this.player = player;
			const playerCameraController = this.player.getComponent(PlayerCameraController);
			if (playerCameraController) {
				const halfViewportWidth = VIEWPORT_WIDTH_IN_WORLD_UNITS / 2;
				const intitialCameraPosition = new Vector2(
					INITIAL_CAMERA_LEFT_X + halfViewportWidth + halfViewportWidth / GAME_FOV,
					-player.transform.size.y,
				);
				playerCameraController.initialCameraPosition = intitialCameraPosition;
				playerCameraController.createCamera();
				playerCameraController.playerCamera.setFieldOfView(GAME_FOV);
			}
			this.enablePlayerInput(player,false)
			this.addEntity(player);

			const weapon = createWeapon(Vector2.ZERO.clone());
			weapon.setZindex(-1);
			this.addEntity(weapon);
			player.getComponent(WeaponHolder).attachWeapon(weapon);

			const map = this.tiledMap;
			const leftBound = map.objects.find(
				(object) =>
					this.isFromLayer(object, "MapBounds") &&
					object.layerProperties.get("side")?.toString()?.toLowerCase() === "left",
			);
			const rightBound = map.objects.find(
				(object) =>
					this.isFromLayer(object, "MapBounds") &&
					object.layerProperties.get("side")?.toString()?.toLowerCase() === "right",
			);
			console.log(leftBound, rightBound);
			createGameZone({
				startPoint: new Vector2(leftBound.position.x, map.bounds.position.y),
				endPoint: new Vector2(rightBound.position.x, map.bounds.position.y),
				scene: this,
				player,
			});
		}
	}

	private createMapEnemies(map: TiledMapLoadResult): void {
		const createEnemies = () => {
			for (const enemySpawn of map.objects.filter((object) =>
				this.isFromLayer(object, "EnemySpawnPoint"),
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
				this.addEntity(factory(this.getSpawnCenter(enemySpawn.position, enemySpawn.size)));
			}
		};

		createEnemies();
	}

	private isFromLayer(object: TiledMapLoadResult["objects"][number], className: string): boolean {
		return object.className === className || object.layerClassName === className;
	}

	private getSpawnCenter(position: Vector2, size: Vector2): Vector2 {
		return position.clone().add(size.clone().multiplyBy(0.5));
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
