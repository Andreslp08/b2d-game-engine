import { Engine } from "engine";
import Vector2 from "engine/math/vector2";
import { PRELOAD_ASSETS as ASSETS_TO_PRELOAD } from "./preload/preloaded-assets";
import { Screen } from "engine/graphics/screen/screen";
import { useGameStore } from "../store/store";
import { GameSceneLoader } from "./scene-loader";
import { AssetsPreloader } from "engine/common/assets-manager/assets-preloader";
import { DEV_MODE } from "./config/constants";
// import { GameSceneLoader } from "./scene-loader";

const aspectRatio = 16 / 9;
export const currentGameInstance = new Engine();
const gameStore = useGameStore.getState();

Screen.getInstance().setResolution(new Vector2(window.innerWidth, window.innerHeight), aspectRatio);
Screen.getInstance().setResolution(new Vector2(window.innerWidth, window.innerHeight), aspectRatio);
addEventListener("resize", () => {
	console.log("updating resolution");
	Screen.getInstance().setResolution(
		new Vector2(window.innerWidth, window.innerHeight),
		aspectRatio,
	);
});

export const preloadGame = () => {
	const testScene = () => {
		setTimeout(() => {
			const scene = GameSceneLoader.loadByClassName("Level1");
			if (scene) {
				console.log(scene.displayName);
			}
			console.log(AssetsPreloader.assets);
		}, 0);
	};
	const goToMainMenu = () => {
		setTimeout(() => {
			gameStore.setCurrentUI("global", "mainMenu");
		}, 1000);
	};
	AssetsPreloader.set(ASSETS_TO_PRELOAD, (e) => {
		console.log(`${e.progress}% Loading game assets '${e.currentAssetLoading}'`);
		if (e.progress >= 100 && e.finished) {
			if (DEV_MODE) {
				testScene();
			} else {
				goToMainMenu();
			}
		}
	});
};
