import Vector2 from "engine/math/vector2";
import { Screen } from "engine/graphics/screen/screen";
import { UIComponent } from "engine/ui/components/ui-component";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import type { GameObject } from "engine/common/entities/game-object";
import { EquipmentComponent } from "../../items/components/equipment-component";
import { InventoryComponent } from "../../items/components/inventory-component";
import { QuickSlotsComponent } from "../../items/components/quick-slots-component";
import type {
	AnyItemDefinition,
	WeaponDefinition,
} from "../../items/definitions/item-definition";
import type { GameImage } from "engine/common/assets-manager/game-image";
import { getProjectileDefinition } from "../../items/item-catalog/projectile-catalog";

const containerMargin = {
	x: 20,
	y: 0,
};

const containerSize = {
	x: 220,
	y: 138,
};

export class CurrentWeaponUI extends UIComponent {
	constructor() {
		super({
			position: new Vector2(0, 0),
			rotation: 0,
			size: new Vector2(containerSize.x, containerSize.y),
		});
	}

	private drawImageInsideBounds(
		context: CanvasRenderingContext2D,
		image: HTMLImageElement,
		container: { x: number; y: number; width: number; height: number },
		rotationDegrees = 0,
	): void {
		if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) return;

		const isQuarterTurn = Math.abs(rotationDegrees) % 180 === 90;
		const scale = Math.min(
			(isQuarterTurn ? container.height : container.width) / image.naturalWidth,
			(isQuarterTurn ? container.width : container.height) / image.naturalHeight,
		);
		const drawWidth = image.naturalWidth * scale;
		const drawHeight = image.naturalHeight * scale;

