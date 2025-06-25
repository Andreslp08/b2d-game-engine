import { Engine } from "engine";
import { useGameStore } from "../../store/store";
import { GameSceneLevel } from "./../enum/scene";
import { Scene } from "engine/scenes/scene";

export class GameScene extends Scene {
	private _level: GameSceneLevel;
	private _displayName: string = "Game scene";

	constructor(displayName: string, level: GameSceneLevel) {
		super();
		this._level = level;
		this._displayName = displayName;
	}

	public get level() {
		return this._level;
	}

	public get displayName() {
		return this._displayName;
	}

	update(): void {
		super.update();
		useGameStore.getState().setRunningGame(Engine.isRunning);
	}
}
