/** A button action transition emitted during the input phase. */
export enum InputActionPhase {
	Pressed = "pressed",
	Released = "released",
}

/** Controls whether an action is delivered synchronously or during the next engine input phase. */
export type InputDispatchMode = "immediate" | "frame";

import type { InputActionEvent } from "./input-manager";

/** Declares an action and optional transitions handled by a context. */
export interface InputContextAction {
	action: string;
	phases?: readonly InputActionPhase[];
}

/** Receives named input actions according to a priority-based routing policy. */
export interface InputContext {
	id: string;
	priority: number;
	actions: readonly InputContextAction[];
	dispatchMode?: InputDispatchMode;
	enabled?: boolean;
	onAction(event: InputActionEvent): void;
}

type RegisteredContext = {
	context: InputContext;
	order: number;
};

/** Selects the highest-priority active context for each action transition. */
export class InputContextManager {
	private readonly contexts: RegisteredContext[] = [];
	private nextOrder = 0;

	/** Registers a context and returns an idempotent cleanup function. */
	push(context: InputContext): () => void {
		if (this.contexts.some((registered) => registered.context === context)) {
			throw new Error(`Input context '${context.id}' is already registered`);
		}

		const registered: RegisteredContext = { context, order: this.nextOrder++ };
		this.contexts.push(registered);
		let released = false;

		return () => {
			if (released) return;
			released = true;
			const index = this.contexts.indexOf(registered);
			if (index !== -1) this.contexts.splice(index, 1);
		};
	}

	/** Returns the highest-priority enabled context that declared the action transition. */
	select(action: string, phase: InputActionPhase): InputContext | undefined {
		const orderedContexts = [...this.contexts].sort(
			(left, right) => right.context.priority - left.context.priority || right.order - left.order,
		);

		for (const { context } of orderedContexts) {
			if (context.enabled === false) continue;
			if (
				context.actions.some(
					(binding) =>
						binding.action === action &&
						(binding.phases === undefined || binding.phases.includes(phase)),
				)
			) {
				return context;
			}
		}

		return undefined;
	}

	/** Returns whether a context remains registered and enabled. */
	isActive(context: InputContext): boolean {
		return context.enabled !== false && this.contexts.some((registered) => registered.context === context);
	}

	/** Removes every registered context. */
	clear(): void {
		this.contexts.length = 0;
	}

	/** Returns contexts in their dispatch order. */
	getContexts(): readonly InputContext[] {
		return this.contexts
			.slice()
			.sort((left, right) => right.context.priority - left.context.priority || right.order - left.order)
			.map(({ context }) => context);
	}
}
