import { GameObject } from "engine/common/entities/game-object";
import Vector2 from "engine/math/vector2";
import { RenderLayerTypes } from "engine/graphics/enum/render-layer-types.enum";
import { Engine } from "engine";
import { DebugMode, DebugTypes } from "engine/debug/debug";
import { RenderLayers } from "engine/graphics/render/render-layers";
import { Cameras } from "engine/graphics/cameras/camera-manager";
import { createCameraNavigator } from "engine/graphics/cameras/camera-navigator";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { TileMap } from "engine/tiles/tilemap";
import type { TileTexture } from "engine/tiles/definitions";
import { Room } from "../../../levels/room";
import { VIEWPORT_WIDTH_IN_METERS } from "engine/common/constants";

// room to test tilemap
export class Room2 extends Room {
	static readonly id = "room2";

	player: GameObject;
	floor: GameObject;
	wall: GameObject;

	constructor() {
		super();
		Engine.canvas.style.background = "linear-gradient(3deg, rgb(56 79 123), rgb(0, 0, 0))"; // dark blue sky
		// Engine.canvas.style.background = "linear-gradient(3deg, rgb(128 3 3), rgb(0, 0, 0))"; // dark red sky
		DebugMode.enabled = false;
		DebugMode.setMode(DebugTypes.ALL);
		Cameras.currentCamera.setFieldOfView(1);
		RenderLayers.setLayerParallax(RenderLayerTypes.Background, new Vector2(0.05, 0.05));
		this.loadWorld();
	}

	loadWorld() {
		const tilemap = new TileMap({
			scene: this,
		});
		this.addEntity(createCameraNavigator());

		const terrainImage = AssetsManager.getImageByName("spritesheet:terrain-tiles");

		const floorStartTexture: TileTexture = {
			framePosition: new Vector2(0, 0),
			frameSize: { w: 500, h: 500 },
			image: terrainImage,
		};
		const floorMiddleTexture: TileTexture = {
			framePosition: new Vector2(500, 0),
			frameSize: { w: 500, h: 500 },
			image: terrainImage,
		};
		const floorEndTexture: TileTexture = {
			framePosition: new Vector2(1000, 0),
			frameSize: { w: 500, h: 500 },
			image: terrainImage,
		};

		const groundStartTexture: TileTexture = {
			framePosition: new Vector2(0, 500),
			frameSize: { w: 500, h: 500 },
			image: terrainImage,
		};
		const groundMiddleTexture: TileTexture = {
			framePosition: new Vector2(500, 500),
			frameSize: { w: 500, h: 500 },
			image: terrainImage,
		};
		const groundEndTexture: TileTexture = {
			framePosition: new Vector2(1000, 500),
			frameSize: { w: 500, h: 500 },
			image: terrainImage,
		};

		const floorCellSize = new Vector2(1, 1);
		const middleTileCount = VIEWPORT_WIDTH_IN_METERS;
		const middleRepeatCount = 20;

		tilemap.addChunk({
			worldPosition: new Vector2(0, 0),
			cellSizeInGameUnits: floorCellSize,
			gridSize: new Vector2(1, 1),
			collidable: true,
			texture: floorStartTexture,
		});
		tilemap
			.addChunk({
				worldPosition: new Vector2(floorCellSize.x, 0),
				cellSizeInGameUnits: floorCellSize,
				gridSize: new Vector2(middleTileCount, 1),
				collidable: true,
				texture: floorMiddleTexture,
			})
			.repeat(middleRepeatCount, "horizontal");
		tilemap.addChunk({
			worldPosition: new Vector2(
				floorCellSize.x * (1 + middleTileCount * (middleRepeatCount + 1)),
				0,
			),
			cellSizeInGameUnits: floorCellSize,
			gridSize: new Vector2(1, 1),
			collidable: true,
			texture: floorEndTexture,
		});

		const groundY = floorCellSize.y / 2;
		const totalMiddleTileCount = middleTileCount * (middleRepeatCount + 1);
		const groundPattern = tilemap.createPattern();
		groundPattern.add({
			worldPosition: new Vector2(0, 0),
			cellSizeInGameUnits: floorCellSize,
			gridSize: new Vector2(1, 1),
			collidable: false,
			texture: groundStartTexture,
		}, new Vector2(0, 0));

		for (let index = 0; index <= middleRepeatCount; index++) {
			groundPattern.add({
				worldPosition: new Vector2(0, 0),
				cellSizeInGameUnits: floorCellSize,
				gridSize: new Vector2(middleTileCount, 1),
				collidable: false,
				texture: groundMiddleTexture,
			}, new Vector2(floorCellSize.x * (1 + middleTileCount * index), 0));
		}

		groundPattern.add({
			worldPosition: new Vector2(0, 0),
			cellSizeInGameUnits: floorCellSize,
			gridSize: new Vector2(1, 1),
			collidable: false,
			texture: groundEndTexture,
		}, new Vector2(floorCellSize.x * (1 + totalMiddleTileCount), 0));

		tilemap.addPattern(groundPattern, new Vector2(0, groundY)).fill(3);

		// const boxSize = new Vector2(0.7, 0.7);

		// const collidableFloor = new TileChunk({
		// 	worldPosition: new Vector2(0, 0),
		// 	cellSizeInGameUnits: boxSize,
		// 	gridSize: new Vector2(16, 1),
		// 	collidable: true,
		// 	texture: floorTexture,
		// });
		// const notCollidableFloor = new TileChunk({
		// 	worldPosition: new Vector2(0, boxSize.y),
		// 	cellSizeInGameUnits: boxSize,
		// 	gridSize: new Vector2(16, 1),
		// 	collidable: false,
		// 	texture: floorTexture,
		// });

		// tilemap
		// 	.addChunk(collidableFloor, 100, "horizontal")
		// 	.addChunk(notCollidableFloor, 100, "horizontal")
		// 	.fill(3);

		// const stairPattern = tilemap
		// 	.createPattern()
		// 	.add(collidableFloor, new Vector2(6, -3))
		// 	.add(collidableFloor, new Vector2(8, -6));

		// tilemap.addPattern(stairPattern, new Vector2(0, 0));

		// const cityTexture: TileTexture = {
		// 	framePosition: new Vector2(0, 0),
		// 	frameSize: { w: 5000, h: 5000 },
		// 	image: AssetsManager.getImageByName("spritesheet:city"),
		// };

		// const city = new TileChunk({
		// 	worldPosition: new Vector2(-10, 0),
		// 	cellSizeInGameUnits: new Vector2(10, 10),
		// 	gridSize: new Vector2(2, 1),
		// 	collidable: false,
		// 	texture: cityTexture,
		// 	renderLayer: RenderLayerTypes.Background,
		// });
		// tilemap.addChunk(city).repeat(20, "horizontal");

		console.log("tilemap bounds", tilemap.getBounds());
	}
}
