import { GameObject } from "engine/common/entities/game-object";
import Vector2 from "engine/math/vector2";
import type { AnyItemDefinition } from "../items/definitions/item-definition";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { getProjectileDefinition } from "../items/item-catalog";
import type { GameImage } from "engine/common/assets-manager/game-image";
import { createMarker } from "./marker";
import { MarkerType } from "../config/constants";
import type { Scene } from "engine/scenes/scene";
import { ScriptComponent } from "engine/scripts/script-component";
import {
	KeyBoardManager,
	PhysicalKey,
	type PhysicalKeyCode,
} from "engine/input/keyboard-manager";
import { Screen } from "engine/graphics/screen/screen";
import { UIComponent } from "engine/ui/components/ui-component";
import { UIObject } from "engine/ui/entities/ui-object";
import { InventoryComponent } from "../items/components/inventory-component";
import { QuickSlotsComponent } from "../items/components/quick-slots-component";

type Params = {
	scene: Scene;
	position: Vector2;
	size?: Vector2;
	keybind?: PhysicalKeyCode;
	amount: number;
	definition: AnyItemDefinition;
};

export const createPickup = ({
	scene,
	position,
	size = new Vector2(1, 1),
	keybind = PhysicalKey.E,
	amount,
	definition,
}: Params) => {
	if (!Number.isInteger(amount) || amount <= 0) {
		throw new Error("Pickup amount must be a positive integer");
	}
	console.log(definition);
	let spriteImageId: string = definition.icon;
	let imageRotation = 0;
	const isAmmo = definition.type === "ammo";
	if (isAmmo) {
		spriteImageId = getProjectileDefinition(definition.projectileId).image;
		imageRotation = -90;
	}
	const spriteImage: GameImage = AssetsManager.getImageByName(spriteImageId);

	const frameSize = {
		w: spriteImage.nativeElement.naturalWidth,
		h: spriteImage.nativeElement.naturalHeight,
	};
	const aspectRatio = frameSize.w / frameSize.h;
	const isQuarterTurn = Math.abs(imageRotation) % 180 === 90;
	const spriteSize = isQuarterTurn
		? new Vector2(size.y, size.y / aspectRatio)
		: new Vector2(size.y * aspectRatio, size.y);
	const controller = new PickupController(definition, amount, keybind);
	const marker = createMarker({
		position,
		size: size.clone().scale(2),
		markerType: MarkerType.corona,
		arrowDirection: "None",
		triggerForEntitiesWithTags: ["player"],
		onEnter: controller.onMarkerEnter,
		onExit: controller.onMarkerExit,
		onStay: controller.onMarkerStay,
	});
	marker.addComponent(controller);
	scene.addEntity(marker);
	const obj = new GameObject({ position, rotation: 0, size: spriteSize });
	controller.setPickupObject(obj);
	const itemSprite = new Sprite({
		image: spriteImage,
		framePosition: new Vector2(0, 0),
		frameSize,
		aspectMode: "contain",
		rotation: 0,
		scale: new Vector2(0.45, 0.45),
	});

	obj.addComponent(itemSprite);
	return obj;
};

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

class PickupPrompt extends UIComponent {
	private visible = false;

	private keyLabel: string;

	constructor(private readonly itemName: string, keybind: PhysicalKeyCode) {
		super({
			position: new Vector2(0, 0),
			rotation: 0,
			size: new Vector2(260, 78),
		});
		this.keyLabel = keybind.startsWith("Key") ? keybind.slice(3) : keybind;
	}

	setVisible(visible: boolean): void {
		this.visible = visible;
	}

	getItemName(): string {
		return this.itemName;
	}

	setKeyLabel(keyLabel: string): void {
		this.keyLabel = keyLabel;
	}

	render(context: CanvasRenderingContext2D): void {
		if (!this.visible) return;

		const uiSize = Screen.getInstance().getUISize();
		const centerX = uiSize.x / 2;
		const nameY = uiSize.y - 112;
		const keySize = 34;
		const keyY = nameY + 16;

		context.save();
		context.fillStyle = "#ffffff";
		context.font = "bold 18px sans-serif";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.shadowColor = "rgba(0, 0, 0, 0.85)";
		context.shadowBlur = 3;
		context.fillText(this.itemName, centerX, nameY);

		context.shadowBlur = 0;
		context.fillStyle = "#ffffff";
		context.fillRect(centerX - keySize / 2, keyY, keySize, keySize);
		context.fillStyle = "#111111";
		context.font = "bold 20px sans-serif";
		context.fillText(this.keyLabel, centerX, keyY + keySize / 2);
		context.restore();
	}
}
