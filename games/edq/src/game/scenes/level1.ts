import { GameObject } from "engine/common/entities/game-object";
import { Camera } from "engine/graphics/cameras/camera";
import { SpriteAnimation } from "engine/graphics/sprites/components/sprite-animation";
import { SpriteSystem } from "engine/graphics/sprites/system/sprites-system";
import { MouseManager } from "engine/input/mouse-manager";
import Vector2 from "engine/math/vector2";
import { Collider } from "engine/physics/components/collider";
import { RigidBody } from "engine/physics/components/rigid-body";
import { PhysicsSystem } from "engine/physics/system/physics-system";
import { BasicMovement } from "engine/starter-kit/2d-scroll/components/basic-movement";
import { Character } from "engine/starter-kit/2d-scroll/entities/character";
import { CollisionResolutionSystem } from "engine/physics/system/collision-resolution-system";
import { CollisionSystem } from "engine/physics/system/collision-system";
import { BasicMovementSystem } from "engine/starter-kit/2d-scroll/system/movement-system";
import { PlayerIdle } from "../sprite-sequences";
import { GameScene } from "./game-scene";
import { GameSceneLevel } from "../enum/scene";


export class Level1 extends GameScene {
	player: Character;
	floor: GameObject;
	wall: GameObject;

	constructor() {
		super("Delivery 1",GameSceneLevel.EASY);
		this.camera = new Camera(new Vector2(0, 0), this);

		const floorId = this.addEntity(
			new GameObject({
				position: new Vector2(0, 2.6),
				rotation: 0,
				size: new Vector2(100, 5),
			})
		);
		this.floor = this.getEntityById<GameObject>(floorId);
		this.floor.addTag("floor");

		const wallId = this.addEntity(
			new GameObject({
				position: new Vector2(1, 2),
				rotation: 0,
				size: new Vector2(0.4, 0.4),
			})
		);
		this.wall = this.getEntityById<GameObject>(wallId);
		this.wall.addTag("wall");

		const playerId = this.addEntity(
			new Character({
				position: new Vector2(0, 0),
				rotation: 0,
				size: new Vector2(0.8, 1),
			})
		);
		this.player = this.getEntityById<Character>(playerId);
		this.player.addTag("player");
		this.player.addComponent(new SpriteAnimation(PlayerIdle, this.player, true));
		const playerBody = this.player.getComponent(RigidBody);
		const playerMovement = this.player.getComponent(BasicMovement);
		playerBody.mass = 80;
		playerBody.friction = 500;
		playerBody.dragScale = 50;
		playerMovement.forceX = 4000;
		playerMovement.forceY = 80000;
		this.player.getComponent(Collider).setSize(new Vector2(0.5, this.player.transform.size.y));
		this.player.getComponent(Collider).setOffsetPosition(new Vector2(0, 0));
		this.addSystem(new BasicMovementSystem());
		this.addSystem(new SpriteSystem());
		this.addSystem(new PhysicsSystem());
		this.addSystem(new CollisionSystem());
		this.addSystem(new CollisionResolutionSystem());
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
		this.camera.setPosition(this.player.transform.position);
		this.testMouse();
	}

	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
		super.render(canvas, context);
		const mouseWorldPosition = MouseManager.getWorldPosition(this);
		context.fillStyle = "#00f";
		context.beginPath();
		context.arc(mouseWorldPosition.x, mouseWorldPosition.y, 0.1, 0, Math.PI * 2); // Radio en metros
		context.fill();
	}
}
