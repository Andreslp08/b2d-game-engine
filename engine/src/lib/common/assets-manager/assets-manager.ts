import { HowlOptions } from "howler";
import { GameAssetsTypes, SoundAssetOptions } from "../interfaces/assets";
import { AssetsPreloader } from "./assets-preloader";
import { GameAtlas } from "./game-atlas";
import { GameImage } from "./game-image";
import { GameSound } from "./game-sound";

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
	static getSoundByPath(path: string, options?: SoundAssetOptions): GameSound {
		const type = GameAssetsTypes.Sound;
		let gameSound: GameSound = null;
		if (AssetsPreloader.hasAssetsByName(type, path)) {
			const preloaded = AssetsPreloader.getByPath<GameSound>(type, path);
			gameSound = new GameSound(preloaded.name, preloaded.path, options? options : preloaded.options);
		}
		if (AssetsPreloader.hasAssetByPath(type, path)) {
			gameSound = AssetsPreloader.getByPath<GameSound>(type, path);
		}
		return gameSound;
	}
	static getSoundByName(name: string, options?: SoundAssetOptions): GameSound {
		const type = GameAssetsTypes.Sound;
		let gameSound: GameSound = null;
		if (AssetsPreloader.hasAssetsByName(type, name)) {
			const preloaded = AssetsPreloader.getByName<GameSound>(type, name);
			
				gameSound = new GameSound(preloaded.name, preloaded.path, options? options : preloaded.options);
		}
		return gameSound;
	}
}
