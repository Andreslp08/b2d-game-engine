import {
	GamePadAxis,
	GamePadButton,
	InputManager,
	type InputAction,
} from "@b2d-engine/core/input/input-manager";
import { PhysicalKey as Key } from "@b2d-engine/core/input/keyboard-manager";

const InputManagerInstance = new InputManager();
export const GameplayAction = {
	Interact: "interact",
	Move: "move",
	Aim: "aim",
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
				up: null,
				down: null,
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
			{
				device: "gamepad",
				composite: "2d-vector",
				x: GamePadAxis.axis_0,
				y: GamePadAxis.axis_1,
			},
		],
	},
	{
		name: GameplayAction.Aim,
		type: "vector2",
		bindings: [
			{
				device: "gamepad",
				composite: "2d-vector",
				x: GamePadAxis.axis_2,
				y: GamePadAxis.axis_3,
				deadZone: 0.25,
			},
		],
	},
	{
		name: GameplayAction.Interact,
		type: "button",
		bindings: [
			{ device: "keyboard", input: Key.E },
			{ device: "gamepad", input: GamePadButton.button_2 },
		],
	},
	{
		name: GameplayAction.Jump,
		type: "button",
		bindings: [
			{ device: "keyboard", input: Key.W },
			{ device: "keyboard", input: Key.ArrowUp },
			{ device: "gamepad", input: GamePadButton.button_0 },
		],
	},
	{
		name: GameplayAction.Dash,
		type: "button",
		bindings: [
			{ device: "keyboard", input: Key.Q },
			{ device: "gamepad", input: GamePadButton.button_11 },
		],
	},
	{
		name: GameplayAction.Fire,
		type: "button",
		bindings: [
			{ device: "mouse", input: "left" },
			{ device: "gamepad", input: GamePadButton.button_7 },
		],
	},
	{
		name: GameplayAction.Reload,
		type: "button",
		bindings: [
			{ device: "keyboard", input: Key.R },
			{ device: "gamepad", input: GamePadButton.button_1 },
		],
	},
	{
		name: GameplayAction.QuickSlot0,
		type: "button",
		bindings: [
			{ device: "keyboard", input: Key.F },
			{ device: "gamepad", input: GamePadButton.button_6 },
		],
	},
	{
		name: GameplayAction.QuickSlot1,
		type: "button",
		bindings: [
			{ device: "keyboard", input: Key.Digit1 },
			{ device: "gamepad", input: GamePadButton.button_12 },
		],
	},
	{
		name: GameplayAction.QuickSlot2,
		type: "button",
		bindings: [
			{ device: "keyboard", input: Key.Digit2 },
			{ device: "gamepad", input: GamePadButton.button_15 },
		],
	},
	{
		name: GameplayAction.QuickSlot3,
		type: "button",
		bindings: [
			{ device: "keyboard", input: Key.Digit3 },
			{ device: "gamepad", input: GamePadButton.button_13 },
		],
	},
	{
		name: GameplayAction.QuickSlot4,
		type: "button",
		bindings: [
			{ device: "keyboard", input: Key.Digit4 },
			{ device: "gamepad", input: GamePadButton.button_14 },
		],
	},
	{
		name: GameplayAction.QuickSlot5,
		type: "button",
		bindings: [
			{ device: "keyboard", input: Key.Digit5 },
			{ device: "gamepad", input: GamePadButton.button_4 },
		],
	},
	{
		name: GameplayAction.Back,
		type: "button",
		bindings: [
			{ device: "keyboard", input: Key.Escape },
			{ device: "gamepad", input: GamePadButton.button_3 },
		],
	},
	{
		name: GameplayAction.InventoryToggle,
		type: "button",
		bindings: [
			{ device: "keyboard", input: Key.Tab },
			{ device: "gamepad", input: GamePadButton.button_5 },
		],
	},
];

for (const action of actions) {
	InputManagerInstance.addAction(action);
}

export { InputManagerInstance };
