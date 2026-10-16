import { KeyBoardManager, type PhysicalKeyCode } from "./keyboard-manager";
import { MouseManager, type MouseButton } from "./mouse-manager";
import {
	InputContextManager,
	InputActionPhase,
	type InputDispatchMode,
	type InputContext,
} from "./input-context-manager";
import Vector2 from "../math/vector2";

export { InputActionPhase, type InputDispatchMode } from "./input-context-manager";

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

/** Normalized gamepad button data for action events. */
export interface GamepadInputEvent {
	device: "gamepad";
	gamepadIndex: number;
	button: GamepadButton;
	value: number;
	timestamp: number;
}

/** Native input data that produced an action transition. */
export type InputNativeEvent = KeyboardEvent | MouseEvent | GamepadInputEvent;

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

/** Describes a button action transition and its source input event. */
export interface InputActionEvent {
	action: string;
	phase: InputActionPhase;
	isDown: boolean;
	device: InputDevice;
	nativeEvent: InputNativeEvent;
	consumed: boolean;
}

/** Receives a button action transition. */
export type InputActionListener = (event: InputActionEvent) => void;

/** Selects when an action listener receives transitions. */
export interface InputListenerOptions {
	dispatchMode?: InputDispatchMode;
}

/** Stores action bindings and routes action transitions by dispatch mode. */
export class InputManager {
	private static readonly instances = new Set<InputManager>();
	private readonly actionMap = new Map<string, InputAction>();
	private readonly contextManager = new InputContextManager();
	private readonly actionListeners = new Map<string, Set<InputActionListener>>();
	private readonly immediateActionListeners = new Map<string, Set<InputActionListener>>();
	private readonly queuedActions: { event: InputActionEvent; context?: InputContext }[] = [];
	private readonly unsubscribeKeyboardDown: () => void;
	private readonly unsubscribeKeyboardUp: () => void;
	private readonly unsubscribeMouseDown: () => void;
	private readonly unsubscribeMouseUp: () => void;

	/** Creates an input manager with immediate and frame-based action routing. */
	constructor() {
		KeyBoardManager.listen();
		MouseManager.listen();
		InputManager.instances.add(this);
		this.unsubscribeKeyboardDown = KeyBoardManager.onKeyDown((event) =>
			this.dispatchKeyboardAction(event, InputActionPhase.Pressed),
		);
		this.unsubscribeKeyboardUp = KeyBoardManager.onKeyUp((event) =>
			this.dispatchKeyboardAction(event, InputActionPhase.Released),
		);
		this.unsubscribeMouseDown = MouseManager.onMouseDown((event) =>
			this.dispatchMouseAction(event, InputActionPhase.Pressed),
		);
		this.unsubscribeMouseUp = MouseManager.onMouseUp((event) =>
			this.dispatchMouseAction(event, InputActionPhase.Released),
		);
	}

	/** Processes every manager's queued gameplay actions at the start of an engine frame. */
	static updateAll(): void {
		for (const inputManager of InputManager.instances) inputManager.update();
	}

	/** Discards queued gameplay actions, such as when starting or stopping a game. */
	static clearAllQueues(): void {
		for (const inputManager of InputManager.instances) inputManager.queuedActions.length = 0;
	}

	/** Removes native input subscriptions and clears contexts, listeners, and queued actions. */
	dispose(): void {
		InputManager.instances.delete(this);
		this.unsubscribeKeyboardDown();
		this.unsubscribeKeyboardUp();
		this.unsubscribeMouseDown();
		this.unsubscribeMouseUp();
		this.contextManager.clear();
		this.actionListeners.clear();
		this.immediateActionListeners.clear();
		this.queuedActions.length = 0;
	}

	/** Adds an action-routing context to this manager. Contexts default to frame delivery. */
	pushContext(context: InputContext): () => void {
		return this.contextManager.push(context);
	}

	/** Subscribes to action transitions. Listeners default to frame delivery. */
	on(action: string, listener: InputActionListener, options: InputListenerOptions = {}): () => void {
		return this.addListener(
			options.dispatchMode === "immediate" ? this.immediateActionListeners : this.actionListeners,
			action,
			listener,
		);
	}

	private addListener(
		listenersByAction: Map<string, Set<InputActionListener>>,
		action: string,
		listener: InputActionListener,
	): () => void {
		let listeners = listenersByAction.get(action);
		if (!listeners) {
			listeners = new Set();
			listenersByAction.set(action, listeners);
		}
		listeners.add(listener);

		let unsubscribed = false;
		return () => {
			if (unsubscribed) return;
			unsubscribed = true;
			listeners.delete(listener);
			if (listeners.size === 0) listenersByAction.delete(action);
		};
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

	private dispatchKeyboardAction(event: KeyboardEvent, phase: InputActionPhase): void {
		for (const action of this.actionMap.values()) {
			if (action.type !== "button") continue;
			const binding = action.bindings.find(
				(current) =>
					current.device === "keyboard" &&
					current.input === event.code &&
					(phase === InputActionPhase.Released || this.isBindingDown(current)),
			);
			if (binding) this.routeAction(action.name, phase, binding.device, event);
		}
	}

	private dispatchMouseAction(event: MouseEvent, phase: InputActionPhase): void {
		const button = this.getMouseButton(event);
		if (!button) return;

		for (const action of this.actionMap.values()) {
			if (action.type !== "button") continue;
			const binding = action.bindings.find(
				(current) =>
					current.device === "mouse" &&
					current.input === button &&
					(phase === InputActionPhase.Released || this.isBindingDown(current)),
			);
			if (binding) this.routeAction(action.name, phase, binding.device, event);
		}
	}

	private routeAction(
		action: string,
		phase: InputActionPhase,
		device: InputDevice,
		nativeEvent: InputNativeEvent,
	): void {
		const event: InputActionEvent = {
			action,
			phase,
			isDown: phase === InputActionPhase.Pressed,
			device,
			nativeEvent,
			consumed: false,
		};
		const context = this.contextManager.select(action, phase);
		event.consumed = context !== undefined;
		this.emit(this.immediateActionListeners, event);
		if (context?.dispatchMode === "immediate") {
			context.onAction(event);
			return;
		}
		this.queuedActions.push({ event, context });
	}

	private update(): void {
		const queuedActions = this.queuedActions.splice(0);
		for (const { event, context } of queuedActions) {
			if (context && this.contextManager.isActive(context)) context.onAction(event);
			this.emit(this.actionListeners, event);
		}
	}

	private emit(
		listenersByAction: Map<string, Set<InputActionListener>>,
		event: InputActionEvent,
	): void {
		const listeners = listenersByAction.get(event.action);
		if (!listeners) return;
		for (const listener of [...listeners]) listener(event);
	}

	private getMouseButton(event: MouseEvent): MouseButton | null {
		if (event.button === 0) return "left";
		if (event.button === 1) return "middle";
		if (event.button === 2) return "right";
		return null;
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
