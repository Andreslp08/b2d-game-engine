import { GameObject } from "engine/common/entities/game-object";
import {
	KeyBoardManager,
	type PhysicalKeyCode,
} from "engine/input/keyboard-manager";
import { ScriptComponent } from "engine/scripts/script-component";
import { UIObject } from "engine/ui/entities/ui-object";
import type { AnyItemDefinition } from "../../items/definitions/item-definition";
import { InventoryComponent } from "../../items/components/inventory-component";
import { QuickSlotsComponent } from "../../items/components/quick-slots-component";
import { PickupPrompt } from "./pickup-prompt";

export class PickupController extends ScriptComponent {
	private playerInRange: GameObject | null = null;
	private pickupObject: GameObject | null = null;
	private readonly prompt: PickupPrompt;
	private readonly promptObject: UIObject;
	private collected = false;

	constructor(
		private readonly definition: AnyItemDefinition,
		private readonly amount: number,
		private readonly keybind: PhysicalKeyCode,
	) {
		super();
		this.prompt = new PickupPrompt(definition.name, keybind);
		this.promptObject = new UIObject();
		this.promptObject.addComponent(this.prompt);
	}

	setPickupObject(pickupObject: GameObject): void {
		this.pickupObject = pickupObject;
	}

	onStart(): void {
		const scene = this.entity.getScene();
		if (scene && this.promptObject.getScene() !== scene) scene.addEntity(this.promptObject);
		void KeyBoardManager.getPhysicalKeyLabel(this.keybind).then((label) => {
			this.prompt.setKeyLabel(label);
		});
	}

	onMarkerEnter = (player: GameObject): void => {
		if (this.collected) return;
		this.playerInRange = player;
		this.prompt.setVisible(true);
	};

	onMarkerExit = (player: GameObject): void => {
		if (this.playerInRange === player) this.playerInRange = null;
		if (!this.playerInRange) this.prompt.setVisible(false);
	};

	onMarkerStay = (player: GameObject): void => {
		if (this.collected) return;
		this.playerInRange = player;
		this.prompt.setVisible(true);
	};

	onUpdate(): void {
		if (!this.playerInRange || this.collected) return;
		if (!KeyBoardManager.physicalKeyJustPressed(this.keybind)) return;
		const inventoryComponent = this.playerInRange.getComponent(InventoryComponent);
		if (!inventoryComponent) return;
		const quickSlots = this.playerInRange.getComponent(QuickSlotsComponent);
		const assignQuickSlot = (entryId: string): void => {
			if (this.definition.quickAssignable) quickSlots?.assignFirstAvailable(entryId);
		};

		if (this.definition.stackable) {
			const entry = inventoryComponent.inventory.add(this.definition.id, this.amount);
			assignQuickSlot(entry.entryId);
		} else {
			for (let index = 0; index < this.amount; index++) {
				const instance = inventoryComponent.inventory.createInstance(this.definition);
				const entry = inventoryComponent.inventory.addInstance(instance);
				assignQuickSlot(entry.entryId);
			}
		}
		this.collected = true;
		console.log(`Pickup: ${this.amount} ${this.prompt.getItemName()}`);
		this.promptObject.destroy();
		this.pickupObject?.destroy();
		this.entity.destroy();
	}

	onDestroy(): void {
		this.promptObject.destroy();
	}
}
