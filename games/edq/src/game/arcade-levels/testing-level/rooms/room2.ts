import { Engine } from "engine";
import { TileMap } from "engine/tiles/tilemap";
import type { TiledMapLoadResult } from "engine/tiles/adapters/tiled/tiled-map-adapter";
import { Room } from "../../../levels/room";
import { DebugMode, DebugTypes } from "engine/debug/debug";
import { createPlayer } from "../../../prefabs/player";
import { createMapGameZone } from "../../../prefabs/game-zone";
import { useGameStore } from "../../../../store/store";
import { PlayerInputController } from "../../../script-components/player/player-input-controller";
import type { GameObject } from "engine/common/entities/game-object";
import { MarkerType } from "../../../config/constants";
import { createTeleport } from "../../../prefabs/teleport";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { PlayerMovement } from "../../../script-components/player/player-movement";
import { isFromLayer } from "../../../util/map-layer";
import { generatePlayerSpawnPointFromMap } from "../../../util/spawn-player";
import { createCameraNavigator } from "engine/graphics/cameras/camera-navigator";
import { createPickup } from "../../../prefabs/pickup";
import Vector2 from "engine/math/vector2";
import { Transform } from "engine/common/components/transform";
import type { WeaponDefinition } from "../../../items/definitions/item-definition";
import { itemRegistry } from "../../../items/item-catalog";
import { DialogueManager } from "../../../dialogue/dialogue-manager";
import { createDialogueArea } from "../../../prefabs/dialogue-area";

export class Room2 extends Room {
	static readonly id = "room2";
	tiledMap?: TiledMapLoadResult;
	player?: GameObject;
	dialogueManager?: DialogueManager;

	async load(): Promise<void> {
		// Engine.canvas.style.background = "linear-gradient(3deg, rgb(56 79 123), rgb(0, 0, 0))"; // dark blue sky
		Engine.canvas.style.background = "linear-gradient(3deg, rgb(128 3 3), rgb(0, 0, 0))"; // dark red sky
		DebugMode.enabled = false;
		DebugMode.setMode(DebugTypes.TRIGGER_AREAS);

		try {
			this.tiledMap = await TileMap.generateMapFromTiled(
				this,
				"/assets/maps/map1/room1/test-map2.json",
			);
		} catch (error) {
			console.error("Unable to render Tiled map", error);
		}

		this.dialogueManager = new DialogueManager({
			scene: this,
			dialogues: [
				{
					id: "test",
					lines: [
						{
							text: "Lorem ipsum dolor sit amet consectetur. Est vitae sed nec laoreet vitae vel aenean at tellus. Donec phasellus ultricies orci at diam netus dignissim eu nisi. Sem nulla eu felis aliquam fusce curabitur vel arcu ac. Egestas leo condimentum at nunc nisi sed mauris.",
							speakerName: "Smoke",
						},
						{
							text: "You got something for me?",
							speakerName: "Smoke",
						},
					],
				},
				{
					id: "test2",
					lines: [
						{
							text: "hi Smoke!",
							speakerName: "Boss",
						},
						{
							text: "Yes, I got something for you.",
							speakerName: "Boss",
						},
					],
				},
			],
		});

	}

	spawn(): void {
		if (!this.tiledMap) return;
		this.createPlayer(this.tiledMap);
		this.createTeleports(this.tiledMap);
		this.onFadeFinished.subscribe(() => {
			this.enablePlayerInput(this.player, true);
		});
		this.createPickups();
		this.createDialogueArea();
	}

	private createPickups() {
		itemRegistry.getAll().forEach((itemDefinition, i) => {
			const pickup = createPickup({
				scene: this,
				position: new Vector2(10, -1)
					.clone()
					.add(new Vector2(2, 0))
					.add(new Vector2(i * 2, 0)),
				amount: itemDefinition.stackable ? 3 : 1,
				definition: itemDefinition,
			});
			this.addEntity(pickup);
		});
	}

	private createDialogueArea(): void {
		if (!this.player || !this.dialogueManager) return;
		createDialogueArea({
			scene: this,
			position: this.player.transform.position.clone().add(new Vector2(2, 0)),
			size: new Vector2(2, 2),
			promptText: "Speak with Boss",
			dialogueManager: this.dialogueManager,
			playerFacingDirection: "right",
		});
	}

	private createTeleports(map: TiledMapLoadResult) {
		const teleports = map.objects.filter((object) => isFromLayer(object, "Teleport"));
		if (!teleports.length) return;

		for (const teleport of teleports) {
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

	private enablePlayerInput(player: GameObject, enable: boolean) {
		const playerInput = player.getComponent(PlayerInputController);
		if (playerInput) {
			if (enable) playerInput.enableAll();
			else playerInput.disableAll();
		}
	}

	private createPlayer(map: TiledMapLoadResult) {
		const mapBounds = map.objects.find((object) => isFromLayer(object, "MapBounds"));

		const spawnPoint = generatePlayerSpawnPointFromMap({
			map,
			roomLoadContext: this.getLoadContext(),
		});

		const player = createPlayer({
			scene: this,
			position: spawnPoint.position,
			skin: useGameStore.getState().currentSkin,
		}) as GameObject;
		this.player = player;
		this.enablePlayerInput(player, false);
		this.addEntity(player);
		const direction = spawnPoint.facingDirection === "left" ? -1 : 1;
		player.getComponent(PlayerMovement).direction.x = direction;
		player.getComponent(DynamicBody).direction.x = direction;

		if (!mapBounds) {
			console.warn("Room2 requires a MapBounds object to constrain the player and camera.");
			return;
		}

		createMapGameZone({ bounds: mapBounds, scene: this, player });
	}
}