		context.save();
		context.translate(container.x + container.width / 2, container.y + container.height / 2);
		context.rotate((rotationDegrees * Math.PI) / 180);
		context.fillStyle = "rgba(255,255,255,255)";
		// context.fillRect(
		// 	-container.width / 2,
		// 	-container.height / 2,
		// 	container.width,
		// 	container.height,
		// );
		context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
		context.restore();
	}

	render(context: CanvasRenderingContext2D): void {
		const scene = this.entity.getScene();
		if (!scene) return;
		const screen = Screen.getInstance();
		const uiSize = screen.getUISize();

		const containerImage = AssetsManager.getImageByName("ui:current-weapon-container");

		this.transform.position = new Vector2(
			uiSize.x - this.transform.size.x - containerMargin.x,
			containerMargin.y,
		);
		context.save();
		context.translate(this.transform.position.x, this.transform.position.y);
		this.drawContainer(context, containerImage);
		context.restore();

		const player = scene.getEntityByTag<GameObject>("player");
		if (!player) {
			this.drawEmpty(context);
			return;
		}
		const equipment = player.getComponent(EquipmentComponent);
		const inventory = player.getComponent(InventoryComponent);
		const quickSlots = player.getComponent(QuickSlotsComponent);

		if (!equipment || !inventory) {
			this.drawEmpty(context, quickSlots?.getActiveKey());
			return;
		}
		const equippedReference = equipment.getEquippedReferenceId();
		if (!equippedReference) {
			if (quickSlots?.getActiveReference() === null) {
				this.drawFist(context, quickSlots.getActiveKey());
			} else {
				this.drawEmpty(context, quickSlots?.getActiveKey());
			}
			return;
		}
		const currentItem = inventory.inventory.get(equippedReference);
		if (!currentItem) {
			this.drawEmpty(context, quickSlots?.getActiveKey());
			return;
		}
		const definitions = inventory.inventory.getDefinition(currentItem.definitionId);
		if (!definitions) {
			this.drawEmpty(context, quickSlots?.getActiveKey());
			return;
		}
		const itemImage: GameImage | undefined = AssetsManager.getImageByName(definitions.icon);
        console.log(definitions.icon,itemImage);
		context.save();
		const padding = {
			x: 20,
			y: 20,
		};
		context.translate(
			this.transform.position.x + padding.x,
			this.transform.position.y + padding.y,
		);

		context.fillStyle = "rgba(255,255,255,255)";
		const weaponImageDrawDimensions = {
			x: 0,
			y: 0,
			width: this.transform.size.x - padding.x * 2,
			height: this.transform.size.y * 0.7 - padding.y * 1.5,
		};
		const infoDrawDimensions = {
			x: 0,
			y: this.transform.size.y * 0.7 - padding.y * 1.5,
			width: this.transform.size.x - padding.x * 2,
			height: this.transform.size.y*0.3,
		};
		if (itemImage) {
			this.drawImageInsideBounds(context, itemImage.nativeElement, {
				...weaponImageDrawDimensions,
			});
		}
		const currentAmmo = currentItem.instance?.state?.currentAmmo ?? 0;
		const totalAmmo = definitions.type === "weapon"
			? currentAmmo + inventory.inventory.countAmmo(definitions.ammoId)
			: 0;
		const keyBind = quickSlots?.getKeyForReference(equippedReference);
		this.drawInfo(context, infoDrawDimensions, currentItem.quantity, definitions, currentAmmo, totalAmmo, keyBind);
		context.restore();
	}

	private drawContainer(context: CanvasRenderingContext2D, containerImage: GameImage) {
		context.drawImage(
			containerImage.nativeElement,
			0,
			0,
			this.transform.size.x,
			this.transform.size.y,
		);
	}

	private drawEmpty(context: CanvasRenderingContext2D, keyBind?: string): void {
		context.save();
		context.translate(this.transform.position.x, this.transform.position.y);
		context.fillStyle = "#ffffff";
		context.font = "bold 20px sans-serif";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.shadowColor = "rgba(0, 0, 0, 0.8)";
		context.shadowBlur = 2;
		context.fillText("Empty", this.transform.size.x / 2, this.transform.size.y / 2);
		if (keyBind) {
			const padding = 20;
			const infoBounds = {
				x: padding,
				y: padding + this.transform.size.y * 0.7 - padding * 1.5,
				width: this.transform.size.x - padding * 2,
				height: this.transform.size.y * 0.3,
			};
			this.drawKeyBind(context, keyBind, infoBounds);
		}
		context.restore();
	}

	private drawFist(context: CanvasRenderingContext2D, keyBind?: string): void {
		const fistImage = AssetsManager.getImageByName("ui:fist");
		if (!fistImage) {
			this.drawEmpty(context, keyBind);
			return;
		}

		const padding = 20;
		this.drawImageInsideBounds(context, fistImage.nativeElement, {
			x: this.transform.position.x + padding,
			y: this.transform.position.y + padding,
			width: this.transform.size.x - padding * 2,
			height: this.transform.size.y * 0.7 - padding * 1.5,
		});
		if (keyBind) {
			this.drawKeyBind(context, keyBind, {
				x: this.transform.position.x + padding,
				y: this.transform.position.y + padding + this.transform.size.y * 0.7 - padding * 1.5,
				width: this.transform.size.x - padding * 2,
				height: this.transform.size.y * 0.3,
			});
		}
	}

	private drawKeyBind(
		context: CanvasRenderingContext2D,
		keyBind: string,
		container: { x: number; y: number; width: number; height: number },
	): void {
		const size = Math.min(container.height * 0.58, container.width * 0.18);
		const x = container.x + container.width - size;
		const y = container.y + (container.height - size) / 2;

		context.save();
		context.fillStyle = "#ffffff";
		context.fillRect(x, y, size, size);
		context.fillStyle = "#111111";
		context.font = `bold ${size * 0.68}px sans-serif`;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillText(keyBind.toUpperCase(), x + size / 2, y + size / 2);
		context.restore();
	}

	private drawInfo(
		context: CanvasRenderingContext2D,
		container: { x: number; y: number; width: number; height: number },
		quantity: number,
		definition: AnyItemDefinition,
		currentAmmo: number,
		totalAmmo: number,
		keyBind?: string,
	) {
		context.save();
		context.textBaseline = "middle";
        const textColors = {
            "default": "#ffffff",
            "empty": "rgba(255, 0, 0, 0.8)",
        }
		context.fillStyle = textColors.default;
		context.shadowColor = "rgba(0, 0, 0, 0.8)";
		context.shadowBlur = 2;
        const fontSize = Math.min(20, container.height * 0.5);


		const isWeapon = definition.type === "weapon";
		if ((isWeapon && totalAmmo === 0) || (!isWeapon && quantity === 0)) {
			context.fillStyle = textColors.empty;
		}
		context.font = `bold ${fontSize}px sans-serif`;
		context.textAlign = "left";
		const countText = isWeapon ? `${currentAmmo}/${totalAmmo}` : `x${quantity}`;
		const centerY = container.y + container.height / 2;
		const itemIcon = this.getCountIcon(definition);
		const iconSize = itemIcon ? container.height * 0.62 : 0;
		const gap = itemIcon ? container.height * 0.12 : 0;
		if (itemIcon) {
			this.drawImageInsideBounds(context, itemIcon.nativeElement, {
				x: container.x,
				y: centerY - iconSize / 2,
				width: iconSize,
				height: iconSize,
			}, isWeapon || definition.type === "ammo" ? -90 : 0);
		}
		context.fillText(countText, container.x + iconSize + gap, centerY);
		if (keyBind) this.drawKeyBind(context, keyBind, container);

		context.restore();
	}

	private getCountIcon(definition: AnyItemDefinition): GameImage | undefined {
		if (definition.type !== "weapon") return undefined;

		const ammoDefinition = this.getAmmoDefinition(definition);
		if (!ammoDefinition) return undefined;
		const projectile = getProjectileDefinition(ammoDefinition.projectileId);
		return AssetsManager.getImageByName(projectile.image) ?? undefined;
	}

	private getAmmoDefinition(definition: WeaponDefinition) {
		const player = this.entity.getScene()?.getEntityByTag<GameObject>("player");
		const inventory = player?.getComponent(InventoryComponent);
		const ammo = inventory?.inventory.getDefinition(definition.ammoId);
		return ammo?.type === "ammo" ? ammo : undefined;
	}

}
