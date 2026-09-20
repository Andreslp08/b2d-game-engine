import { GameSceneDifficultyLevel } from "./../enum/scene";
import { Scene } from "engine/scenes/scene";

export type GameSceneInfo = {
	displayName: string;
	description: string;
	difficultyLevel: GameSceneDifficultyLevel;
};

export class GameScene extends Scene {
	static readonly info: GameSceneInfo = {
		displayName: "Game scene",
		description: "",
		difficultyLevel: GameSceneDifficultyLevel.EASY,
	};


	constructor() {
		super();
	}

	getInfo(): GameSceneInfo {
		return (this.constructor as typeof GameScene).info;
	}
}
