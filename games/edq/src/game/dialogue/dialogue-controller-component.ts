import { InputActionPhase } from "engine/input/input-context-manager";
import { ScriptComponent } from "engine/scripts/script-component";
import { GameplayAction, InputManagerInstance } from "../input/input-manager";
import { InputContextPriority } from "../input/context-priority";
import { DialogueComponent } from "./dialogue-component";
import { DialogueManager } from "./dialogue-manager";

export class DialogueControllerComponent extends ScriptComponent {
	private releaseInteractionContext: () => void = () => {};
	private releaseEscapeContext: () => void = () => {};
	private releaseStartedListener: () => void = () => {};
	private releaseFinishedListener: () => void = () => {};

	constructor(
		private dialogueManager: DialogueManager,
		private dialogueComponent: DialogueComponent,
	) {
		super();
	}

	private releaseInputContexts(): void {
		this.releaseInteractionContext();
		this.releaseEscapeContext();
		this.releaseInteractionContext = () => {};
		this.releaseEscapeContext = () => {};
	}

	private activateInputContexts(): void {
		this.releaseInputContexts();
		this.handleInteraction();
		this.handleEscape();
	}

	private handleInteraction(): void {
		this.releaseInteractionContext = InputManagerInstance.pushContext({
			id: "dialogue",
			dispatchMode: "immediate",
			priority: InputContextPriority.Modal,
			actions: [{ action: GameplayAction.Interact, phases: [InputActionPhase.Pressed] }],
			onAction: (event) => {
				if (event.phase !== InputActionPhase.Pressed) return;
				if (this.dialogueComponent.completeTypewriter()) return;
				this.dialogueManager.advance();
			},
		});
	}

	private handleEscape(): void {
		this.releaseEscapeContext = InputManagerInstance.pushContext({
			id: "dialogue-close",
			dispatchMode: "immediate",
			priority: InputContextPriority.Modal + 1,
			actions: [{ action: GameplayAction.Back, phases: [InputActionPhase.Pressed] }],
			onAction: (event) => {
				if (event.phase === InputActionPhase.Pressed) this.dialogueManager.finish();
			},
		});
	}

	onStart(): void {
		this.releaseStartedListener = this.dialogueManager.on("started", () =>
			this.activateInputContexts(),
		);
		this.releaseFinishedListener = this.dialogueManager.on("finished", () =>
			this.releaseInputContexts(),
		);
	}

	onDestroy(): void {
		this.releaseInputContexts();
		this.releaseStartedListener();
		this.releaseFinishedListener();
	}
}
