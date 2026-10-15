/** Receives named input actions according to a priority-based routing policy. */
export interface InputContext {
	id: string;
	priority: number;
	enabled?: boolean;
	onAction(action: string): boolean;
}

type RegisteredContext = {
	context: InputContext;
	order: number;
};

/** Routes actions to active contexts until one consumes the action. */
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

	/** Dispatches an action from highest to lowest priority. */
	dispatch(action: string): boolean {
		const orderedContexts = [...this.contexts].sort(
			(left, right) => right.context.priority - left.context.priority || right.order - left.order,
		);

		for (const { context } of orderedContexts) {
			if (context.enabled === false) continue;
			if (context.onAction(action)) return true;
		}

		return false;
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
