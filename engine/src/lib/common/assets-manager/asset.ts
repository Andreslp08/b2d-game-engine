import { IAsset, AssetEventListener } from "../interfaces/assets";

export abstract class Asset<T> implements IAsset<T> {
    protected _name: string;
    protected _path: string;
    protected _loaded: boolean;

    constructor(name: string, path: string) {
        this._name = name;
        this._path = path;
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

    public get name(): string {
        return this._name;
    }
}