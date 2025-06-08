import { BasicMovement } from './../script-components/basic-movement';
import { GameObject } from "engine/common/entities/game-object";
import { MouseManager } from "engine/input/mouse-manager";
import Vector2 from "engine/math/vector2";

import { GameScene } from "./game-scene";
import { GameSceneLevel } from "../enum/scene";
// import { Box } from "../`scripts/box";
import { UIObject } from "engine/ui/entities/ui-object";
import { createBox } from "../prefabs/box";
import { createPlayer } from "../prefabs/player";
import { DebugMode } from "engine/debug/debug";
import { Collider } from "engine/physics/components/collider";
import { RigidBody } from "engine/physics/components/rigid-body";
import { BodyType } from "engine/physics/enum/body-type";
import { RenderLayerTypes } from "engine/graphics/enum/render-layer-types.enum";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { PlayerController } from "../script-components/player-controller";
import { MathUtil } from 'engine/math/math-util';


let time = 0;
export class Level1 extends GameScene {
	player: GameObject;
	floor: GameObject;
	wall: GameObject;

	constructor() {
		super("Delivery 1", GameSceneLevel.EASY);
		DebugMode.enabled = true;
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
		effect.renderLayer = RenderLayerTypes.Effects;

		this.addEntity(effect);
	}

	loadWorld() {
		const floorId = this.addEntity(
			new GameObject({
				position: new Vector2(0, 2.6),
				rotation: 0,
				size: new Vector2(1000, 5),
			})
		);
		this.floor = this.getEntityById<GameObject>(floorId);
		this.floor.addComponent(new RigidBody(this.floor, BodyType.Static));
		this.floor.addComponent(new Collider(new Vector2(0, 0), new Vector2(1000, 5)));
		this.floor.addTag("floor");
		this.floor.getComponent(Collider).ignoreZIndex = true;
		// this.addEntity(createBox(new Vector2(0, 0.5)));
		// this.addEntity(createBox(new Vector2(2, -1.4)));
		// this.addEntity(createBox(new Vector2(2 * 2, -1.4)));

		for (let i = 0; i < 10; i++) {
			if(i > 3){
				this.addEntity(createBox(new Vector2((i+i*1) , -1.5)));
			}else{
				this.addEntity(createBox(new Vector2((0.5*i) , -1.5)));
			}
		}


		const playerId = this.addEntity(createPlayer(new Vector2(0, -5)));
		this.player = this.getEntityById<GameObject>(playerId);
		const boxid = this.addEntity(createPlayer(new Vector2(-1, -5)));
		const box =this.getEntityById<GameObject>(boxid);
		const movement = box.getComponent(BasicMovement);
		movement.inputKeys.right = "ArrowRight";
		movement.inputKeys.left = "ArrowLeft";
		movement.inputKeys.up = "ArrowUp";
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
		this.addEntity(
			new UIObject({ position: new Vector2(0, 0), rotation: 0, size: new Vector2(500, 500) })
		);
	}

	loadBackground() {
		const w = 8;
		const h = 8;
		const x = -4;
		const y = 1;

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
	update(deltaTime: number): void {
		super.update(deltaTime);
		this.camera.setPosition(
			this.player.transform.position.clone().substract(new Vector2(0, 1))
		);
		time += deltaTime;
		const t =  Math.abs(Math.cos(time * Math.PI/2));
		// if(t > 1 || t < 0) t = 0;
		// cos(rad) fade
		

		const alpha = MathUtil.lerp(0, 1,t);
		this.camera.fadeCamera(false, alpha, "#000");
		this.testMouse();
	}
}
