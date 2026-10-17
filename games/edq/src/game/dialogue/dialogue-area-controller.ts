import { GameObject } from "engine/common/entities/game-object";
import { InputActionPhase } from "engine/input/input-context-manager";
import { DynamicBody } from "engine/physics/components/dynamic-body";
import { ScriptComponent } from "engine/scripts/script-component";
import { UIObject } from "engine/ui/entities/ui-object";
import { GameplayAction, InputManagerInstance } from "../input/input-manager";
import { InputContextPriority } from "../input/context-priority";
import { PlayerInputController } from "../script-components/player/player-input-controller";
import { PlayerMovement } from "../script-components/player/player-movement";
import { AimingController } from "../script-components/player/aiming-controller";
import { QuickSlotsComponent } from "../items/components/quick-slots-component";
import { EquipmentComponent } from "../items/components/equipment-component";
import { MarkerSpriteController } from "../script-components/marker/marker-sprite-controller";
import { DialogueManager } from "./dialogue-manager";
import { InteractPrompt } from "../ui-components/interact-prompt";

/** Starts its dialogue only when the player explicitly interacts inside the marker. */
export class DialogueAreaController extends ScriptComponent {
	private playerInRange: GameObject | null = null;
	private activeDialoguePlayer: GameObject | null = null;
	private readonly prompt: InteractPrompt;
	private readonly promptObject = new UIObject();
	private releaseContext: (() => void) | null = null;
	private releaseStartedListener: () => void = () => {};
	private releaseFinishedListener: () => void = () => {};
	private marker: GameObject | null = null;

	constructor(
		private readonly dialogueManager: DialogueManager,
		promptText: string,
		private readonly markerColor: string,
		private readonly playerFacingDirection: "left" | "right",
	) {
		super();
		this.prompt = new InteractPrompt(promptText);
		this.promptObject.addComponent(this.prompt);
	}

	setMarker(marker: GameObject): void {
		this.marker = marker;
	}

	onStart(): void {
		const scene = this.entity.getScene();
		if (scene && this.promptObject.getScene() !== scene) scene.addEntity(this.promptObject);
		void InputManagerInstance.getActionLabel(GameplayAction.Interact).then((label) => {
			if (label) this.prompt.setKeyLabel(label);
		});
		this.releaseStartedListener = this.dialogueManager.on("started", () => this.onDialogueStarted());
		this.releaseFinishedListener = this.dialogueManager.on("finished", () => this.onDialogueFinished());
	}

	onMarkerEnter = (player: GameObject): void => {
		this.playerInRange = player;
		if (this.activeDialoguePlayer) return;
		this.showInteraction();
	};

	onMarkerExit = (player: GameObject): void => {
		if (this.playerInRange === player) this.playerInRange = null;
		if (this.playerInRange || this.activeDialoguePlayer) return;
		this.hideInteraction();
	};

	onMarkerStay = (player: GameObject): void => {
		this.playerInRange = player;
		if (!this.activeDialoguePlayer) this.showInteraction();
	};

	onDestroy(): void {
		this.hideInteraction();
		this.releaseStartedListener();
		this.releaseFinishedListener();
		this.promptObject.destroy();
	}

	private showInteraction(): void {
		if (!this.playerInRange) return;
		this.prompt.setVisible(true);
		this.releaseContext ??= InputManagerInstance.pushContext({
			id: `dialogue-area-${this.entity.id}`,
			priority: InputContextPriority.Interaction,
			actions: [{ action: GameplayAction.Interact, phases: [InputActionPhase.Pressed] }],
			onAction: () => this.startDialogue(),
		});
	}

	private hideInteraction(): void {
		this.prompt.setVisible(false);
		this.releaseContext?.();
		this.releaseContext = null;
	}

	private startDialogue(): void {
		if (!this.playerInRange || this.activeDialoguePlayer) return;
		this.activeDialoguePlayer = this.playerInRange;
		this.hideInteraction();
		const direction = this.playerFacingDirection === "left" ? -1 : 1;
		const movement = this.activeDialoguePlayer.getComponent(PlayerMovement);
		const body = this.activeDialoguePlayer.getComponent(DynamicBody);
		const aiming = this.activeDialoguePlayer.getComponent(AimingController);
		if (movement) movement.direction.x = direction;
		if (body) body.direction.x = direction;
		aiming?.setAimingDirectionX(direction);
		this.dialogueManager.start();
	}

	private onDialogueStarted(): void {
		if (!this.activeDialoguePlayer) return;
		this.activeDialoguePlayer.getComponent(PlayerInputController)?.disableAll();
		const quickSlots = this.activeDialoguePlayer.getComponent(QuickSlotsComponent);
		quickSlots?.setActiveSlot(0);
		if (quickSlots?.get(0) === null) {
			this.activeDialoguePlayer.getComponent(EquipmentComponent)?.unequip();
		}
		this.marker?.getComponent(MarkerSpriteController)?.setColor("rgba(0, 0, 0, 0)");
	}

	private onDialogueFinished(): void {
		if (!this.activeDialoguePlayer) return;
		this.activeDialoguePlayer.getComponent(PlayerInputController)?.enableAll();
		this.marker?.getComponent(MarkerSpriteController)?.setColor(this.markerColor);
		this.activeDialoguePlayer = null;
		if (this.playerInRange) this.showInteraction();
	}
}
