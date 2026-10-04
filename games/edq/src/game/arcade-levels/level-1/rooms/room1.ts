import Vector2 from "engine/math/vector2";
import { createBox } from "../../../prefabs/box";
import { Room } from "../../../levels/room";
import { Engine } from "engine";

export class Room1 extends Room {
	static readonly id = "room1";

	constructor() {
		super();
		Engine.canvas.style.background = "linear-gradient(3deg, rgb(56 79 123), rgb(0, 0, 0))"; // dark blue sky
		this.loadWorld();
	}

	loadWorld() {
		const box = createBox(new Vector2(0, 0));
		this.addEntity(box);
	}
}
