import { InputManager, type InputAction } from "@b2d-engine/core/input/input-manager";
import { PhysicalKey as Key } from "@b2d-engine/core/input/keyboard-manager";

const InputManagerInstance = new InputManager();
export const GameplayAction = {
	Interact: "interact",
	Move: "move",
	MoveLeft: "move-left",
	MoveRight: "move-right",
	Jump: "jump",
	Dash: "dash",
	Fire: "fire",
	Reload: "reload",
	QuickSlot0: "quick-slot-0",
	QuickSlot1: "quick-slot-1",
	QuickSlot2: "quick-slot-2",
	QuickSlot3: "quick-slot-3",
	QuickSlot4: "quick-slot-4",
	QuickSlot5: "quick-slot-5",
	Back: "back",
	InventoryToggle: "inventory-toggle",
} as const;

const actions: InputAction[] = [
	{
		name: GameplayAction.Move,
		type: "vector2",
		bindings: [
			{
				device: "keyboard",
				composite: "2d-vector",
				up:null,
				down:null,
				left: Key.A,
				right: Key.D,
			},
			{
				device: "keyboard",
				composite: "2d-vector",
				up: null,
				down: null,
				left: Key.ArrowLeft,
				right: Key.ArrowRight,
			},
		],
	},
	{
		name: GameplayAction.Interact,
		type: "button",
		bindings: [{ device: "keyboard", input: Key.E }],
	},
	{ name: GameplayAction.Jump, type: "button", bindings: [{ device: "keyboard", input: Key.W }, { device: "keyboard", input: Key.ArrowUp }] },
	{
		name: GameplayAction.Dash,
		type: "button",
		bindings: [{ device: "keyboard", input: Key.Q }],
	},
	{
		name: GameplayAction.Fire,
		type: "button",
		bindings: [{ device: "mouse", input: "left" }],
	},
	{
		name: GameplayAction.Reload,
		type: "button",
		bindings: [{ device: "keyboard", input: Key.R }],
	},
	{
		name: GameplayAction.QuickSlot0,
		type: "button",
		bindings: [{ device: "keyboard", input: Key.F }],
	},
	{
		name: GameplayAction.QuickSlot1,
		type: "button",
		bindings: [{ device: "keyboard", input: Key.Digit1 }],
	},
	{
		name: GameplayAction.QuickSlot2,
		type: "button",
		bindings: [{ device: "keyboard", input: Key.Digit2 }],
	},
	{
		name: GameplayAction.QuickSlot3,
		type: "button",
		bindings: [{ device: "keyboard", input: Key.Digit3 }],
	},
	{
		name: GameplayAction.QuickSlot4,
		type: "button",
		bindings: [{ device: "keyboard", input: Key.Digit4 }],
	},
	{
		name: GameplayAction.QuickSlot5,
		type: "button",
		bindings: [{ device: "keyboard", input: Key.Digit5 }],
	},
	{
		name: GameplayAction.Back,
		type: "button",
		bindings: [{ device: "keyboard", input: Key.Escape }],
	},
	{
		name: GameplayAction.InventoryToggle,
		type: "button",
		bindings: [{ device: "keyboard", input: Key.Tab }],
	},
];

for (const action of actions) {
	InputManagerInstance.addAction(action);
}

export { InputManagerInstance };
