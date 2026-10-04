import { currentGameInstance } from "../game";
import type { Level, LevelConstructor } from "./level";
import type { Room } from "./room";

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

	loadLevel(levelId: string, roomId?: string): Room | undefined {
		const LevelType = this.getLevelType(levelId);
		if (!LevelType) return;

		const level = new LevelType();
		const targetRoomId = roomId ?? level.getInitialRoomId();
		if (!targetRoomId) {
			level.destroy();
			return;
		}

		this.destroyCurrentLevel();
		this.currentLevel = level;
		level.setRoomChangeHandler((nextRoomId) => this.loadRoom(nextRoomId));

		const room = this.loadRoom(targetRoomId);
		if (room) return room;

		level.destroy();
		this.currentLevel = null;
	}

	loadRoom(roomId: string): Room | undefined {
		const level = this.currentLevel;
		if (!level || !level.getRoomType(roomId)) return;

		currentGameInstance.stop();
		const room = level.createRoom(roomId);
		if (!room) return;

		currentGameInstance.setScene(room);
		level.setActiveRoom(room);
		currentGameInstance.start();
		return room;
	}

	destroyCurrentLevel() {
		if (!this.currentLevel) return;

		currentGameInstance.stop();
		this.currentLevel.destroy();
		this.currentLevel = null;
	}

	restartCurrentRoom(): Room | undefined {
		const room = this.currentLevel?.getActiveRoom();
		if (!room) return;

		return this.loadLevel(this.currentLevel.id, room.id);
	}
}
