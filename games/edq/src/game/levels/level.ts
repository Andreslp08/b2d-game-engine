import type { Room, RoomConstructor } from "./room";

export type LevelDisplayInfo = {
	displayName: string;
	description: string;
	difficultyLevel: "easy" | "medium" | "hard";
};

export type LevelConstructor = (new () => Level) & {
	readonly id: string;
	readonly displayInfo: LevelDisplayInfo;
};

export class Level {
	static readonly id: string;
	static readonly displayInfo: LevelDisplayInfo;
	protected roomTypes: Map<string, RoomConstructor> = new Map();
	private activeRoom: Room | null = null;
	private roomChangeHandler: ((roomId: string) => void) | null = null;

	get id(): string {
		return (this.constructor as typeof Level).id;
	}

	getLevelDisplayInfo(): LevelDisplayInfo {
		return (this.constructor as typeof Level).displayInfo;
	}

	getRoomType(id: string): RoomConstructor | undefined {
		return this.roomTypes.get(id);
	}

	getRoomTypes(): RoomConstructor[] {
		return Array.from(this.roomTypes.values());
	}

	getInitialRoomId(): string | undefined {
		return this.roomTypes.keys().next().value;
	}

	getActiveRoom(): Room | null {
		return this.activeRoom;
	}

	setActiveRoom(room: Room | null) {
		this.activeRoom = room;
	}

	setRoomChangeHandler(handler: (roomId: string) => void) {
		this.roomChangeHandler = handler;
	}

	changeRoom(roomId: string) {
		if (!this.roomTypes.has(roomId)) return;
		this.roomChangeHandler?.(roomId);
	}

	createRoom(id: string): Room | undefined {
		const RoomType = this.getRoomType(id);
		if (!RoomType) return;

		const room = new RoomType();
		room.setLevel(this);
		return room;
	}

	addRoom(RoomType: RoomConstructor) {
		this.roomTypes.set(RoomType.id, RoomType);
	}
	removeRoom(id: string) {
		this.roomTypes.delete(id);
	}

	clearRooms() {
		this.roomTypes.clear();
	}

	protected onDestroy() {}

	destroy() {
		this.onDestroy();
		this.roomChangeHandler = null;
		this.clearRooms();
		this.activeRoom = null;
	}
}
