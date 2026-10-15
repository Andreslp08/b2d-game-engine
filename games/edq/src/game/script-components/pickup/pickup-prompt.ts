import { Screen } from "engine/graphics/screen/screen";
import Vector2 from "engine/math/vector2";
import { UIComponent } from "engine/ui/components/ui-component";

export class PickupPrompt extends UIComponent {
	private visible = false;
	private keyLabel: string;

	constructor(private readonly itemName: string, keyLabel: string) {
		super({
			position: new Vector2(0, 0),
			rotation: 0,
			size: new Vector2(260, 78),
		});
		this.keyLabel = keyLabel.startsWith("Key") ? keyLabel.slice(3) : keyLabel;
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
