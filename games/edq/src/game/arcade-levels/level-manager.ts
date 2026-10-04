import { useGameStore } from "../../store/store";
import { LevelManager } from "../levels/level-manager";
import type { Room } from "../levels/room";
import { Level1 } from "./level-1/level";
import { TestingLevel } from "./testing-level/level";

class ArcadeLevelManager extends LevelManager {
	loadLevel(levelId: string, roomId?: string): Room | undefined {
		const room = super.loadLevel(levelId, roomId);
		if (!room) return;

		useGameStore.getState().setCurrentGame("arcade");
		useGameStore.getState().clearCurrentUI();
		return room;
	}
}

export const ArcadeLevelManagerInstance = new ArcadeLevelManager();

ArcadeLevelManagerInstance.addLevel(TestingLevel);
ArcadeLevelManagerInstance.addLevel(Level1);
