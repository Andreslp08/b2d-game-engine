import { GameObject } from "engine/common/entities/game-object";
import { MouseManager } from "engine/input/mouse-manager";
import Vector2 from "engine/math/vector2";

import { GameScene } from "./game-scene";
import { GameSceneLevel } from "../enum/scene";
import { createBox } from "../prefabs/box";
import { createPlayer } from "../prefabs/player";
import { RenderLayerTypes } from "engine/graphics/enum/render-layer-types.enum";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { createVerticalBounds } from "../prefabs/vertical-bounds";
import { createWeapon } from "../prefabs/weapon";
import { WeaponController, WeaponHolder } from "../script-components/weapon/weapon";
import { Engine } from "engine";
import { createSoldier } from "../prefabs/soldier";
import { DebugMode, DebugTypes } from "engine/debug/debug";
import { Collider } from "engine/physics/components/collider";
import { createSpinesBug } from "../prefabs/spines-enemy";
import { Parallax } from "engine/graphics/components/parallax";
import { RenderLayers } from "engine/graphics/render/render-layers";
import { Cameras } from "engine/graphics/cameras/camera-manager";
import { PlayerSkin } from "../config/constants";

export class Level1 extends GameScene {
	player: GameObject;
	floor: GameObject;
	wall: GameObject;

	constructor() {
		super("Delivery 1", GameSceneLevel.EASY);
		// Engine.canvas.style.background = "linear-gradient(3deg, rgb(56 79 123), rgb(0, 0, 0))"; // dark blue sky
		Engine.canvas.style.background = "linear-gradient(3deg, rgb(128 3 3), rgb(0, 0, 0))"; // dark red sky
		// DebugMode.enabled = true;
		DebugMode.setMode(DebugTypes.ALL);
		Cameras.currentCamera.setFieldOfView(1);

		RenderLayers.setLayerParallax(RenderLayerTypes.Background, new Vector2(0.05, 0.05));
		this.loadBackground();
		this.loadWorld();
		// this.loadForeground();
		// this.loadEffects();
		// this.loadUI();
		// this.loadDebug();
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
		const leftWallId = this.addEntity(
			createVerticalBounds(
				{ position: new Vector2(-10, 0), size: new Vector2(3, 1000), rotation: 0 },
				"left",
			),
		);
		const leftWall = this.getEntityById<GameObject>(leftWallId);

		const rightWallId = this.addEntity(
			createVerticalBounds(
				{ position: new Vector2(2000, 0), size: new Vector2(3, 1000), rotation: 0 },
				"right",
			),
		);
		const rightWall = this.getEntityById<GameObject>(rightWallId);

		for (let i = 0; i < 50; i++) {
			for (let j = 0; j < 5; j++) {
				this.addEntity(createBox(new Vector2((j + 10) * 0.7 + i * 2, i * -2.8)));
			}
		}

		for (let i = 0; i < 200; i++) {
			const box = createBox(new Vector2((i - 20) * 0.7, 1).multiplyBy(1));
			box.getComponent(Collider).ignoreZIndex = true;
			this.addEntity(box);
		}

		const playerId = this.addEntity(
			createPlayer({ position: new Vector2(0, -4), skin: PlayerSkin.SKIN1 }),
		);
		this.player = this.getEntityById<GameObject>(playerId);
		// setTimeout(() => {
		// 	this.player.transform.position = new Vector2(0, -199);
		// }, 2000);

		const weaponId = this.addEntity(createWeapon(new Vector2(0, 0)));
		const weapon = this.getEntityById<GameObject>(weaponId);
		weapon.setZindex(-1);
		this.player.getComponent(WeaponHolder).attachWeapon(weapon);
		//soldier
		const soldier = createSoldier(new Vector2(20, -3));
		this.addEntity(soldier);

		const spinesBug = createSpinesBug(new Vector2(-5, -3));
		this.addEntity(spinesBug);

		// // // TEST DE RENDIMIENTO
		// const go = Array.from({ length: 10000 }, (_, index) => {
		// 	const g = new GameObject({
		// 		position: new Vector2(index * 0.5, 0),
		// 		rotation: 0,
		// 		size: new Vector2(1, 1),
		// 	}, new Sprite({ image: AssetsManager.getImageByName("spritesheet:box"), framePosition: new Vector2(0, 0), frameSize: { w: 500, h: 500 } }));
		// 	g.addComponent(new Collider(new Vector2(0, 0), new Vector2(1, 1)));
		// 	return g;
		// });
		// go.forEach((g) => this.addEntity(g));
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

	testMouse() {
		const mouseWorldPosition = this.camera.getWorldPositionFromScreenPosition(
			MouseManager.getRelativePosition(),
		);
		if (!mouseWorldPosition) return;
		const mouseX = mouseWorldPosition.x;
		const mouseY = mouseWorldPosition.y;

		// console.log('mouse ',MouseManager.getPosition())
		// console.log("mouse world", MouseManager.getWorldPosition(this));
		const playerLeft = this.player.transform.position.x - this.player.transform.size.x / 2;
		const playerRight = this.player.transform.position.x + this.player.transform.size.x / 2;
		const playerTop = this.player.transform.position.y - this.player.transform.size.y / 2;
		const playerBottom = this.player.transform.position.y + this.player.transform.size.y / 2;
		if (
			mouseX >= playerLeft &&
			mouseX <= playerRight &&
			mouseY >= playerTop &&
			mouseY <= playerBottom
		) {
			console.log("oki");
		}
	}
}
