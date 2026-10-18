import { AssetsManager } from "@b2d-engine/core/common/assets-manager/assets-manager";
import { Time } from "@b2d-engine/core/common/interfaces/time";
import { Screen } from "@b2d-engine/core/graphics/screen/screen";
import { MathUtil } from "@b2d-engine/core/math/math-util";
import Vector2 from "@b2d-engine/core/math/vector2";
import { UIComponent } from "@b2d-engine/core/ui/components/ui-component";
import { InputManagerInstance } from "../input/input-manager";
import { DialogueManager } from "./dialogue-manager";
import type { DialogueLines } from "./dialogue-types";

export class DialogueComponent extends UIComponent {
	private static readonly designSize = new Vector2(1920, 1080);

	private visible = false;
	private bindKey = "";
	private transitionDuration = 0.5;
	private transitionStartTime = 0;
	private currentTransition: "" | "IN" | "OUT" = "";
	private alpha = 0;
	private verticalOffset = 0;
	private readonly typewriterCharactersPerSecond = 80;
	private typewriterLine: DialogueLines | null = null;
	private typewriterStartedAt = 0;
	private visibleCharacterCount = 0;
	private image = AssetsManager.getImageByName("ui:dialogue-window");

	constructor(private dialogManager: DialogueManager) {
		super({
			position: new Vector2(0, 0),
			rotation: 0,
			size: new Vector2(0, 0),
		});

		InputManagerInstance.getActionLabel("interact").then((bindKey) => {
			if (bindKey) this.bindKey = bindKey;
		});
	}

	setVisible(visible: boolean): void {
		this.currentTransition = visible ? "IN" : "OUT";
		this.transitionStartTime = Time.time;
		this.visible = visible;
	}

	completeTypewriter(): boolean {
		const currentLine = this.dialogManager.getCurrentLine();
		if (!currentLine) return false;
		this.syncTypewriter(currentLine);
		if (this.visibleCharacterCount >= currentLine.text.length) return false;
		this.typewriterStartedAt =
			Time.time - currentLine.text.length / this.typewriterCharactersPerSecond;
		this.visibleCharacterCount = currentLine.text.length;
		return true;
	}

	render(context: CanvasRenderingContext2D): void {
		if (!this.visible && !this.currentTransition) return;
		const currentDialogLine = this.dialogManager.getCurrentLine();
		if (!currentDialogLine) return;

		this.updateTransition();
		this.syncTypewriter(currentDialogLine);
		this.visibleCharacterCount = Math.min(
			currentDialogLine.text.length,
			Math.floor((Time.time - this.typewriterStartedAt) * this.typewriterCharactersPerSecond),
		);

		const uiSize = Screen.getInstance().getUISize();
		const designSize = DialogueComponent.designSize;
		const scale = Math.min(uiSize.x / designSize.x, uiSize.y / designSize.y);
		const offset = new Vector2(
			(uiSize.x - designSize.x * scale) / 2,
			(uiSize.y - designSize.y * scale) / 2,
		);
		const size = new Vector2(designSize.x * 0.8, designSize.y * 0.4);
		const position = new Vector2((designSize.x - size.x) / 2, (designSize.y - size.y) * 0.1);
		const containerPadding = new Vector2(50, 50);
		const contentWidth = size.x - containerPadding.x * 2;

		context.save();
		context.globalAlpha = this.alpha;
		context.translate(offset.x, offset.y);
		context.scale(scale, scale);
		context.translate(0, this.verticalOffset);
		context.drawImage(this.image.nativeElement, position.x, position.y, size.x, size.y);
		context.save();
		context.translate(position.x + containerPadding.x, position.y + containerPadding.y);
		this.renderSpeakerName(context, currentDialogLine.speakerName);
		context.translate(0, 50);
		this.renderMessage(
			context,
			currentDialogLine.text,
			this.visibleCharacterCount,
			contentWidth,
		);
		context.restore();
		this.renderInteractButton(
			context,
			this.bindKey,
			position.x + size.x / 2,
			position.y + size.y - 60,
		);
		this.entity.setZindex(1000);
		context.restore();
	}

	private updateTransition(): void {
		if (!this.currentTransition) return;
		const elapsed = Time.time - this.transitionStartTime;
		const progress = Math.min(elapsed / this.transitionDuration, 1);
		const isEntering = this.currentTransition === "IN";
		this.alpha = MathUtil.lerp(isEntering ? 0 : 1, isEntering ? 1 : 0, progress);
		this.verticalOffset = MathUtil.lerp(isEntering ? 40 : 0, isEntering ? 0 : -40, progress);
		if (progress !== 1) return;
		this.currentTransition = "";
		this.alpha = isEntering ? 1 : 0;
		this.verticalOffset = 0;
	}

	private syncTypewriter(line: DialogueLines): void {
		if (this.typewriterLine === line) return;
		this.typewriterLine = line;
		this.typewriterStartedAt = Time.time;
		this.visibleCharacterCount = 0;
	}

	private renderMessage(
		context: CanvasRenderingContext2D,
		message: string,
		visibleCharacterCount: number,
		maxWidth: number,
	): void {
		context.save();
		context.fillStyle = "#ffffff";
		context.textAlign = "left";
		context.textBaseline = "top";
		const styles = getComputedStyle(document.documentElement);
		const bodyFont = styles.getPropertyValue("--font-body").trim() || "sans-serif";
		context.font = `500 40px ${bodyFont}`;

		const lineHeight = 48;
		let remainingCharacters = visibleCharacterCount;
		this.wrapMessage(context, message, maxWidth).forEach((line, index) => {
			if (remainingCharacters > 0) {
				context.fillText(line.slice(0, remainingCharacters), 0, index * lineHeight);
			}
			// One source character separates wrapped lines: a space or explicit newline.
			remainingCharacters -= line.length + 1;
		});
		context.restore();
	}

	private wrapMessage(context: CanvasRenderingContext2D, message: string, maxWidth: number): string[] {
		const lines: string[] = [];
		for (const paragraph of message.split("\n")) {
			let line = "";
			for (const word of paragraph.split(/\s+/)) {
				const nextLine = line ? `${line} ${word}` : word;
				if (line && context.measureText(nextLine).width > maxWidth) {
					lines.push(line);
					line = word;
				} else {
					line = nextLine;
				}
			}
			lines.push(line);
		}
		return lines;
	}

	private renderSpeakerName(context: CanvasRenderingContext2D, speakerName: string): void {
		context.save();
		const styles = getComputedStyle(document.documentElement);
		const bodyFont = styles.getPropertyValue("--font-heading-variant").trim() || "sans-serif";
		context.fillStyle = "#FF8383";
		context.font = `500 30px ${bodyFont}`;
		context.textAlign = "left";
		context.textBaseline = "top";
		context.fillText(speakerName.toUpperCase(), 0, 0);
		context.restore();
	}

	private renderInteractButton(
		context: CanvasRenderingContext2D,
		keyLabel: string,
		x: number,
		y: number,
	): void {
		const keySize = 34;
		const label = keyLabel.startsWith("Key") ? keyLabel.slice(3) : keyLabel;
		context.save();
		context.fillStyle = "#ffffff";
		context.fillRect(x - keySize / 2, y, keySize, keySize);
		context.fillStyle = "#111111";
		context.font = "bold 20px sans-serif";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillText(label, x, y + keySize / 2);
		context.restore();
	}
}
