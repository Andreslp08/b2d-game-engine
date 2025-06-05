import { Engine } from "engine";
import { AssetsPreloader } from "engine/common/assets-manager/assets-manager";
import Vector2 from "engine/math/vector2";
import { PRELOAD_IMAGES_PATHS } from "./preloaded-assets";
import { Screen } from "engine/graphics/screen/screen";
import { useGameStore } from "../store/store";
import { GameSceneLoader } from "./scene-loader";
// import { GameSceneLoader } from "./scene-loader";

const setLoadingGame = useGameStore.getState().setLoadingGame;
const aspectRatio = 16 / 9;
export const currentGameInstance = new Engine();
Screen.getInstance().setResolution(new Vector2(window.innerWidth, window.innerHeight), aspectRatio);
addEventListener("resize", () => {
	console.log("updating resolution");
	Screen.getInstance().setResolution(
		new Vector2(window.innerWidth, window.innerHeight),
		aspectRatio
	);
});

export const preloadGame = () => {
	AssetsPreloader.set(PRELOAD_IMAGES_PATHS, (e) => {
		console.log(`${e.progress}% Loading game assets '${e.currentAssetLoading}'`);
		if (e.progress >= 100 && e.finished) {
			setTimeout(() => {
				setLoadingGame(false);
				const scene = GameSceneLoader.loadByClassName("Level1");
				if (scene) {
					console.log(scene.displayName);
				}
			}, 0);
			// setTimeout(() => {
			// 	setLoadingGame(false);
			// }, 2000);

		}
	});
};
