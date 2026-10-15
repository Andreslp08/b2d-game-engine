import { KeyBoardManager, type PhysicalKeyCode } from "./keyboard-manager";
import { MouseManager, type MouseButton } from "./mouse-manager";
import { InputContextManager, type InputContext } from "./input-context-manager";
import Vector2 from "../math/vector2";

/** Supported input device categories. */
export type InputDevice = "keyboard" | "mouse" | "gamepad";

/** Named gamepad buttons available to button actions. */
export type GamepadButton =
	| "south"
	| "east"
	| "west"
	| "north"
	| "left-bumper"
	| "right-bumper"
	| "start"
	| "select";

/** A keyboard button and optional required key groups. */
export type KeyboardButtonBinding = { device: "keyboard"; input: PhysicalKeyCode; modifiers?: PhysicalKeyCode[][] };
/** A mouse button and optional required mouse-button groups. */
export type MouseButtonBinding = { device: "mouse"; input: MouseButton; modifiers?: MouseButton[][] };
/** A gamepad button and optional required gamepad-button groups. */
export type GamepadButtonBinding = { device: "gamepad"; input: GamepadButton; modifiers?: GamepadButton[][] };
/** Any binding that resolves to a pressed or released boolean state. */
export type ButtonBinding = KeyboardButtonBinding | MouseButtonBinding | GamepadButtonBinding;
/** Builds a two-dimensional value from four physical keyboard directions. */
export type KeyboardVector2Composite = {
	device: "keyboard";
	composite: "2d-vector";
	up: PhysicalKeyCode;
	down: PhysicalKeyCode;
	left: PhysicalKeyCode;
	right: PhysicalKeyCode;
};

/** A named button or vector action and its bindings. */
export type InputAction = {
	name: string;
	type: "button";
	bindings: readonly ButtonBinding[];
} | {
	name: string;
	type: "vector2";
	bindings: readonly KeyboardVector2Composite[];
};

/** Stores action bindings, evaluates devices, and dispatches context actions per frame. */
export class InputManager {
	private static readonly instances = new Set<InputManager>();
	private readonly actionMap = new Map<string, InputAction>();
	private readonly contextManager = new InputContextManager();

	/** Creates and globally registers an input manager for engine frame updates. */
	constructor() {
		InputManager.instances.add(this);
	}

	/** Updates every live input manager once during the current engine frame. */
	static updateAll(): void {
		for (const inputManager of InputManager.instances) inputManager.update();
	}

	/** Unregisters this manager and clears its active contexts. */
	dispose(): void {
		InputManager.instances.delete(this);
		this.contextManager.clear();
	}

	/** Adds an action-routing context to this manager. */
	pushContext(context: InputContext): () => void {
		return this.contextManager.push(context);
	}

	/** Adds or replaces a named action. */
	addAction(action: InputAction): void {
		this.actionMap.set(action.name, this.copyAction(action));
	}

	/** Removes an action and all of its bindings. */
	removeAction(name: string): void {
		this.actionMap.delete(name);
	}

	/** Returns an isolated copy of a named action. */
	getAction(name: string): InputAction | undefined {
		const action = this.actionMap.get(name);
		return action && this.copyAction(action);
	}

	/** Returns isolated copies of all actions keyed by name. */
	getActions(): ReadonlyMap<string, InputAction> {
		return new Map(Array.from(this.actionMap, ([name, action]): [string, InputAction] => [name, this.copyAction(action)]));
	}

	/** Returns button bindings for an action, optionally filtered to one device. */
	getActionBindings(name: string, device?: InputDevice): readonly ButtonBinding[] {
		const action = this.actionMap.get(name);
		if (!action || action.type !== "button") return [];
		return action.bindings.filter((binding) => !device || binding.device === device);
	}

	/** Adds a unique button binding to an existing button action. @throws When the action is absent or not a button action. */
	addActionBinding(name: string, binding: ButtonBinding): void {
		const action = this.actionMap.get(name);
		if (!action || action.type !== "button") throw new Error(`Button action '${name}' does not exist`);
		if (action.bindings.some((current) => this.bindingsMatch(current, binding))) return;

		action.bindings = [...action.bindings, binding];
	}

