import { KeyBoardManager } from "engine/input/interfaces/keyboard-manager";
import { ScriptComponent } from "engine/scripts/script-component";
import { Loot } from "./loot";

export class LootInputController extends ScriptComponent {
	private slots: Array<{ slot: number; key: string }> = [
		{
			slot: 0,
			key: "1",
		},
		{
			slot: 1,
			key: "2",
		},
		{
			slot: 2,
			key: "3",
		},
	];

	onStart(): void {}

	onUpdate(): void {
		if (!this.entity) return;
		const loot = this.entity.getComponent(Loot);
		if (!loot) return;
		this.slots.forEach((slot) => {
			if (KeyBoardManager.keyDown(slot.key)) {
				loot.setCurrentSlot(slot.slot);
			}
		});
	}
}
