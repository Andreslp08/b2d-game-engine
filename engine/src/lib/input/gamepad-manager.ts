import { GameEvent } from "../common/events/game-event";

/** Standard button indexes. Extra controller buttons can use their raw numeric index. */
export const GamePadButton = {
	/** Bottom face: Cross on DualSense, A on Xbox. */
	button_0: 0,
	/** Right face: Circle on DualSense, B on Xbox. */
	button_1: 1,
	/** Left face: Square on DualSense, X on Xbox. */
	button_2: 2,
	/** Top face: Triangle on DualSense, Y on Xbox. */
	button_3: 3,
	/** Left bumper: L1 on DualSense, LB on Xbox. */
	button_4: 4,
	/** Right bumper: R1 on DualSense, RB on Xbox. */
	button_5: 5,
	/** Left trigger: L2 on DualSense, LT on Xbox. */
	button_6: 6,
	/** Right trigger: R2 on DualSense, RT on Xbox. */
	button_7: 7,
	/** Share on DualSense, View/Back on Xbox. */
	button_8: 8,
	/** Options on DualSense, Menu/Start on Xbox. */
	button_9: 9,
	/** Left stick click: L3 on DualSense, LS on Xbox. */
	button_10: 10,
	/** Right stick click: R3 on DualSense, RS on Xbox. */
	button_11: 11,
	/** D-pad up. */
	button_12: 12,
	/** D-pad down. */
	button_13: 13,
	/** D-pad left. */
	button_14: 14,
	/** D-pad right. */
	button_15: 15,
	/** PlayStation, Guide, or Home button. */
	button_16: 16,
	/** DualSense touchpad click when exposed by the browser. */
	button_17: 17,
} as const;

/** Browser-provided index into `Gamepad.buttons`. */
export type GamePadButton = number;

/** Standard axis indexes. Extra controller axes can use their raw numeric index. */
export const GamePadAxis = {
	/** Left stick horizontal. */
	axis_0: 0,
	/** Left stick vertical. */
	axis_1: 1,
	/** Right stick horizontal. */
	axis_2: 2,
	/** Right stick vertical. */
	axis_3: 3,
} as const;

/** Browser-provided index into `Gamepad.axes`. */
export type GamePadAxis = number;

export interface GamepadButtonInputEvent {
	device: "gamepad";
	gamepadIndex: number;
	button: GamePadButton;
	value: number;
	timestamp: number;
}

type GamepadState = {
	gamepad: Gamepad;
	buttons: Map<GamePadButton, boolean>;
	buttonValues: Map<GamePadButton, number>;
	axes: Map<GamePadAxis, number>;
	justPressed: Set<GamePadButton>;
	justReleased: Set<GamePadButton>;
};

class GamepadManagerClass {
	public readonly onGamepadConnected = new GameEvent<Gamepad>();
	public readonly onGamepadDisconnected = new GameEvent<Gamepad>();
	public readonly onButtonPressed = new GameEvent<GamepadButtonInputEvent>();
	public readonly onButtonReleased = new GameEvent<GamepadButtonInputEvent>();
	private static instance: GamepadManagerClass;
	private readonly gamepads = new Map<number, GamepadState>();
	private isListening = false;

	listen() {
		if (!this.isListening) {
			window.addEventListener("gamepadconnected", this.gamePadConnected);
			window.addEventListener("gamepaddisconnected", this.gamePadDisconnected);
			this.isListening = true;
			this.refresh();
		}
		return { unlisten: () => this.unlisten() };
	}

	/** Polls every native button and axis once per frame. */
	update(): void {
		for (const state of this.gamepads.values()) {
			state.justPressed.clear();
			state.justReleased.clear();
		}
		this.refresh();
	}

	getGamepads(): readonly Gamepad[] {
		return Array.from(this.gamepads.values(), (state) => state.gamepad);
	}

	getGamepad(index: number): Gamepad | undefined {
		return this.gamepads.get(index)?.gamepad;
	}

	isButtonDown(button: GamePadButton, gamepadIndex?: number): boolean {
		return this.statesFor(gamepadIndex).some((state) => state.buttons.get(button) === true);
	}

	isButtonJustPressed(button: GamePadButton, gamepadIndex?: number): boolean {
		return this.statesFor(gamepadIndex).some((state) => state.justPressed.has(button));
	}

	isButtonJustReleased(button: GamePadButton, gamepadIndex?: number): boolean {
		return this.statesFor(gamepadIndex).some((state) => state.justReleased.has(button));
	}

