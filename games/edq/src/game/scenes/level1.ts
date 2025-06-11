import { GameObject } from "engine/common/entities/game-object";
import { MouseManager } from "engine/input/mouse-manager";
import Vector2 from "engine/math/vector2";

import { GameScene } from "./game-scene";
import { GameSceneLevel } from "../enum/scene";
import { createBox } from "../prefabs/box";
import { createPlayer } from "../prefabs/player";
import { Collider } from "engine/physics/components/collider";
import { BodyType } from "engine/physics/enum/body-type";
import { RenderLayerTypes } from "engine/graphics/enum/render-layer-types.enum";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { createVerticalBounds } from "../prefabs/vertical-bounds";
import { createWeapon } from "../prefabs/weapon";
import { WeaponHolder } from "../script-components/weapon";
import { Engine } from "engine";
import { PlayerController } from "../script-components/player-controller";
import { createBullet } from "../prefabs/bullet";
import { DebugMode } from "engine/debug/debug";
import { StaticBody } from "engine/physics/components/static-body";
import { PlayerHud } from "../hud/hud";
import { BasicMovement } from "../script-components/basic-movement";

export class Level1 extends GameScene {
	player: GameObject;
	floor: GameObject;
	wall: GameObject;

	constructor() {
		super("Delivery 1", GameSceneLevel.EASY);
		Engine.canvas.style.background = "linear-gradient(3deg, rgb(56 79 123), rgb(0, 0, 0))";
		// DebugMode.enabled = true;
		this.loadBackground();	
		this.loadWorld();
		// this.loadForeground();
		// this.loadEffects();
		this.loadUI();
		// this.loadDebug();
	}

	loadEffects() {
		const effect = new GameObject({
			position: new Vector2(3, 0),
			rotation: 0,
			size: new Vector2(4, 4),
		});
		effect.renderLayer = RenderLayerTypes.Effects;

		this.addEntity(effect);
	}

	loadWorld() {
		const leftWallId = this.addEntity(
			createVerticalBounds({position: new Vector2(-10, 0), size: new Vector2(3, 1000), rotation: 0}, "left"),
		)
		const leftWall = this.getEntityById<GameObject>(leftWallId);

		const rightWallId = this.addEntity(
			createVerticalBounds({position: new Vector2(2000, 0), size: new Vector2(3, 1000), rotation: 0}, "right"),
		)
		const rightWall = this.getEntityById<GameObject>(rightWallId);

	

		// const floorId = this.addEntity(
		// 	new GameObject({
		// 		position: new Vector2(0, 3.2),
		// 		rotation: 0,
		// 		size: new Vector2(1000, 5),
		// 	})
		// );
		// this.floor = this.getEntityById<GameObject>(floorId);
		// this.floor.addComponent(new StaticBody(this.floor));
		// this.floor.addComponent(new Collider(new Vector2(0, 0), new Vector2(1000, 5)));
		// this.floor.addTag("floor");
		// this.floor.getComponent(Collider).ignoreZIndex = true;
		// this.addEntity(createBox(new Vector2(0, 0.5)));
		// this.addEntity(createBox(new Vector2(2, -1.4)));
		// this.addEntity(createBox(new Vector2(2 * 2, -1.4)));

		for(let i = 0; i < 50; i++) {
			for(let j = 0; j < 5; j++) {
				this.addEntity(createBox(new Vector2((j+10)*0.5+i*2, i * -2)));
			}
		}

		for(let i = 0; i < 200; i++) {
				this.addEntity(createBox(new Vector2((i-20)*0.5,1).multiplyBy(1)));
		}
	


		const playerId = this.addEntity(createPlayer(new Vector2(0, -2)));
		this.player = this.getEntityById<GameObject>(playerId);
		
		const weaponId = this.addEntity(createWeapon(new Vector2(0, 0)));
		const weapon = this.getEntityById<GameObject>(weaponId);
		this.player.getComponent(WeaponHolder).attachWeapon(weapon);

		// player 2 
		const player2 = createPlayer(new Vector2( 10, 0));
		// player2.deleteComponent(PlayerController)
		player2.getComponent(BasicMovement).inputKeys.left = "ArrowLeft";
		player2.getComponent(BasicMovement).inputKeys.right = "ArrowRight";
		player2.getComponent(BasicMovement).inputKeys.up = "ArrowUp";
		player2.deleteComponent(PlayerController)
		player2.deleteComponent(PlayerHud)
		this.addEntity(player2);
	}

	loadForeground() {
		// const fg = new GameObject({
		// 	position: new Vector2(-2, -0.5),
		// 	rotation: 0,
		// 	size: new Vector2(7,7),
		// }, new Sprite("city", AssetsManager.getImage("/assets/textures/city.png"), {
		// 	position: new Vector2(0, 0),
		// 	rotation: 0,
		// 	size: new Vector2(5000, 5000),
		// }));
		// fg.renderLayer = RenderLayerTypes.Foreground;
		// this.addEntity(fg);
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

	loadUI() {
	
	}

	loadBackground() {
		const w = 8;
		const h = 8;
		const x = -4;
		const y =1;

		for (let i = 0; i < 10; i++) {
			const bg = new GameObject(
				{
					position: new Vector2((x +(i * w))+i*0.5, y),
					rotation: 0,
					size: new Vector2(w, h),
				},
				new Sprite("city", AssetsManager.getImage("/assets/textures/city.png"), {
					position: new Vector2(0, 0),
					rotation: 0,
					size: new Vector2(5000, 5000),
				})
			);
			bg.renderLayer = RenderLayerTypes.Background;

			this.addEntity(bg);
		}
	}

	testMouse() {
		const mouseX = MouseManager.getWorldPosition(this).x;
		const mouseY = MouseManager.getWorldPosition(this).y;

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
