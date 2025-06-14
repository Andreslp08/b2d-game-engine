import { AssetEventListener } from "../interfaces/assets";
import { Asset } from "./asset";

export class GameImage extends Asset<HTMLImageElement> {
    onLoad: AssetEventListener;

    constructor(name:string, path: string) {
        super(name, path);
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
