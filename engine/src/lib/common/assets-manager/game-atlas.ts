import { IAtlasData, AssetEventListener } from "../interfaces/assets";
import { Asset } from "./asset";

export class GameAtlas extends Asset<IAtlasData> {
	nativeElement: IAtlasData;
	onLoad: AssetEventListener;

	constructor(name: string, path: string) {
		super(name, path);
		this.path = path;
		this.fetchJSON(path)
			.then((data) => {
				this.nativeElement = data;
				this.onLoad({ error: "", loaded: true, ok: true });
				this._loaded = true;
			})
			.catch((error) => {
				console.warn(
					`GameAtlas path: ${this.path} is an invalid path or could not be loaded.`,
					error
				);
				if (this.onLoad) {
					this.onLoad({
						error: `Path: ${this.path} is an invalid path or could not be loaded.`,
						loaded: true,
						ok: false,
					});
				}
				this._loaded = false;
			});
	}

	private fetchJSON(path: string): Promise<any> {
		return new Promise((resolve, reject) => {
			fetch(path)
				.then((response) => response.json())
				.then((data) => {
					resolve(data);
				})
				.catch((error) => {
					reject(error);
				});
		});
	}
}
