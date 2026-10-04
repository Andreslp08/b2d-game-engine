import { Engine } from "engine";
import Vector2 from "engine/math/vector2";
import { PRELOAD_ASSETS as ASSETS_TO_PRELOAD } from "./preload/preloaded-assets";
import { Screen } from "engine/graphics/screen/screen";
import { useGameStore } from "../store/store";
import { ArcadeLevelLoaderInstance } from "./arcade-levels/level-loader";
import { TestingLevel } from "./arcade-levels/testing-level/level";
import { Room1 } from "./arcade-levels/testing-level/rooms/room1";
import { AssetsPreloader } from "engine/common/assets-manager/assets-preloader";
import { DEV_MODE } from "./config/constants";

const aspectRatio = 16 / 9;
export const currentGameInstance = new Engine();
const gameStore = useGameStore.getState();

Screen.getInstance().resize(new Vector2(window.innerWidth, window.innerHeight), aspectRatio);
Screen.getInstance().resize(new Vector2(window.innerWidth, window.innerHeight), aspectRatio);
addEventListener("resize", () => {
	console.log("updating resolution");
	Screen.getInstance().resize(new Vector2(window.innerWidth, window.innerHeight), aspectRatio);
});

export const preloadGame = () => {
	const testLevel = () => {
		setTimeout(() => {
			ArcadeLevelLoaderInstance.loadLevel(TestingLevel.id, Room1.id);
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
				testLevel();
			} else {
				goToMainMenu();
			}
		}
	});
};
