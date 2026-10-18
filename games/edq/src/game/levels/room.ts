import { Scene } from "@b2d-engine/core/scenes/scene";
import  { Level } from "./level";
import  { GameEvent } from "@b2d-engine/core/common/events/game-event";

export type RoomConstructor = (new () => Room) & { readonly id: string };

export type RoomLoadContext = {
	spawnPointId?: string;
};

export type RoomParams = {
	loadContext?: RoomLoadContext;
};

export class Room extends Scene {
	static readonly id: string;
	level: Level;
	onFadeFinished:GameEvent<void> = new GameEvent();
	private fadeOutDelay: number = 0.3
	private fadeOutTimeout: number = 0;
	private loadContext: RoomLoadContext = {};

	get id(): string {
		return (this.constructor as RoomConstructor).id;
	}

	constructor() {
		super();
	}

	prepare(params: RoomParams = {}): void {
		this.loadContext = params.loadContext ?? {};
	}

	async load(): Promise<void> {}

	spawn(): void {}

	enter(): void {
		this.fade({
			to: 1,
			color: "#000",
			duration:0,
			target: "screen",
		})

		this.fade({
			to: 0,
			color: "#000",
			duration:0.6,
			target: "screen",
			delay:this.fadeOutDelay
		})
		this.fadeOutTimeout=setTimeout(() => this.onFadeFinished.emit(), this.fadeOutDelay * 1000);
	}

	exit(): void {}

	setLevel(level: Level) {
		this.level = level;
	}

	getLoadContext(): RoomLoadContext {
		return this.loadContext;
	}

	destroy() {
		if (this.level?.getActiveRoom() === this) {
			this.level.setActiveRoom(null);
		}
		if(this.fadeOutTimeout){
			clearTimeout(this.fadeOutTimeout);
			this.fadeOutTimeout=0
		}
		super.destroy();
	}
}
