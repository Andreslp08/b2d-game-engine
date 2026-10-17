import { GameEvent } from "engine/common/events/game-event";
import { UIObject } from "engine/ui/entities/ui-object";
import { DialogueComponent } from "./dialogue-component";
import { DialogueControllerComponent } from "./dialogue-controller-component";
import type {
	Dialogue,
	DialogueEvent,
	DialogueEventTypes,
	DialogueLines,
	DialogueListener,
	DialogueParams,
} from "./dialogue-types";

export class DialogueManager {
	ui: UIObject;
	scene: DialogueParams["scene"];
	private readonly dialogueComponent: DialogueComponent;
	private dialogues: Dialogue[] = [];
	private currentDialogueIndex = 0;
	private readonly onStarted = new GameEvent<DialogueEvent>();
	private readonly onFinished = new GameEvent<DialogueEvent>();
	private readonly onDialogueStarted = new GameEvent<DialogueEvent>();
	private readonly onDialogueFinished = new GameEvent<DialogueEvent>();
	private readonly onCurrentDialogueChanged = new GameEvent<DialogueEvent>();
	private readonly onCurrentLineChanged = new GameEvent<DialogueEvent>();
	private readonly onLastLine = new GameEvent<DialogueEvent>();
	private currentDialogue: Dialogue | null = null;
	private currentDialogueLineIndex = 0;
	private currentDialogueLine: DialogueLines | null = null;
	private currentDialogueFinished = false;
	private finished = false;

	constructor({ scene, dialogues }: DialogueParams) {
		if (!scene) throw new Error("No scene provided");
		this.ui = new UIObject();
		this.dialogueComponent = new DialogueComponent(this);
		this.ui.addComponent(this.dialogueComponent);
		this.ui.addComponent(new DialogueControllerComponent(this, this.dialogueComponent));
		this.scene = scene;
		this.scene.addEntity(this.ui);
		this.on("started", () => this.dialogueComponent.setVisible(true));
		this.on("finished", () => this.dialogueComponent.setVisible(false));
		this.loadDialogues(dialogues);
	}

	loadDialogues(dialogues: Dialogue[]): void {
		this.dialogues = dialogues;
		this.setCurrentDialogue(0);
		this.finished = false;
	}

	start(): void {
		this.setCurrentDialogue(0);
		this.finished = false;
		this.emit(this.onStarted);
		this.emit(this.onDialogueStarted);
		this.emit(this.onCurrentDialogueChanged);
		this.emitLineChanged();
	}

	finish(): void {
		if (this.finished) return;
		this.finished = true;
		this.emit(this.onFinished);
	}

	advance(): void {
		if (!this.currentDialogue || this.finished) return;
		if (this.currentDialogueLineIndex + 1 < this.currentDialogue.lines.length) {
			this.nextLine();
			return;
		}
		this.next();
	}

	retreat(): void {
		if (!this.currentDialogue) return;
		if (this.currentDialogueLineIndex > 0) {
			this.prevLine();
			return;
		}
		if (this.currentDialogueIndex <= 0) return;
		this.prev();
		this.lastLine();
	}

	next(): void {
		const nextDialogueIndex = this.currentDialogueIndex + 1;
		if (nextDialogueIndex >= this.dialogues.length) {
			this.completeCurrentDialogue();
			this.finish();
			return;
		}

		this.completeCurrentDialogue();
		this.setCurrentDialogue(nextDialogueIndex);
		this.emit(this.onDialogueStarted);
		this.emit(this.onCurrentDialogueChanged);
		this.emitLineChanged();
	}

	prev(): void {
		const prevDialogueIndex = this.currentDialogueIndex - 1;
		if (prevDialogueIndex < 0) return;
		this.setCurrentDialogue(prevDialogueIndex);
		this.emit(this.onCurrentDialogueChanged);
		this.emitLineChanged();
	}

	nextLine(): void {
		const nextLineIndex = this.currentDialogueLineIndex + 1;
		if (!this.currentDialogue) return;
		if (nextLineIndex >= this.currentDialogue.lines.length) {
			this.completeCurrentDialogue();
			if (this.currentDialogueIndex === this.dialogues.length - 1) this.finish();
			return;
		}
		this.currentDialogueLineIndex = nextLineIndex;
		this.currentDialogueLine = this.currentDialogue.lines[this.currentDialogueLineIndex];
		this.emitLineChanged();
	}

	prevLine(): void {
		const prevLineIndex = this.currentDialogueLineIndex - 1;
		if (!this.currentDialogue || prevLineIndex < 0) return;
		this.currentDialogueLineIndex = prevLineIndex;
		this.currentDialogueLine = this.currentDialogue.lines[this.currentDialogueLineIndex];
		this.emitLineChanged();
	}

	lastLine(): void {
		if (!this.currentDialogue || this.currentDialogue.lines.length === 0) return;
		this.currentDialogueLineIndex = this.currentDialogue.lines.length - 1;
		this.currentDialogueLine = this.currentDialogue.lines[this.currentDialogueLineIndex];
		this.emitLineChanged();
	}

	on(event: DialogueEventTypes, listener: DialogueListener): () => void {
		switch (event) {
			case "dialogueStarted": return this.onDialogueStarted.subscribe(listener);
			case "dialogueFinished": return this.onDialogueFinished.subscribe(listener);
			case "dialogueChanged": return this.onCurrentDialogueChanged.subscribe(listener);
			case "started": return this.onStarted.subscribe(listener);
			case "finished": return this.onFinished.subscribe(listener);
			case "lineChanged": return this.onCurrentLineChanged.subscribe(listener);
			case "lastDialogueLine": return this.onLastLine.subscribe(listener);
		}
	}

	getCurrentDialogue(): Dialogue | null {
		return this.currentDialogue;
	}

	getCurrentLine(): DialogueLines | null {
		return this.currentDialogueLine;
	}

	private setCurrentDialogue(index: number): void {
		this.currentDialogueIndex = index;
		this.currentDialogueLineIndex = 0;
		this.currentDialogue = this.dialogues[index] ?? null;
		this.currentDialogueLine = this.currentDialogue?.lines[0] ?? null;
		this.currentDialogueFinished = false;
	}

	private emit(event: GameEvent<DialogueEvent>): void {
		if (!this.currentDialogue || !this.currentDialogueLine) return;
		event.emit({ currentDialogue: this.currentDialogue, currentLine: this.currentDialogueLine });
	}

	private emitLineChanged(): void {
		this.emit(this.onCurrentLineChanged);
		if (
			this.currentDialogue &&
			this.currentDialogueLineIndex === this.currentDialogue.lines.length - 1
		) {
			this.emit(this.onLastLine);
		}
	}

	private completeCurrentDialogue(): void {
		if (this.currentDialogueFinished) return;
		this.currentDialogueFinished = true;
		this.emit(this.onDialogueFinished);
	}
}
