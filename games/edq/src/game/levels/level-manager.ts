import { currentGameInstance } from "../game";
import type { Level, LevelConstructor } from "./level";
import type { Room, RoomParams } from "./room";

export class LevelManager {
	protected levelTypes: Map<string, LevelConstructor> = new Map();
	private currentLevel: Level | null = null;
	constructor() {}

	addLevel(LevelType: LevelConstructor) {
		this.levelTypes.set(LevelType.id, LevelType);
	}

	getLevelType(id: string): LevelConstructor | undefined {
		return this.levelTypes.get(id);
	}

	getLevelTypes(): LevelConstructor[] {
		return Array.from(this.levelTypes.values());
	}

	getCurrentLevel(): Level | null {
		return this.currentLevel;
	}

	async loadLevel(
		levelId: string,
		roomId?: string,
		roomParams?: RoomParams,
	): Promise<Room | undefined> {
		const LevelType = this.getLevelType(levelId);
		if (!LevelType) return;

		const level = new LevelType();
		const targetRoomId = roomId ?? level.getInitialRoomId();
		if (!targetRoomId || !level.getRoomType(targetRoomId)) {
			console.error(`Room '${targetRoomId ?? "initial"}' was not found in level '${levelId}'.`);
			level.destroy();
			return;
		}

		this.destroyCurrentLevel();
		this.currentLevel = level;
		level.setRoomChangeHandler((nextRoomId) => void this.loadRoom(nextRoomId));

		const room = await this.loadRoom(targetRoomId, roomParams);
		if (room) return room;

		level.destroy();
		this.currentLevel = null;
	}

	async loadRoom(roomId: string, roomParams?: RoomParams): Promise<Room | undefined> {
		const level = this.currentLevel;
		if (!level || !level.getRoomType(roomId)) {
			console.error(`Room '${roomId}' was not found in the current level.`);
			return;
		}

		level.getActiveRoom()?.exit();
		currentGameInstance.setScene(null);
		const room = level.createRoom(roomId);
		if (!room) return;

		room.prepare(roomParams);
		await room.load();
		room.spawn();
		currentGameInstance.setScene(room);
		level.setActiveRoom(room);
		currentGameInstance.start();
		room.enter();
		return room;
	}

	destroyCurrentLevel() {
		if (!this.currentLevel) return;

		this.currentLevel.getActiveRoom()?.exit();
		currentGameInstance.setScene(null);
		this.currentLevel.destroy();
		this.currentLevel = null;
	}

	async restartCurrentRoom(): Promise<Room | undefined> {
		const room = this.currentLevel?.getActiveRoom();
		if (!room) return;

		return this.loadLevel(this.currentLevel.id, room.id, {
			loadContext: room.getLoadContext(),
		});
	}
}
