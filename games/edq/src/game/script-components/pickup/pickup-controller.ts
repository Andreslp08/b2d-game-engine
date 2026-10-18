import { GameObject } from "@b2d-engine/core/common/entities/game-object";
import { ScriptComponent } from "@b2d-engine/core/scripts/script-component";
import { UIObject } from "@b2d-engine/core/ui/entities/ui-object";
import type { AnyItemDefinition } from "../../items/definitions/item-definition";
import { InventoryComponent } from "../../items/components/inventory-component";
import { QuickSlotsComponent } from "../../items/components/quick-slots-component";
import { GameplayAction, InputManagerInstance } from "../../input/input-manager";
import { InputContextPriority } from "../../input/context-priority";
import { InputActionPhase } from "@b2d-engine/core/input/input-manager";
import { EquipmentComponent } from "../../items/components/equipment-component";
import { InteractPrompt } from "../../ui-components/interact-prompt";

export class PickupController extends ScriptComponent {
	private playerInRange: GameObject | null = null;
	private pickupObject: GameObject | null = null;
	private readonly prompt: InteractPrompt;
	private readonly promptObject: UIObject;
	private releaseContext: (() => void) | null = null;
	private collected = false;

	constructor(
		private readonly definition: AnyItemDefinition,
		private readonly amount: number,
	) {
		super();
		this.prompt = new InteractPrompt(definition.name);
		this.promptObject = new UIObject();
		this.promptObject.addComponent(this.prompt);
	}

	setPickupObject(pickupObject: GameObject): void {
		this.pickupObject = pickupObject;
	}

	onStart(): void {
		const scene = this.entity.getScene();
		if (scene && this.promptObject.getScene() !== scene) scene.addEntity(this.promptObject);
		void InputManagerInstance.getActionLabel("interact").then((label) => {
			if (label) this.prompt.setKeyLabel(label);
		});
	}

	onMarkerEnter = (player: GameObject): void => {
		if (this.collected) return;
		this.playerInRange = player;
		this.prompt.setVisible(true);
		this.releaseContext ??= InputManagerInstance.pushContext({
			id: `pickup-${this.entity.id}`,
			priority: InputContextPriority.Interaction,
			actions: [{ action: GameplayAction.Interact, phases: [InputActionPhase.Pressed] }],
			onAction: () => {
				this.collect();
			},
		});
	};

	onMarkerExit = (player: GameObject): void => {
		if (this.playerInRange === player) this.playerInRange = null;
		if (!this.playerInRange) this.prompt.setVisible(false);
		if (!this.playerInRange) this.releaseContext?.();
		if (!this.playerInRange) this.releaseContext = null;
	};

	onMarkerStay = (player: GameObject): void => {
		if (this.collected) return;
		this.playerInRange = player;
		this.prompt.setVisible(true);
	};

	private collect(): void {
		if (!this.playerInRange || this.collected) return;
		const inventoryComponent = this.playerInRange.getComponent(InventoryComponent);
		const equipmentComponent = this.playerInRange.getComponent(EquipmentComponent);
		if (!inventoryComponent || !equipmentComponent) return;
		const quickSlots = this.playerInRange.getComponent(QuickSlotsComponent);
		const assignQuickSlot = (entryId: string): void => {
			if (this.definition.quickAssignable) quickSlots?.assignFirstAvailable(entryId);
			if(this.definition.equippable) equipmentComponent?.equip(entryId);
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
		// console.log(`Pickup: ${this.amount} ${this.prompt.getItemName()}`);
		this.promptObject.destroy();
		this.pickupObject?.destroy();
		this.entity.destroy();
	}

	onDestroy(): void {
		this.releaseContext?.();
		this.promptObject.destroy();
	}
}
