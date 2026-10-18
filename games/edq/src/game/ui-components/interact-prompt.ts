import { Screen } from "@b2d-engine/core/graphics/screen/screen";
import Vector2 from "@b2d-engine/core/math/vector2";
import { UIComponent } from "@b2d-engine/core/ui/components/ui-component";

/** Centered interaction prompt shared by world interaction points. */
export class InteractPrompt extends UIComponent {
	private visible = false;
	private keyLabel = "";

	constructor(private text: string, keyLabel = "") {
		super({
			position: new Vector2(0, 0),
			rotation: 0,
			size: new Vector2(260, 78),
		});
		this.setKeyLabel(keyLabel);
	}

	setText(text: string): void {
		this.text = text;
	}

	setVisible(visible: boolean): void {
		this.visible = visible;
	}

	setKeyLabel(keyLabel: string): void {
		this.keyLabel = keyLabel.startsWith("Key") ? keyLabel.slice(3) : keyLabel;
	}

	render(context: CanvasRenderingContext2D): void {
		if (!this.visible) return;

		const uiSize = Screen.getInstance().getUISize();
		const centerX = uiSize.x / 2;
		const textY = uiSize.y - 112;
		const keySize = 34;
		const keyY = textY + 16;

		context.save();
		context.fillStyle = "#ffffff";
		context.font = "bold 18px sans-serif";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.shadowColor = "rgba(0, 0, 0, 0.85)";
		context.shadowBlur = 3;
		context.fillText(this.text, centerX, textY);

		context.shadowBlur = 0;
		context.fillStyle = "#ffffff";
		context.fillRect(centerX - keySize / 2, keyY, keySize, keySize);
		context.fillStyle = "#111111";
		context.font = "bold 20px sans-serif";
		context.fillText(this.keyLabel, centerX, keyY + keySize / 2);
		context.restore();
	}
}
