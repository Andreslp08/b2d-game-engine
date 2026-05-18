import { currentGameInstance } from "./game";
import type { GameId } from "./interfaces/store";
import { useGameStore } from "../store/store";
import { GameScene } from "./scenes/game-scene";
import { Level1 } from "./scenes/level1";

type SceneClass = new () => GameScene;
type SceneDefinition = {
	mode: GameId;
	sceneClass: SceneClass;
};

class SceneLoader {
	private sceneMap = new Map<string, SceneDefinition>();

	constructor() {
		this.sceneMap.set(Level1.name, {
			mode: "arcade",
			sceneClass: Level1,
		});
	}

	loadByClassName(className: string): GameScene {
		const sceneDefinition = this.sceneMap.get(className);
		if (!sceneDefinition) return null;

		currentGameInstance.stop();
		const scene = new sceneDefinition.sceneClass();
		useGameStore.getState().setCurrentGame(sceneDefinition.mode);
		useGameStore.getState().clearCurrentUI();
		currentGameInstance.setScene(scene);
		currentGameInstance.start();
		return scene;
	}

	restartCurrentScene(): GameScene {
		const currentScene = currentGameInstance.getScene();
		if (!currentScene) return null;

		return this.loadByClassName(currentScene.constructor.name);
	}
}

export const GameSceneLoader = new SceneLoader();
