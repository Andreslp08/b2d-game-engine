import type { AnyItemDefinition } from "./item-definition";

/** Central catalog used to resolve static item definitions by ID. */
export class ItemRegistry {
	private readonly definitions = new Map<string, AnyItemDefinition>();

	/** Registers a definition and rejects duplicate IDs. */
	register(definition: AnyItemDefinition): void {
		if (this.definitions.has(definition.id)) {
			throw new Error(`Item definition already registered: ${definition.id}`);
		}
		this.definitions.set(definition.id, definition);
	}

	/** Registers a collection of definitions. */
	registerMany(definitions: readonly AnyItemDefinition[]): void {
		definitions.forEach((definition) => this.register(definition));
	}

	/** Resolves a definition or throws when the ID is unknown. */
	get(definitionId: string): AnyItemDefinition {
		const definition = this.definitions.get(definitionId);
		if (!definition) throw new Error(`Unknown item definition: ${definitionId}`);
		return definition;
	}

	/** Returns whether a definition is registered. */
	has(definitionId: string): boolean {
		return this.definitions.has(definitionId);
	}
}
