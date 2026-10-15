import { SoundAssetOptions } from "../interfaces/assets";
import { Asset } from "./asset";
import { Howl } from "howler";

export class GameSound extends Asset<Howl> {
	options: SoundAssetOptions;

	constructor(name: string, path: string, options?: SoundAssetOptions) {
		super(name, path);
		this.path = path;
		this.options = options;
		this.nativeElement = new Howl({
			...options,
			src: path,
			preload: true,
		});
		this.nativeElement.on("load", () => {
            if (this._loaded) return;
            this._loaded = true;
			this.emitLoad({ error: "", loaded: true, ok: true });
		});

		this.nativeElement.on("loaderror", () => {
			console.warn(`GameSound path: ${this.path} is an invalid path or could not be loaded.`);
            this._loaded = false;
			this.emitLoad({ error: `GameSound: ${this.path} is an invalid path or could not be loaded.`, loaded: true, ok: false });
		});
	}

	play(spriteOrId?: number | string) {
		this.nativeElement.play(spriteOrId);
	}

	stop() {
		this.nativeElement.stop();
	}

	pause() {
		this.nativeElement.pause();
	}

	volume(volume: number) {
		this.nativeElement.volume(volume);
	}

	rate(rate: number) {
		this.nativeElement.rate(rate);
	}

	seek(time: number) {
		this.nativeElement.seek(time);
	}

	duration() {
		return this.nativeElement.duration();
	}

	loop(loop: boolean) {
		this.nativeElement.loop(loop);
	}

	mute(mute: boolean) {
		this.nativeElement.mute(mute);
	}

	static setMasterVolume(volume: number) {
		Howler.volume(volume);
	}

	nativeElement: Howl;
}
