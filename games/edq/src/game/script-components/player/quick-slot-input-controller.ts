import { ScriptComponent } from "@b2d-engine/core/scripts/script-component";
import { InventoryComponent } from "../../items/components/inventory-component";
import {
	QUICK_SLOT_BINDINGS,
	QuickSlotsComponent,
} from "../../items/components/quick-slots-component";
import { EquipmentComponent } from "../../items/components/equipment-component";
import { PlayerInputController } from "./player-input-controller";
import { PlayerInputPermission } from "./player-input-controller";
import { GameplayAction, InputManagerInstance } from "../../input/input-manager";

const quickSlotActions = [
	GameplayAction.QuickSlot0,
	GameplayAction.QuickSlot1,
	GameplayAction.QuickSlot2,
	GameplayAction.QuickSlot3,
	GameplayAction.QuickSlot4,
	GameplayAction.QuickSlot5,
] as const;

/** Maps keyboard shortcuts to inventory references and equipment selection. */
export class QuickSlotInputController extends ScriptComponent {
	onUpdate(): void {
		const inventory = this.entity.getComponent(InventoryComponent);
		const quickSlots = this.entity.getComponent(QuickSlotsComponent);
		const equipment = this.entity.getComponent(EquipmentComponent);
		const input = this.entity.getComponent(PlayerInputController);
		if (!inventory || !quickSlots || !equipment || !input?.isEnabled(PlayerInputPermission.WeaponUse)) return;

		quickSlots.removeInvalidReferences(inventory.inventory);
		equipment.clearIfMissing(inventory.inventory);
		for (const slot of QUICK_SLOT_BINDINGS) {
			if (!InputManagerInstance.isDown(quickSlotActions[slot.slot])) continue;
			quickSlots.setActiveSlot(slot.slot);
			const referenceId = quickSlots.get(slot.slot);
			if (referenceId === null) {
				equipment.unequip();
				continue;
			}
			const entry = referenceId ? inventory.inventory.get(referenceId) : undefined;
			if (!entry) {
				equipment.unequip();
				continue;
			}
			const definition = inventory.inventory.getDefinition(entry.definitionId);
			if (definition.quickAssignable) equipment.equip(entry.entryId);
			else equipment.unequip();
		}
	}
}
