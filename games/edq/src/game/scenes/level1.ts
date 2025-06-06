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

export class Level1 extends GameScene {
	player: GameObject;
	floor: GameObject;
	wall: GameObject;

	constructor() {
		super("Delivery 1", GameSceneLevel.EASY);
		DebugMode.enabled = true;
		this.loadBackground();
		this.loadWorld();
		this.loadForeground();
		this.loadEffects();
		this.loadUI();
		this.loadDebug();
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
				size: new Vector2(100, 5),
			})
		);
		this.floor = this.getEntityById<GameObject>(floorId);
		this.floor.addComponent(new RigidBody(this.floor, BodyType.Static));
		this.floor.addComponent(new Collider(new Vector2(0, 0), new Vector2(100, 5)));
		this.floor.addTag("floor");
		this.floor.getComponent(Collider).ignoreZIndex = true;
		// this.addEntity(createBox(new Vector2(0, 0.5)));
		// this.addEntity(createBox(new Vector2(2, -1.4)));
		// this.addEntity(createBox(new Vector2(2 * 2, -1.4)));

		for (let i = 0; i < 10; i++) {
			this.addEntity(createBox(new Vector2(0.5 * i - 0.02, -1)));
		}

		const playerId = this.addEntity(createPlayer(new Vector2(0, -5)));
		this.player = this.getEntityById<GameObject>(playerId);
	}

	loadForeground() {
		const fg = new GameObject({
			position: new Vector2(1, 1),
			rotation: 0,
			size: new Vector2(4, 4),
		});
		fg.renderLayer = RenderLayerTypes.Foreground;

		this.addEntity(fg);
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
		const bg = new GameObject({
			position: new Vector2(0, 1),
			rotation: 0,
			size: new Vector2(5, 7),
		});
		bg.renderLayer = RenderLayerTypes.Background;

		this.addEntity(bg);
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
		this.testMouse();
	}
}
