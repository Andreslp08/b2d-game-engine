import { KeyBoardManager } from "engine/input/interfaces/keyboard-manager";
import { ScriptComponent } from "engine/scripts/script-component";
import { InventoryComponent } from "../../items/components/inventory-component";
import { QuickSlotsComponent } from "../../items/components/quick-slots-component";
import { EquipmentComponent } from "../../items/components/equipment-component";

/** Maps keyboard shortcuts to inventory references and equipment selection. */
export class QuickSlotInputController extends ScriptComponent {
	private readonly slots = [
		{ slot: 0, key: "f" },
		{ slot: 1, key: "1" },
		{ slot: 2, key: "2" },
		{ slot: 3, key: "3" },
		{ slot: 4, key: "4" },
		{ slot: 5, key: "5" },
	];

	onUpdate(): void {
		const inventory = this.entity.getComponent(InventoryComponent);
		const quickSlots = this.entity.getComponent(QuickSlotsComponent);
		const equipment = this.entity.getComponent(EquipmentComponent);
		if (!inventory || !quickSlots || !equipment) return;

		quickSlots.removeInvalidReferences(inventory.inventory);
		equipment.clearIfMissing(inventory.inventory);
		for (const slot of this.slots) {
			if (!KeyBoardManager.keyDown(slot.key)) continue;
			const referenceId = quickSlots.get(slot.slot);
			if (referenceId === null) {
				equipment.unequip();
				continue;
			}
			const entry = referenceId ? inventory.inventory.get(referenceId) : undefined;
			if (!entry) continue;
			const definition = inventory.inventory.getDefinition(entry.definitionId);
			if (definition.quickAssignable) equipment.equip(entry.entryId);
		}
	}
}
