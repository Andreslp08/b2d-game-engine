/** Store-specific data that extends an item definition by reference. */
export interface ShopEntry {
	readonly definitionId: string;
	readonly stock?: number;
	readonly buyPrice: number;
	readonly sellPrice?: number;
}

/** A catalog of purchasable item references. */
export class Shop {
	constructor(readonly entries: readonly ShopEntry[]) {}
}
