import type { AnyItemDefinition } from "../definitions/item-definition";

/** Registry for every static item definition in the game. */
export class ItemRegistry {
	private readonly definitions = new Map<string, AnyItemDefinition>();

	register(definition: AnyItemDefinition): void {
		if (this.definitions.has(definition.id)) {
			throw new Error(`Item definition already registered: ${definition.id}`);
		}
		this.definitions.set(definition.id, definition);
	}

	registerMany(definitions: readonly AnyItemDefinition[]): void {
		definitions.forEach((definition) => this.register(definition));
	}

	get(definitionId: string): AnyItemDefinition {
		const definition = this.definitions.get(definitionId);
		if (!definition) throw new Error(`Unknown item definition: ${definitionId}`);
		return definition;
	}

	has(definitionId: string): boolean {
		return this.definitions.has(definitionId);
	}
}
