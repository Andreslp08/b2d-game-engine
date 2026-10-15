import { IAsset, AssetEvent, AssetEventListener } from "../interfaces/assets";

export abstract class Asset<T> implements IAsset<T> {
    protected _name: string;
    protected _path: string;
    protected _loaded: boolean = false;
    private _onLoad: AssetEventListener;
    private loadEvent: AssetEvent | null = null;

    constructor(name: string, path: string) {
        this._name = name;
        this._path = path;
    }

    public get onLoad(): AssetEventListener {
        return this._onLoad;
    }

    public set onLoad(listener: AssetEventListener) {
        this._onLoad = listener;
        if (this.loadEvent) listener(this.loadEvent);
    }

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

    public get name(): string {
        return this._name;
    }

    protected emitLoad(event: AssetEvent): void {
        this.loadEvent = event;
        this._onLoad?.(event);
    }
}
