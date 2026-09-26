import { ScriptComponent } from "engine/scripts/script-component";
import { EquipmentComponent } from "../../items/components/equipment-component";
import { InventoryComponent } from "../../items/components/inventory-component";
import { QuickSlotsComponent } from "../../items/components/quick-slots-component";
import { HealthComponent } from "../shared/health-component";
import { HealingFlashEffect } from "../shared/healing-flash-effect";

/** Consumes an equipped first-aid kit and restores the player's health. */
export class PlayerAidKitController extends ScriptComponent {
	private lastEquippedReference?: string;

	onUpdate(): void {
		const equipment = this.entity.getComponent(EquipmentComponent);
		const inventory = this.entity.getComponent(InventoryComponent);
		const health = this.entity.getComponent(HealthComponent);
		if (!equipment || !inventory || !health) return;
		if(health.getHealth() === health.getMaxHealth()) return;

		const equippedReference = equipment.getEquippedReferenceId();
		if (!equippedReference || equippedReference === this.lastEquippedReference) return;
		this.lastEquippedReference = equippedReference;

		const entry = inventory.inventory.get(equippedReference);
		if (!entry) return;
		const definition = inventory.inventory.getDefinition(entry.definitionId);
		if (definition.type !== "consumable" || definition.effectId !== "restore_health") return;
		if (!inventory.inventory.remove(entry.entryId)) return;

		health.setHealth(health.getMaxHealth());
		this.entity.getComponent(HealingFlashEffect)?.play();
		equipment.unequip();
		this.entity.getComponent(QuickSlotsComponent)?.clearReference(entry.entryId);
	}
}
