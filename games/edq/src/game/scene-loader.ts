import { currentGameInstance } from "./game";
import { GameScene } from "./scenes/game-scene";
import { Level1 } from "./scenes/level1";

type SceneClass = new () => GameScene;

class SceneLoader {
	private sceneMap = new Map<string, SceneClass>();

	constructor() {
		this.sceneMap.set(Level1.name, Level1);
	}

	loadByClassName(className: string): GameScene {
		const SceneClass = this.sceneMap.get(className);
		if (!SceneClass) return null;

		const scene = new SceneClass();
		currentGameInstance.stop();
		currentGameInstance.setScene(scene);
		currentGameInstance.start();
		return scene;
	}
}

export const GameSceneLoader = new SceneLoader();
