import { GameAssetsTypes } from "../interfaces/assets";
import { AssetsPreloader } from "./assets-preloader";
import { GameAtlas } from "./game-atlas";
import { GameImage } from "./game-image";

export class AssetsManager {
	static getImageByPath(path: string): GameImage {
		const type = GameAssetsTypes.Image;
		let gameImage: GameImage = null;
		if (AssetsPreloader.hasAssetByPath(type, path)) {
			gameImage = AssetsPreloader.getByPath<GameImage>(type, path);
		}
		return gameImage;
	}

	static getImageByName(name: string): GameImage {
		const type = GameAssetsTypes.Image;
		let gameImage: GameImage = null;
		if (AssetsPreloader.hasAssetsByName(type, name)) {
			gameImage = AssetsPreloader.getByName<GameImage>(type, name);
		}
		return gameImage;
	}

	static getAtlasByPath(path: string): GameAtlas {
		const type = GameAssetsTypes.Atlas;
		let atlas: GameAtlas = null;
		if (AssetsPreloader.hasAssetByPath(type, path)) {
			atlas = AssetsPreloader.getByPath<GameAtlas>(type, path);
		}
		return atlas;
	}

	static getAtlasByName(name: string): GameAtlas {
		const type = GameAssetsTypes.Atlas;
		let atlas: GameAtlas = null;
		if (AssetsPreloader.hasAssetsByName(type, name)) {
			atlas = AssetsPreloader.getByName<GameAtlas>(type, name);
		}
		return atlas;
	}
	// static getSound(path: string): any {}
}
