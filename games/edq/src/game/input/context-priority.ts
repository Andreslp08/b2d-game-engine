/** Shared context precedence levels for EDQ input routing. */
export const InputContextPriority = {
	System: 1000,
	Modal: 800,
	Menu: 600,
	Interaction: 400,
	Gameplay: 0,
} as const;
