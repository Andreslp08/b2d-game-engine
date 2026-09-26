import Vector2 from "engine/math/vector2";
import { Screen } from "engine/graphics/screen/screen";
import { UIComponent } from "engine/ui/components/ui-component";
import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import type { GameObject } from "engine/common/entities/game-object";
import { EquipmentComponent } from "../../items/components/equipment-component";
import { InventoryComponent } from "../../items/components/inventory-component";
import type {
	AnyItemDefinition,
	WeaponDefinition,
} from "../../items/definitions/item-definition";
import type { GameImage } from "engine/common/assets-manager/game-image";

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
	): void {
		if (!image.complete || image.naturalWidth === 0 || image.naturalHeight === 0) return;

		const scale = Math.min(
			container.width / image.naturalWidth,
			container.height / image.naturalHeight,
		);
		const drawWidth = image.naturalWidth * scale;
		const drawHeight = image.naturalHeight * scale;

		context.save();
		context.translate(container.x + container.width / 2, container.y + container.height / 2);
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

		if (!equipment || !inventory) {
			this.drawEmpty(context);
			return;
		}
		const equippedReference = equipment.getEquippedReferenceId();
		if (!equippedReference) {
			this.drawEmpty(context);
			return;
		}
		const currentItem = inventory.inventory.findByInstanceId(equippedReference);
		if (!currentItem) {
			this.drawEmpty(context);
			return;
		}
		const definitions = inventory.inventory.getDefinition(currentItem.definitionId);
		if (!definitions) {
			this.drawEmpty(context);
			return;
		}
		const { type } = definitions;
		let weaponImage: GameImage | undefined;
		if (type === "weapon") {
			const weaponDefinitions = definitions as WeaponDefinition;
			weaponImage = AssetsManager.getImageByName(weaponDefinitions.weaponVisual.image);
		}
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
		if (weaponImage) {
			this.drawImageInsideBounds(context, weaponImage.nativeElement, {
				...weaponImageDrawDimensions,
			});
		}
		const currentAmmo = currentItem.instance?.state?.currentAmmo ?? 0;
		const totalAmmo = definitions.type === "weapon"
			? currentAmmo + inventory.inventory.countAmmo(definitions.ammoType)
			: 0;
		this.drawInfo(context, infoDrawDimensions, currentItem.quantity, definitions, currentAmmo, totalAmmo);
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

	private drawEmpty(context: CanvasRenderingContext2D): void {
		context.save();
		context.translate(this.transform.position.x, this.transform.position.y);
		context.fillStyle = "#ffffff";
		context.font = "bold 20px sans-serif";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.shadowColor = "rgba(0, 0, 0, 0.8)";
		context.shadowBlur = 2;
		context.fillText("Empty", this.transform.size.x / 2, this.transform.size.y / 2);
		context.restore();
	}

	private drawInfo(
		context: CanvasRenderingContext2D,
		container: { x: number; y: number; width: number; height: number },
		quantity: number,
		definition: AnyItemDefinition,
		currentAmmo: number,
		totalAmmo: number,
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


		if (definition.type === "weapon") {
			context.font = `bold ${fontSize}px sans-serif`;
			context.textAlign = "left";
            if(currentAmmo === 0 && totalAmmo === 0) {
                context.fillStyle = textColors.empty;
            }
			context.fillText(`${currentAmmo}/${totalAmmo}`, container.x, container.y + container.height / 2);
			const projectileImage = AssetsManager.getImageByName(definition.projectile.image);
			const iconSize = container.height * 0.8;
			this.drawImageInsideBounds(context, projectileImage.nativeElement, {
				x: container.x + container.width - iconSize,
				y: container.y + (container.height - iconSize) / 2,
				width: iconSize,
				height: iconSize,
			});
		} else {
            if(quantity === 0) {
                context.fillStyle = textColors.empty;
            }
			context.font = `bold ${fontSize}px sans-serif`;
			context.textAlign = "left";
			context.fillText(`x${quantity}`, container.x, container.y + container.height / 2);
		}

		context.restore();
	}

}
