import { Level } from "../../levels/level";
import { Room1 } from "./rooms/room1";

export class Level1 extends Level {
	static readonly id = "level1";
	static readonly displayInfo = {
		displayName: "Level 1",
		description: "This is a test level1",
		difficultyLevel: "easy",
	} as const;

	constructor() {
		super();
		this.addRoom(Room1);
	}
}