	/** Removes a matching button binding from an action. */
	removeActionBinding(name: string, binding: ButtonBinding): void {
		const action = this.actionMap.get(name);
		if (!action || action.type !== "button") return;

		action.bindings = action.bindings.filter(
			(current) => !this.bindingsMatch(current, binding),
		);
	}

	/** Returns whether any button binding for an action is held. */
	isDown(name: string): boolean {
		return this.getActionBindings(name).some((binding) => this.isBindingDown(binding));
	}

	/** Returns whether any button binding was pressed this frame. */
	justPressed(name: string): boolean {
		return this.getActionBindings(name).some((binding) => this.isBindingJustPressed(binding));
	}

	/** Returns whether any button binding was released this frame. */
	justReleased(name: string): boolean {
		return this.getActionBindings(name).some((binding) => this.isBindingJustReleased(binding));
	}

	/** Returns the combined value of all vector composites for an action. */
	getVector2(name: string): Vector2 {
		const action = this.actionMap.get(name);
		if (!action || action.type !== "vector2") return Vector2.ZERO.clone();

		let x = 0;
		let y = 0;
		for (const composite of action.bindings) {
			x +=
				Number(KeyBoardManager.physicalKeyDown(composite.right)) -
				Number(KeyBoardManager.physicalKeyDown(composite.left));
			y +=
				Number(KeyBoardManager.physicalKeyDown(composite.down)) -
				Number(KeyBoardManager.physicalKeyDown(composite.up));
		}

		return new Vector2(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)));
	}

	private update(): void {
		for (const action of this.actionMap.values()) {
			if (action.type === "button" && this.justPressed(action.name)) this.contextManager.dispatch(action.name);
		}
	}

	/** Resolves a display label for an action's first button binding. */
	async getActionLabel(name: string): Promise<string | undefined> {
		const binding = this.getActionBindings(name)[0];
		if (!binding) return undefined;

		if (binding.device === "keyboard") {
			return KeyBoardManager.getPhysicalKeyLabel(binding.input);
		}
		if (binding.device === "mouse") {
			return binding.input === "left" ? "LMB" : binding.input === "middle" ? "MMB" : "RMB";
		}
		return binding.input;
	}

	private bindingsMatch(left: ButtonBinding, right: ButtonBinding): boolean {
		return left.device === right.device && left.input === right.input;
	}

	private copyAction(action: InputAction): InputAction {
		if (action.type === "button") return { ...action, bindings: [...action.bindings] };
		return { ...action, bindings: [...action.bindings] };
	}

	private isBindingDown(binding: ButtonBinding): boolean {
		if (binding.device === "keyboard") {
			return KeyBoardManager.physicalKeyDown(binding.input) && this.keysMatch(binding.modifiers);
		}
		if (binding.device === "mouse") {
			return MouseManager.isButtonDown(binding.input) && this.mouseButtonsMatch(binding.modifiers);
		}
		return false;
	}

	private isBindingJustPressed(binding: ButtonBinding): boolean {
		if (binding.device === "keyboard") {
			return KeyBoardManager.physicalKeyJustPressed(binding.input) && this.keysMatch(binding.modifiers);
		}
		if (binding.device === "mouse") {
			return MouseManager.isButtonJustPressed(binding.input) && this.mouseButtonsMatch(binding.modifiers);
		}
		return false;
	}

	private isBindingJustReleased(binding: ButtonBinding): boolean {
		if (binding.device === "keyboard") return KeyBoardManager.physicalKeyJustReleased(binding.input);
		if (binding.device === "mouse") return MouseManager.isButtonJustReleased(binding.input);
		return false;
	}

	private keysMatch(modifiers?: PhysicalKeyCode[][]): boolean {
		return modifiers?.every((group) => group.some((key) => KeyBoardManager.physicalKeyDown(key))) ?? true;
	}

	private mouseButtonsMatch(modifiers?: MouseButton[][]): boolean {
		return modifiers?.every((group) => group.some((button) => MouseManager.isButtonDown(button))) ?? true;
	}
}