	/** Returns an analog button value from 0 to 1. Defaults to the first gamepad slot. */
	getButtonValue(button: GamePadButton, gamepadIndex = 0): number {
		return this.gamepads.get(gamepadIndex)?.buttonValues.get(button) ?? 0;
	}

	/** Returns an axis value from -1 to 1. Defaults to the first gamepad slot. */
	getAxis(axis: GamePadAxis, gamepadIndex = 0): number {
		return this.gamepads.get(gamepadIndex)?.axes.get(axis) ?? 0;
	}

	private gamePadConnected = (event: GamepadEvent) => {
		if (this.gamepads.has(event.gamepad.index)) return;
		this.gamepads.set(event.gamepad.index, this.createState(event.gamepad));
		this.onGamepadConnected.emit(event.gamepad);
	};

	private gamePadDisconnected = (event: GamepadEvent) => {
		this.disconnect(event.gamepad.index, event.gamepad);
	};

	private refresh(): void {
		const connectedIndexes = new Set<number>();
		for (const gamepad of navigator.getGamepads()) {
			if (!gamepad) continue;

			connectedIndexes.add(gamepad.index);
			let state = this.gamepads.get(gamepad.index);
			if (!state) {
				state = this.createState(gamepad);
				this.gamepads.set(gamepad.index, state);
				this.onGamepadConnected.emit(gamepad);
			}
			this.updateState(state, gamepad);
		}

		for (const [index, state] of this.gamepads) {
			if (!connectedIndexes.has(index)) this.disconnect(index, state.gamepad);
		}
	}

	private createState(gamepad: Gamepad): GamepadState {
		const state: GamepadState = {
			gamepad,
			buttons: new Map(),
			buttonValues: new Map(),
			axes: new Map(),
			justPressed: new Set(),
			justReleased: new Set(),
		};
		for (const [index, button] of gamepad.buttons.entries()) {
			state.buttons.set(index, button.pressed || button.value >= 0.5);
			state.buttonValues.set(index, button.value);
		}
		for (const [index, axis] of gamepad.axes.entries()) state.axes.set(index, axis);
		return state;
	}

	private updateState(state: GamepadState, gamepad: Gamepad): void {
		state.gamepad = gamepad;
		for (const [index, nativeButton] of gamepad.buttons.entries()) {
			const down = nativeButton.pressed || nativeButton.value >= 0.5;
			const wasDown = state.buttons.get(index) === true;
			state.buttons.set(index, down);
			state.buttonValues.set(index, nativeButton.value);
			if (down === wasDown) continue;

			const event: GamepadButtonInputEvent = {
				device: "gamepad",
				gamepadIndex: gamepad.index,
				button: index,
				value: nativeButton.value,
				timestamp: gamepad.timestamp,
			};
			if (down) {
				state.justPressed.add(index);
				this.onButtonPressed.emit(event);
			} else {
				state.justReleased.add(index);
				this.onButtonReleased.emit(event);
			}
		}
		for (const [index, axis] of gamepad.axes.entries()) state.axes.set(index, axis);
	}

	private disconnect(index: number, gamepad: Gamepad): void {
		const state = this.gamepads.get(index);
		if (!state) return;

		for (const [button, down] of state.buttons) {
			if (!down) continue;
			this.onButtonReleased.emit({
				device: "gamepad",
				gamepadIndex: index,
				button,
				value: 0,
				timestamp: gamepad.timestamp,
			});
		}
		this.gamepads.delete(index);
		this.onGamepadDisconnected.emit(gamepad);
	}

	private statesFor(gamepadIndex?: number): GamepadState[] {
		if (gamepadIndex !== undefined) {
			const state = this.gamepads.get(gamepadIndex);
			return state ? [state] : [];
		}
		return Array.from(this.gamepads.values());
	}

	private unlisten() {
		if (!this.isListening) return;
		window.removeEventListener("gamepadconnected", this.gamePadConnected);
		window.removeEventListener("gamepaddisconnected", this.gamePadDisconnected);
		this.gamepads.clear();
		this.isListening = false;
	}

	static getInstance(): GamepadManagerClass {
		if (!GamepadManagerClass.instance) {
			GamepadManagerClass.instance = new GamepadManagerClass();
		}
		return GamepadManagerClass.instance;
	}
}

export const GamepadManager = GamepadManagerClass.getInstance();
