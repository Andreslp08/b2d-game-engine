import { IAtlasData } from "../interfaces/assets";
import { Asset } from "./asset";

export class GameAtlas extends Asset<IAtlasData> {
	nativeElement: IAtlasData;

	constructor(name: string, path: string) {
		super(name, path);
		this.path = path;
		this.fetchJSON(path)
			.then((data) => {
				this.nativeElement = data;
				this._loaded = true;
				this.emitLoad({ error: "", loaded: true, ok: true });
			})
			.catch((error) => {
				console.warn(
					`GameAtlas path: ${this.path} is an invalid path or could not be loaded.`,
					error
				);
				this._loaded = false;
				this.emitLoad({ error: `Path: ${this.path} is an invalid path or could not be loaded.`, loaded: true, ok: false });
			});
	}

	private fetchJSON(path: string): Promise<IAtlasData> {
		return fetch(path).then((response) => response.json() as Promise<IAtlasData>);
	}
}
