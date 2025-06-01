export type AssetToPreload = {
	type: GameAssetsTypes;
	paths: string[];
};

export enum GameAssetsTypes {
	Image = "Image",
	Sound = "Sound",
}

export interface AssetsPreloaderEvent {
	progress: number;
	finished: boolean;
	currentAssetLoading?: string;
}

export interface AssetsPreloaderListener {
	(event: AssetsPreloaderEvent):void;
}

export class AssetsPreloader {
	private static _assets: Asset<any>[] = [];

	static set(assets: AssetToPreload[], callback: AssetsPreloaderListener): void {
		let progress = 0;
		let loadedNum = 0;
		const pattern = RegExp("<ASSET type=(.*?)/>");
		callback({ finished: false, progress: progress });

		const singlePreloadArray: string[] = assets.reduce((acc, curr) => {
			acc = [
				...acc,
				...curr.paths.map((assPath) => `<ASSET type=(${curr.type})/>${assPath}`),
			];
			return acc;
		}, []);

		const promises = singlePreloadArray.map((asset) => {
			return new Promise((resolve, reject) => {
				const type = asset.match(pattern)?.[0] || "";
				const path = asset.replace(pattern, "");
				let newAsset: Asset<any> = null;
				if (type.includes(GameAssetsTypes.Image)) {
					newAsset = new GameImage(path);
				} else {
					callback({ finished: false, progress: progress, currentAssetLoading: path });
					reject(
						`Assets with type '${type}' cannot be loaded, no class can handle this type.`
					);
				}
				newAsset.onLoad = (e) => {
					if (e.ok && e.loaded) {
						loadedNum++;
						progress = Math.trunc((loadedNum / singlePreloadArray.length) * 100);
						callback({
							finished: false,
							progress: progress,
							currentAssetLoading: path,
						});
						resolve(newAsset);
					} else {
						reject(e.error);
					}
				};
			});
		});
		Promise.all(promises)
			.then((result) => {
				AssetsPreloader._assets = result as any;
				callback({ progress: progress, finished: true });
			})
			.catch((error) => {
				console.log("Assets Manager:", error);
			});
	}

	static add(path, type: GameAssetsTypes): void {
		switch (type) {
			case GameAssetsTypes.Image:
				AssetsPreloader._assets.push(new GameImage(path));
				break;
			default:
				break;
		}
	}

	static has(path: string): boolean {
		return AssetsPreloader._assets.find((ass) => ass.path === path) ? true : false;
	}

	static get(path: string): Asset<any> | null {
		return AssetsPreloader._assets.find((ass) => ass.path === path);
	}
}

export class AssetsManager {
	static getImage(path: string): GameImage {
		let gameImage: GameImage;
		if (AssetsPreloader.has(path)) {
			gameImage = AssetsPreloader.get(path);
		} else {
			AssetsPreloader.add(path, GameAssetsTypes.Image);
			gameImage = AssetsPreloader.get(path);
		}
		return gameImage;
	}

	static getSound(path: string): any {}
}

export interface AssetEvent {
	loaded: boolean;
	ok: boolean;
	error: string;
}
export interface AssetEventListener {
	(event: AssetEvent): void;
}

export interface IAsset<T> {
	loaded: boolean;
	path: string;
	nativeElement: T;
	onLoad: AssetEventListener;
}

export abstract class Asset<T> implements IAsset<T> {
	protected _path: string;
	protected _loaded: boolean;

	constructor() {
		this._path  = "";
		this._loaded = true;
	}

	abstract onLoad: AssetEventListener;

	abstract nativeElement: T;

	public get path(): string {
		return this._path;
	}
	public set path(path: string) {
		this._path = path;
	}

	public get loaded(): boolean {
		return this._loaded;
	}
}

export class GameImage extends Asset<HTMLImageElement> {
	onLoad: AssetEventListener;

	constructor(path: string) {
		super();
		this.path = path;
		this.nativeElement = new Image();
		this.nativeElement.src = path;
		this.nativeElement.onload = () => {
			if (this.onLoad) {
				this.onLoad({ error: "", loaded: true, ok: true });
			}
			this._loaded = true;
		};

		this.nativeElement.onerror = () => {
			console.warn(`GameImage path: ${this.path} is an invalid path or could not be loaded.`);
			if (this.onLoad) {
				this.onLoad({
					error: `Path: ${this.path} is an invalid path or could not be loaded.`,
					loaded: true,
					ok: false,
				});
			}

			this._loaded = false;
		};
	}

	nativeElement: HTMLImageElement;
}
