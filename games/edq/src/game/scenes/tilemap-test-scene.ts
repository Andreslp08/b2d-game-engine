import { GameObject } from "engine/common/entities/game-object";
import Vector2 from "engine/math/vector2";
import { GameScene, type GameSceneInfo } from "./game-scene";
import { GameSceneDifficultyLevel } from "../enum/scene";
import { RenderLayerTypes } from "engine/graphics/enum/render-layer-types.enum";
import { Engine } from "engine";
import { DebugMode, DebugTypes } from "engine/debug/debug";
import { RenderLayers } from "engine/graphics/render/render-layers";
import { Cameras } from "engine/graphics/cameras/camera-manager";
import { createCameraNavigator } from "engine/graphics/cameras/camera-navigator";
import { TileChunk } from "engine/tiles/tile-chunk-object";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import { SpriteSheet } from "engine/graphics/sprites/spritesheet";
import { VIEWPORT_HEIGHT_IN_METERS, VIEWPORT_WIDTH_IN_METERS } from "engine/common/constants";
import { TileMap } from "engine/tiles/tilemap";
import { createPlayer } from "../prefabs/player";
import { PlayerSkin } from "../config/constants";
import { useGameStore } from "../../store/store";
import { createWeapon } from "../prefabs/weapon";
import { WeaponHolder } from "../script-components/weapon/weapon";
import { createVerticalBounds } from "../prefabs/vertical-bounds";
import type { TileTexture } from "engine/tiles/definitions";

export class TileMapTestScene extends GameScene {
	static readonly info: GameSceneInfo = {
		displayName: "Tilemap test",
		description: "This is a test scene",
		difficultyLevel: GameSceneDifficultyLevel.EASY,
	} as const;

	player: GameObject;
	floor: GameObject;
	wall: GameObject;

	constructor() {
		super();
		Engine.canvas.style.background = "linear-gradient(3deg, rgb(56 79 123), rgb(0, 0, 0))"; // dark blue sky
		// Engine.canvas.style.background = "linear-gradient(3deg, rgb(128 3 3), rgb(0, 0, 0))"; // dark red sky
		DebugMode.enabled = true;
		DebugMode.setMode(DebugTypes.ALL);
		Cameras.currentCamera.setFieldOfView(1);
		RenderLayers.setLayerParallax(RenderLayerTypes.Background, new Vector2(0.05, 0.05));
		this.loadWorld();
	}

	loadWorld() {
		const leftWallId = this.addEntity(
			createVerticalBounds(
				{ position: new Vector2(-1, 0), size: new Vector2(3, 1000), rotation: 0 },
				"left",
			),
		);

		const rightWallId = this.addEntity(
			createVerticalBounds(
				{ position: new Vector2(2000, 0), size: new Vector2(3, 1000), rotation: 0 },
				"right",
			),
		);

		// const playerId = this.addEntity(
		// 	createPlayer({
		// 		position: new Vector2(VIEWPORT_HEIGHT_IN_METERS, -1.5),
		// 		skin: useGameStore.getState().currentSkin,
		// 	}),
		// );
		// this.player = this.getEntityById<GameObject>(playerId);

		// const weaponId = this.addEntity(createWeapon(new Vector2(0, 0)));
		// const weapon = this.getEntityById<GameObject>(weaponId);
		// weapon.setZindex(-1);
		// this.player.getComponent(WeaponHolder).attachWeapon(weapon);

		const tilemap = new TileMap({
			scene: this,
		});
		this.addEntity(createCameraNavigator());

		const boxTexture: TileTexture = {
			framePosition: new Vector2(0, 0),
				frameSize: { w: 500, h: 500 },
				image: AssetsManager.getImageByName("spritesheet:box"),
		}

		const boxSize = new Vector2(0.7, 0.7);

		const collidableFloor = new TileChunk({
			worldPosition: new Vector2(0, 0),
			cellSizeInGameUnits: boxSize,
			gridSize: new Vector2(16, 1),
			collidable: true,
			texture: boxTexture,
		});
		const notCollidableFloor = new TileChunk({
			worldPosition: new Vector2(0, boxSize.y),
			cellSizeInGameUnits: boxSize,
			gridSize: new Vector2(16, 1),
			collidable: false,
			texture: boxTexture,
		});

		tilemap
		.addChunk(collidableFloor, 100, "horizontal")
		.addChunk(notCollidableFloor, 100, "horizontal").fill(3)

		const stairPattern = tilemap
			.createPattern()
			.add(collidableFloor, new Vector2(6, -3))
			.add(collidableFloor, new Vector2(8, -6))
		

		tilemap.addPattern(stairPattern, new Vector2(0, 0))

		const cityTexture: TileTexture = {
			framePosition: new Vector2(0, 0),
				frameSize: { w: 5000, h: 5000 },
				image: AssetsManager.getImageByName("spritesheet:city"),
		}


		const city = new TileChunk({
				worldPosition: new Vector2(-10, 0),
				cellSizeInGameUnits: new Vector2(10, 10),
				gridSize: new Vector2(2, 1),
				collidable: false,
				texture: cityTexture,
				renderLayer: RenderLayerTypes.Background,
			})
		tilemap.addChunk(
			city
		).repeat(20, "horizontal")
		
		console.log('tilemap bounds', tilemap.getBounds());
	}
}
