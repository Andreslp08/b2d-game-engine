import {
	AssetToPreload,
	AssetsPreloaderListener,
	GameAssetsTypes,
	SoundAssetOptions,
} from "../interfaces/assets";
import { Asset } from "./asset";
import { GameAtlas } from "./game-atlas";
import { GameImage } from "./game-image";
import { GameSound } from "./game-sound";
export interface PreloadedAsset {
	type: GameAssetsTypes;
	name: string;
	path: string;
	asset: Asset<any>;
}
export class AssetsPreloader {
	private static _assets: PreloadedAsset[] = [];

	static get assets(): PreloadedAsset[] {
		return AssetsPreloader._assets;
	}

	static set(
		assets: AssetToPreload<any | SoundAssetOptions>[],
		callback: AssetsPreloaderListener
	): void {
		let progress = 0;
		let loadedNum = 0;
		callback({ finished: false, progress: progress });

		const promises: Promise<PreloadedAsset>[] = assets.map((asset) => {
			return new Promise((resolve, reject) => {
				const type = asset.type;
				const path = asset.path;
				const name = asset.name;
				let newAsset: Asset<any> = null;
				if (type === GameAssetsTypes.Image) {
					newAsset = new GameImage(name, path);
				} else if (type === GameAssetsTypes.Atlas) {
					newAsset = new GameAtlas(name, path);
				} else if (type === GameAssetsTypes.Sound) {
					const params: SoundAssetOptions = asset.params;
					newAsset = new GameSound(name, path, {
						html5: params?.html5,
						autoplay: params?.autoplay,
						sprite: params?.sprite,
					});
				} else {
					callback({ finished: false, progress: progress, currentAssetLoading: path });
					reject(
						`Assets with type '${type}' cannot be loaded, no class can handle this type.`
					);
				}
				newAsset.onLoad = (e) => {
					if (e.ok && e.loaded) {
						loadedNum++;
						progress = Math.trunc((loadedNum / assets.length) * 100);
						callback({
							finished: false,
							progress: progress,
							currentAssetLoading: path,
						});
						const preloadedAsset: PreloadedAsset = {
							type: type,
							name: name,
							path: path,
							asset: newAsset,
						};
						resolve(preloadedAsset);
					} else {
						reject(e.error);
					}
				};
			});
		});
		Promise.all(promises)
			.then((result) => {
				AssetsPreloader._assets = result;
				callback({ progress: progress, finished: true });
			})
			.catch((error) => {
				console.log("Assets Manager:", error);
			});
	}

	static hasAssetByPath(type: GameAssetsTypes, path: string): boolean {
		return AssetsPreloader._assets.find((ass) => ass.path === path && ass.type === type)
			? true
			: false;
	}

	static hasAssetsByName(type: GameAssetsTypes, name: string): boolean {
		return AssetsPreloader._assets.find((ass) => ass.name === name && ass.type === type)
			? true
			: false;
	}

	static getByPath<T extends Asset<any>>(type: GameAssetsTypes, path: string): T | null {
		const preloaded = AssetsPreloader._assets.find(
			(ass) => ass.path === path && ass.type === type
		);
		if (preloaded) {
			return preloaded.asset as T;
		}
		return null;
	}
	static getByName<T extends Asset<any>>(type: GameAssetsTypes, name: string): T | null {
		const preloaded = AssetsPreloader._assets.find(
			(ass) => ass.name === name && ass.type === type
		);
		if (preloaded) {
			return preloaded.asset as T;
		}
		return null;
	}
}
