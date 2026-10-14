import { useGameStore } from "../../store/store";
import { LevelManager } from "../levels/level-manager";
import type { Room, RoomParams } from "../levels/room";
import { Level1 } from "./level-1/level";
import { TestingLevel } from "./testing-level/level";

class ArcadeLevelManager extends LevelManager {
	async loadLevel(
		levelId: string,
		roomId?: string,
		roomParams?: RoomParams,
	): Promise<Room | undefined> {
		const room = await super.loadLevel(levelId, roomId, roomParams);
		if (!room) return;

		useGameStore.getState().setCurrentGame("arcade");
		useGameStore.getState().clearCurrentUI();
		return room;
	}
}

export const ArcadeLevelManagerInstance = new ArcadeLevelManager();

ArcadeLevelManagerInstance.addLevel(TestingLevel);
ArcadeLevelManagerInstance.addLevel(Level1);
