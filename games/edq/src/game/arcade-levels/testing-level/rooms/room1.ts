import { GameObject } from "engine/common/entities/game-object";
import Vector2 from "engine/math/vector2";
import { createPlayer } from "../../../prefabs/player";
import { RenderLayerTypes } from "engine/graphics/enum/render-layer-types.enum";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { createWeapon } from "../../../prefabs/weapon";
import { WeaponHolder } from "../../../script-components/weapon/weapon";
import { Engine } from "engine";
import { createSoldier } from "../../../prefabs/soldier";
import { DebugMode, DebugTypes } from "engine/debug/debug";
import { Collider } from "engine/physics/components/collider";
import { createSpinesBug } from "../../../prefabs/spines-enemy";
import { Parallax } from "engine/graphics/components/parallax";
import { RenderLayers } from "engine/graphics/render/render-layers";
import { Cameras } from "engine/graphics/cameras/camera-manager";
import { useGameStore } from "../../../../store/store";
import { PlayerSkinComponent } from "../../../script-components/player/player-skin-component";
import { createTailGunner } from "../../../prefabs/tail-gunner";
import { Room } from "../../../levels/room";
import { createGameZone } from "../../../prefabs/game-zone";
import { VIEWPORT_WIDTH_IN_METERS } from "engine/common/constants";
import { TileMap } from "engine/tiles/tilemap";
import type { TileTexture } from "engine/tiles/definitions";

// room to test world, player and enemies
export class Room1 extends Room {
	static readonly id = "room1";

	player: GameObject;
	floor: GameObject;
	wall: GameObject;

	constructor() {
		super();
		Engine.canvas.style.background = "linear-gradient(3deg, rgb(128 3 3), rgb(0, 0, 0))"; // dark red sky
		DebugMode.enabled = true;
		DebugMode.setMode(DebugTypes.ALL);
		Cameras.currentCamera.setFieldOfView(1);

		RenderLayers.setLayerParallax(RenderLayerTypes.Background, new Vector2(0.05, 0.05));
		this.loadWorld();
	}

	updatePlayerSkinFromCustomMenu() {
		useGameStore.subscribe((state) => {
			if (state.currentSkin && this.player) {
				const playerSkinComponent = this.player.getComponent(PlayerSkinComponent);
				if (playerSkinComponent) {
					this.player.getComponent(PlayerSkinComponent).changeSkin(state.currentSkin);
				}
			}
		});
	}

	loadEffects() {
		const effect = new GameObject({
			position: new Vector2(3, 0),
			rotation: 0,
			size: new Vector2(4, 4),
		});
		effect.addComponent(new Parallax(0.8));
		effect.renderLayer = RenderLayerTypes.Effects;

		this.addEntity(effect);
	}

	loadWorld() {
		const tilemap = new TileMap({ scene: this });
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
		const middleRepeatCount = 3;
		const totalMiddleTileCount = middleTileCount * (middleRepeatCount + 1);
		const floorEndX = floorCellSize.x * (1 + totalMiddleTileCount);

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
			worldPosition: new Vector2(floorEndX, 0),
			cellSizeInGameUnits: floorCellSize,
			gridSize: new Vector2(1, 1),
			collidable: true,
			texture: floorEndTexture,
		});

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
		}, new Vector2(floorEndX, 0));
		tilemap.addPattern(groundPattern, new Vector2(0, floorCellSize.y / 2)).fill(3);

		const playerId = this.addEntity(
			createPlayer({
				position: new Vector2(VIEWPORT_WIDTH_IN_METERS, -4),
				skin: useGameStore.getState().currentSkin,
			}),
		);
		this.player = this.getEntityById<GameObject>(playerId);
		createGameZone({
			startPoint: new Vector2(-1, -5),
			endPoint: new Vector2(floorEndX, 0),
			scene: this,
			player:this.player
		});
		const weaponId = this.addEntity(createWeapon(new Vector2(0, 0)));
		const weapon = this.getEntityById<GameObject>(weaponId);
		weapon.setZindex(-1);
		this.player.getComponent(WeaponHolder).attachWeapon(weapon);
		//soldier
		const soldier = createSoldier(new Vector2(40, -3));
		this.addEntity(soldier);

		const spinesBug = createSpinesBug(new Vector2(20, -3));
		this.addEntity(spinesBug);

		const tailGunner = createTailGunner(new Vector2(60, -3));
		this.addEntity(tailGunner);
	}

	loadForeground() {
		const parallaxObject = new GameObject(
			{
				position: new Vector2(0, 0),
				rotation: 0,
				size: new Vector2(2, 2),
			},
			null,
		);
		parallaxObject.renderLayer = RenderLayerTypes.Foreground;
		parallaxObject.addComponent(new Parallax(0.5));
		parallaxObject.addComponent(new Collider(new Vector2(0, 0), new Vector2(2, 2)));
		this.addEntity(parallaxObject);
	}

	loadDebug() {
		const d = new GameObject({
			position: new Vector2(0, 0),
			rotation: 0,
			size: new Vector2(40, 40),
		});
		d.renderLayer = RenderLayerTypes.Debug;

		this.addEntity(d);
	}

	loadUI() {}

	loadBackground() {
		const w = 8;
		const h = 8;
		const x = -4;
		const y = 1;

		for (let i = 0; i < 10; i++) {
			const bg = new GameObject(
				{
					position: new Vector2(x + i * w + i * 0.5, y),
					rotation: 0,
					size: new Vector2(w, h),
				},
				new Sprite({
					image: AssetsManager.getImageByName("spritesheet:city"),
					framePosition: new Vector2(0, 0),
					frameSize: { w: 5000, h: 5000 },
				}),
			);
			bg.addTag("background");
			bg.renderLayer = RenderLayerTypes.Background;
			this.addEntity(bg);
			const bg2 = new GameObject(
				{
					position: new Vector2(x + i * w + i * 0.5, y + 0.5),
					rotation: 0,
					size: new Vector2(w, h),
				},
				new Sprite({
					image: AssetsManager.getImageByName("spritesheet:city"),
					framePosition: new Vector2(0, 0),
					frameSize: { w: 5000, h: 5000 },
				}),
			);
			bg2.addComponent(new Parallax(0.8));
			bg2.addTag("background2");
			bg2.renderLayer = RenderLayerTypes.Background;
			this.addEntity(bg2);
		}
	}
}
