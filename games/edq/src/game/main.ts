import { Engine } from "engine";
import { AssetsPreloader } from "engine/common/index";
import Vector2 from "engine/math/vector2";
import { PRELOAD_IMAGES_PATHS } from "./preloaded-assets";
import { Level1 } from "./scene";
import { Screen } from "engine/graphics/screen/screen";

const init = () => {
	const game = new Engine();
	const scene = new Level1();
	game.setScene(scene);
	const aspectRatio = 16 / 9;
	Screen.getInstance().setResolution(
		new Vector2(window.innerWidth, window.innerHeight),
		aspectRatio
	);
	addEventListener("resize", () => {
		console.log("updating resolution");
		Screen.getInstance().setResolution(
			new Vector2(window.innerWidth, window.innerHeight),
			aspectRatio
		);
	});

	AssetsPreloader.set(PRELOAD_IMAGES_PATHS, (e) => {
		console.log(`${e.progress}% Loading game assets '${e.currentAssetLoading}'`);
		if (e.progress >= 100 && e.finished) {
			setTimeout(() => {
				game.init();
			}, 500);
		}
	});
};

export const Game = {
	init
}
