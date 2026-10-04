import { Level } from "../../levels/level";
import { Room1 } from "./rooms/room1";
import { Room2 } from "./rooms/room2";

export class TestingLevel extends Level {
	static readonly id = "testing-level";
	static readonly displayInfo = {
		displayName: "Test level",
		description: "This is a level for testing",
		difficultyLevel: "easy",
	} as const;

	roomsIds: string[] = [];
	currentIndex = 0;
	constructor() {
		super();
		this.addRoom(Room1);
		this.addRoom(Room2);

		this.roomsIds = this.getRoomTypes().map((room) => room.id);
		this.currentIndex = 0;
		addEventListener("keydown", this.handleKeyDown);
	}

	private readonly handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === "ArrowRight") {
			this.currentIndex = (this.currentIndex + 1) % this.roomsIds.length;
			this.changeRoom(this.roomsIds[this.currentIndex]);
		}
		if (event.key === "ArrowLeft") {
			this.currentIndex =
				(this.currentIndex - 1 + this.roomsIds.length) % this.roomsIds.length;
			this.changeRoom(this.roomsIds[this.currentIndex]);
		}
	};

	protected onDestroy() {
		window.removeEventListener("keydown", this.handleKeyDown);
	}
}
