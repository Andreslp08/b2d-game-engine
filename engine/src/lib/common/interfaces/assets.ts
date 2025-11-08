import { SoundSpriteDefinitions } from "howler";

export type AssetToPreload<T> = {
	type: GameAssetsTypes;
	name: string;
	path: string;
	params?: T;
};

export interface SoundAssetOptions {
	autoplay?: boolean;
	sprite?: SoundSpriteDefinitions;
	html5?: boolean;
    group?: string;
}

export enum GameAssetsTypes {
	Image = "Image",
	Sound = "Sound",
	Atlas = "Atlas",
}

export interface AssetsPreloaderEvent {
	progress: number;
	finished: boolean;
	currentAssetLoading?: string;
}

export interface AssetsPreloaderListener {
	(event: AssetsPreloaderEvent): void;
}

export interface IAtlasData {
	meta: {
		app: string;
		version: string;
		image: string;
		format: string;
		size: {
			w: number;
			h: number;
		};
		scale: string;
	};
	frames: Record<
		string,
		{
			frame: {
				x: number;
				y: number;
				w: number;
				h: number;
			};
			rotated: boolean;
			trimmed: boolean;
			spriteSourceSize: {
				x: number;
				y: number;
				w: number;
				h: number;
			};
			sourceSize: {
				w: number;
				h: number;
			};
		}
	>;
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
