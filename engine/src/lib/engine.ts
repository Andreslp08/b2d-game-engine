import { Scene } from "./graphics/scenes/scene";
import { KeyBoardManager } from "./input/interfaces/keyboard-manager";
import { Screen } from "./graphics/screen/screen";
import { MouseManager } from "./input/mouse-manager";

let lastTime = 0;
let accFrameMs = 0;
const frameRate = 60;
const frameMs = 1000 / frameRate;
let requestAnimationFrame;

export class Engine {
	private static _canvas: HTMLCanvasElement;
	private static _context: CanvasRenderingContext2D;
	private scene: Scene;
	private static _isRunning: boolean = false;
	private static _isPaused: boolean = false;
	private static _gameRoot: HTMLDivElement;

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

		Engine._gameRoot = gameRoot;
		const canvas: HTMLCanvasElement = document.createElement("canvas");
		canvas.id = "game-canvas";
		canvas.width = 0;
		canvas.height = 0;
		gameRoot.innerHTML = "";
		gameRoot.appendChild(canvas);
		KeyBoardManager.listen();
		MouseManager.listen();
		Engine._canvas = canvas;
		Engine._context = Engine._canvas.getContext("2d");
		Screen.getInstance().setCanvasBackgroundColor("rgb(30 30 30)");
		this.loop = this.loop.bind(this);
	}


	public start() {
		Engine._isRunning = true;
		Engine._isPaused = false;
		requestAnimationFrame = window.requestAnimationFrame((time) => {
			lastTime = time;
			this.loop(time);
		});
	}

	public stop() {
		Engine._isRunning = false;
		Engine._isPaused = false;
		lastTime = 0;
		if (requestAnimationFrame) {
			window.cancelAnimationFrame(requestAnimationFrame);
		}
		this.clearCanvas();
		this.setScene(null);
	}

	public pause() {
		Engine._isPaused = true;
	}

	public resume() {
		Engine._isPaused = false;
	}

	public static get isRunning(): boolean {
		return Engine._isRunning;
	}
	public static get isPaused(): boolean {
		return Engine._isPaused;
	}

	public static get canvas() {
		return Engine._canvas;
	}

	public static get context() {
		return Engine._context;
	}

	public static get gameRoot() {
		return Engine._gameRoot;
	}

	public setScene(scene: Scene) {
		this.scene = scene;
	}

	public getScene() {
		return this.scene;
	}

	private clearCanvas() {
		Engine._canvas
			.getContext("2d")
			.clearRect(0, 0, Engine._canvas.width, Engine._canvas.height);
	}

	private loop(currentTime: number = 0): void {
		const dt = currentTime - lastTime; // en milisegundos
		lastTime += dt;
		accFrameMs += dt;

		while (accFrameMs > frameMs) {
			//update logic
			accFrameMs -= frameMs;
			if (!Engine._isPaused) {
				if (this.scene) {
					this.scene.update(frameMs / 1000);
				}
				// Aquí es donde lo pasamos como segundos (dividir entre 1000)
			}
		}
		this.clearCanvas();
		if(this.scene.renderer){
			this.scene.renderer.render(Engine._context);
		}
		// //render
		requestAnimationFrame = window.requestAnimationFrame(this.loop);
	}
}
