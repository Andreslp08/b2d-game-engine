import Vector2 from "@b2d-engine/core/math/vector2";
import { createBox } from "../../../prefabs/box";
import { Room } from "../../../levels/room";
import { Engine } from "@b2d-engine/core";

export class Room1 extends Room {
	static readonly id = "room1";

	spawn(): void {
		Engine.canvas.style.background = "linear-gradient(3deg, rgb(56 79 123), rgb(0, 0, 0))"; // dark blue sky
		this.loadWorld();
	}

	loadWorld() {
		const box = createBox(new Vector2(0, 0));
		this.addEntity(box);
	}
}
