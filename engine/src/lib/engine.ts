import { Scene } from "./scenes/scene";
import { KeyBoardManager } from "./input/interfaces/keyboard-manager";
import { Screen } from "./graphics/screen/screen";
import { MouseManager } from "./input/mouse-manager";
import { Time } from "./common/interfaces/time";
import { GameEvent } from "./common/events/game-event";

// let accFrameMs = 0;
// const frameRate = 60;
// const frameMs = 1000 / frameRate;
let requestAnimationFrame;

export class Engine {
	private static _canvas: HTMLCanvasElement;
	private static _context: CanvasRenderingContext2D;
	public static onRunningChange: GameEvent<boolean> = new GameEvent();
	public static onPausedChange: GameEvent<boolean> = new GameEvent();
	private scene: Scene | null = null;
	private static _isRunning: boolean = false;
	static _isPaused: boolean = false;
	private static _gameRoot: HTMLDivElement;
	private static _sleeping: boolean = false;
	private accumulator: number = 0;
	private fixedDelta: number = 1 / 60;
	private targetFps = 60;
	private frameInterval = 1000 / this.targetFps;
	private lastFrameTime = 0;
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
		const keyBoardManager = KeyBoardManager.listen();
		const mouseManager = MouseManager.listen();
		Engine._canvas = canvas;
		Engine._context = Engine._canvas.getContext("2d");
		Screen.getInstance().setCanvasBackgroundColor("rgb(30 30 30)");
		this.loop = this.loop.bind(this);
		// on pause tab event
		window.addEventListener("visibilitychange", () => {
			if (document.hidden) {
				mouseManager.unlisten();
				keyBoardManager.unlisten();
				Engine._sleeping = true;
			} else {
				setTimeout(() => {
					Engine._sleeping = false;
					MouseManager.listen();
					KeyBoardManager.listen();
				}, 250);
			}
		});
	}

	public setTargetFps(fps: number) {
		this.targetFps = fps;
		this.frameInterval = 1000 / this.targetFps;
	}

	public getTargetFps() {
		return this.targetFps;
	}

	public start() {
		Engine.setRunningState(true);
		Engine.setPausedState(false);
		Time.timeScale = 1;
		this.accumulator = 0;
		this.lastFrameTime = performance.now();
		requestAnimationFrame = window.requestAnimationFrame((time) => {
			this.loop(time);
		});
	}

	public stop() {
		Engine.setRunningState(false);
		Engine.setPausedState(false);
		Time.timeScale = 1;
		if (requestAnimationFrame) {
			window.cancelAnimationFrame(requestAnimationFrame);
		}
		requestAnimationFrame = null;
		this.accumulator = 0;
		this.lastFrameTime = 0;
		this.clearCanvas();
		this.setScene(null);
	}

	public pause() {
		Engine.setPausedState(true);
		this.accumulator = 0;
		this.lastFrameTime = performance.now();
		Time.setFixedUpdateAccumulator(0);
	}

	public resume() {
		Engine.setPausedState(false);
		this.accumulator = 0;
		this.lastFrameTime = performance.now();
		Time.setFixedUpdateAccumulator(0);
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

	public setScene(scene: Scene | null) {
		if (this.scene && this.scene !== scene) {
			this.scene.destroy();
		}
		this.scene = scene;
	}

	public getScene() {
		return this.scene;
	}

	private static setRunningState(isRunning: boolean) {
		if (Engine._isRunning === isRunning) return;
		Engine._isRunning = isRunning;
		Engine.onRunningChange.emit(isRunning);
	}

	private static setPausedState(isPaused: boolean) {
		if (Engine._isPaused === isPaused) return;
		Engine._isPaused = isPaused;
		Engine.onPausedChange.emit(isPaused);
	}

	private clearCanvas() {
		const ctx = Engine._canvas.getContext("2d");
		ctx.save(); // por si hay transformaciones activas
		ctx.setTransform(1, 0, 0, 1, 0, 0); // resetea todo: escala, rotación, traslación
		ctx.clearRect(0, 0, Engine._canvas.width, Engine._canvas.height);
		ctx.restore();
	}

	private loop(currentTime: number = 0): void {
		const elapsed = currentTime - this.lastFrameTime;
		if (elapsed < this.frameInterval) {
			requestAnimationFrame = window.requestAnimationFrame(this.loop);
			return;
		}
		this.lastFrameTime = currentTime;

		if (Engine._isPaused || Engine._sleeping) {
			this.accumulator = 0;
			Time.setFixedUpdateAccumulator(0);
			this.clearCanvas();
			if (this.scene?.renderer && !Engine._sleeping) {
				this.scene.renderer.render(Engine._context);
			}
			requestAnimationFrame = window.requestAnimationFrame(this.loop);
			return;
		}

		const dt = elapsed / 1000;
		this.accumulator = Math.min(this.accumulator + dt, 0.25);

		if (this.scene) {
			while (this.accumulator >= this.fixedDelta * Time.timeScale) {
				this.scene.fixedUpdate?.();
				Time.fixedUpdate(this.fixedDelta);
				this.accumulator -= this.fixedDelta;
			}
			Time.update(dt);
			Time.setFixedUpdateAccumulator(this.accumulator);
			this.scene.update();
		}

		this.clearCanvas();
		if (this.scene?.renderer && !Engine._sleeping) {
			this.scene.renderer.render(Engine._context);
		}

		requestAnimationFrame = window.requestAnimationFrame(this.loop);
	}
}
