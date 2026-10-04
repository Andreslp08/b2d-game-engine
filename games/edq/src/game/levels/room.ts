import { Scene } from "engine/scenes/scene";
import type { Level } from "./level";

export type RoomConstructor = (new () => Room) & { readonly id: string };

export class Room extends Scene {
	static readonly id: string;
	level: Level;

	get id(): string {
		return (this.constructor as RoomConstructor).id;
	}

	constructor() {
		super();
	}

	setLevel(level: Level) {
		this.level = level;
	}

	destroy() {
		if (this.level?.getActiveRoom() === this) {
			this.level.setActiveRoom(null);
		}
		super.destroy();
	}
}
