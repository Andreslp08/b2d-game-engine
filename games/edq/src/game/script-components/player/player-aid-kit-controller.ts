import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { GameObject } from "engine/common/entities/game-object";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import { Transform } from "engine/common/components/transform";
import Vector2 from "engine/math/vector2";
import { ScriptComponent } from "engine/scripts/script-component";
import { EquipmentComponent } from "../../items/components/equipment-component";
import { InventoryComponent } from "../../items/components/inventory-component";
import { QuickSlotsComponent } from "../../items/components/quick-slots-component";
import { HealthComponent } from "../shared/health-component";
import { HealingFlashEffect } from "../shared/healing-flash-effect";
import { MouseManager } from "engine/input/mouse-manager";

/** Consumes an equipped first-aid kit when the player clicks. */
export class PlayerAidKitController extends ScriptComponent {
	private wasLeftClickDown = false;
	private aidKitVisual: GameObject;

	onStart(): void {
		const image = AssetsManager.getImageByName("spritesheet:items:consumable:first_aid");
		const imageSize = {
			w: image.nativeElement.naturalWidth,
			h: image.nativeElement.naturalHeight,
		};
		const sprite = new Sprite({
			image,
			framePosition: new Vector2(0, 0),
			frameSize: imageSize,
			sourceSize: imageSize,
			spriteSourceSize: { x: 0, y: 0, ...imageSize },
			pivot: new Vector2(0.5, 0.5),
		});
		sprite.setZindex(2);
		sprite.setVisible(false);
		this.aidKitVisual = new GameObject(
			{
				position: new Vector2(0, 0),
				rotation: 0,
				size: new Vector2(0.35, 0.35),
			},
			sprite,
		);
	}

	onUpdate(): void {
		this.updateAidKitVisual();
		const leftClickDown = MouseManager.isLeftClickDown();
		const clicked = leftClickDown && !this.wasLeftClickDown;
		this.wasLeftClickDown = leftClickDown;
		if (!clicked) return;

		const equipment = this.entity.getComponent(EquipmentComponent);
		const inventory = this.entity.getComponent(InventoryComponent);
		const health = this.entity.getComponent(HealthComponent);
		if (!equipment || !inventory || !health) return;
		if (health.getHealth() === health.getMaxHealth()) return;

		const equippedReference = equipment.getEquippedReferenceId();
		if (!equippedReference) return;

		const entry = inventory.inventory.get(equippedReference);
		if (!entry) return;
		const definition = inventory.inventory.getDefinition(entry.definitionId);
		if (definition.type !== "consumable" || definition.effectId !== "restore_health") return;
		if (!inventory.inventory.remove(entry.entryId)) return;

		health.setHealth(health.getMaxHealth());
		this.entity.getComponent(HealingFlashEffect)?.play();
		if (entry.quantity === 0) {
			equipment.unequip();
			this.entity.getComponent(QuickSlotsComponent)?.clearReference(entry.entryId);
		}
	}

	private updateAidKitVisual(): void {
		if (!this.aidKitVisual) return;

		const playerTransform = this.entity.getComponent(Transform);
		const equipment = this.entity.getComponent(EquipmentComponent);
		const inventory = this.entity.getComponent(InventoryComponent);
		const sprite = this.aidKitVisual.getComponent(Sprite);
		if (!playerTransform || !equipment || !inventory || !sprite) return;

		const equippedReference = equipment.getEquippedReferenceId();
		const entry = equippedReference ? inventory.inventory.get(equippedReference) : undefined;
		const definition = entry ? inventory.inventory.getDefinition(entry.definitionId) : undefined;
		const isAidKitActive = definition?.type === "consumable" && definition.effectId === "restore_health";

		const scene = this.entity.getScene();
		if (scene && this.aidKitVisual.getScene() !== scene) scene.addEntity(this.aidKitVisual);

		this.aidKitVisual.getComponent(Transform).position = playerTransform.position
			.clone()
			.add(new Vector2(0.55, 0.15));
		sprite.setVisible(isAidKitActive);
	}

	onDestroy(): void {
		this.aidKitVisual?.destroy();
	}
}
