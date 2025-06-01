import { Scene } from "./graphics/scenes/scene";
import { KeyBoardManager } from "./input/interfaces/keyboard-manager";
import { Screen } from "./graphics/screen/screen";
import { MouseManager } from "./input/mouse-manager";
import { Camera } from "./graphics/cameras/camera";

let lastTime = 0;
let accFrameMs = 0;
const frameRate = 60;
const frameMs = 1000 / frameRate;

export class Engine {
	public static canvas: HTMLCanvasElement;
	public static context: CanvasRenderingContext2D;
	private scene: Scene;
	public static pause: boolean = false;
	public static camera: Camera;
	public static GameRoot: HTMLDivElement;

	constructor() {
		const gameRoot = document.getElementById("game-root") as HTMLDivElement;

		if (!gameRoot) {
			throw new Error(
				"'game-root' div not found in html, game cannot be loaded. Add a div in the html with id 'game-root', engine will load the game in this div."
			);
		}
		gameRoot.style.display = "flex";
		gameRoot.style.justifyContent = "center";
		gameRoot.style.alignItems = "center";
		gameRoot.style.backgroundColor = "#000";

		Engine.GameRoot = gameRoot;
		const canvas: HTMLCanvasElement = document.createElement("canvas");
		canvas.id = "game-canvas";
		canvas.width = 0;
		canvas.height = 0;
		gameRoot.innerHTML = "";
		gameRoot.appendChild(canvas);
		KeyBoardManager.listen();
		MouseManager.listen();
		Engine.canvas = canvas;
		Engine.context = Engine.canvas.getContext("2d");
		Screen.getInstance().setCanvasBackgroundColor("rgb(30 30 30)");
		this.loop = this.loop.bind(this);
	}

	public init() {
		window.requestAnimationFrame((time) => {
			lastTime = time;
			this.loop(time);
		});
	}

	public setScene(scene: Scene) {
		this.scene = scene;
	}

	private loop(currentTime: number = 0): void {
		const dt = currentTime - lastTime; // en milisegundos
		lastTime += dt;
		accFrameMs += dt;

		while (accFrameMs > frameMs) {
			//update logic
			accFrameMs -= frameMs;
			if (!Engine.pause) {
				if(this.scene){
					this.scene.update(frameMs / 1000);
				}
				// Aquí es donde lo pasamos como segundos (dividir entre 1000)
			}
		}
		Engine.canvas.getContext("2d").clearRect(0, 0, Engine.canvas.width, Engine.canvas.height);
		// //render
		if (this.scene && this.scene.camera) {
			this.scene.camera.render(Engine.canvas, Engine.context);
		}
		window.requestAnimationFrame(this.loop);
	}
}
