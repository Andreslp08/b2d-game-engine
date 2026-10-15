import { Asset } from "./asset";

export class GameImage extends Asset<HTMLImageElement> {

    constructor(name:string, path: string) {
        super(name, path);
        this.path = path;
        this.nativeElement = new Image();
        this.nativeElement.src = path;
        this.nativeElement.onload = () => {
            this._loaded = true;
            this.emitLoad({ error: "", loaded: true, ok: true });
        };

        this.nativeElement.onerror = () => {
            console.warn(`GameImage path: ${this.path} is an invalid path or could not be loaded.`);
            this._loaded = false;
            this.emitLoad({
                error: `Path: ${this.path} is an invalid path or could not be loaded.`,
                loaded: true,
                ok: false,
            });
        };
    }

    nativeElement: HTMLImageElement;
}
