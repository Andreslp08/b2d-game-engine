import { ScriptComponent } from "engine/scripts/script-component";
import type { WeaponDefinition } from "./weapon-definition";
import type { Entity } from "engine/ecs/entity";

export enum LootType {
	WEAPON = "weapon",
	HAND = "hand",
}

export interface LootItem<T> {
	type: LootType;
	data: T;
}

export interface SlootItem {
	item: LootItem<any>;
	slot: number;
	active: boolean;
}

export interface WeaponItem {
	id: string;
	name: string;
	definitions: WeaponDefinition;
}

export class Loot extends ScriptComponent {
	private currentSlot: number = 0;
	private currentLoot: Map<number, SlootItem> = new Map<number, SlootItem>();

	constructor() {
		super();
	}

	onStart(): void {
		this.currentSlot = 0;
	}

	public getLoot(): Map<number, SlootItem> {
		return new Map(this.currentLoot);
	}

	public getCurrentSlotNumber(): number {
		return this.currentSlot;
	}

	public getCurrentSlot(): SlootItem {
		return this.currentLoot.get(this.currentSlot);
	}
	public getCurrentSlotItem(): LootItem<any> {
		return this.currentLoot.get(this.currentSlot)?.item;
	}

	public setSlot(slot: number, item: LootItem<any>, active: boolean): void {
		this.currentLoot.set(slot, { item, slot, active });
		this.setCurrentSlot(slot);
	}

	public getSlot(slot: number): SlootItem {
		return this.currentLoot.get(slot);
	}

	public getSlotItem(slot: number): LootItem<any> {
		return this.currentLoot.get(slot)?.item;
	}

	public setSlotItem(slot: number, item: LootItem<any>): void {
		const slootItem = this.currentLoot.get(slot);
		if (!slootItem) return;
		slootItem.item = item;
	}

	public removeSlot(slot: number): void {
		this.currentLoot.delete(slot);
	}

	public removeSlotItem(slot: number): void {
		const slootItem = this.currentLoot.get(slot);
		if (!slootItem) return;
		slootItem.item = null;
	}

	public setCurrentSlot(slot: number): void {
		// remove all active slots to false
		if (this.currentLoot.has(slot)) {
			this.currentLoot.forEach((slootItem) => (slootItem.active = false));
			this.currentSlot = slot;
			this.currentLoot.get(slot).active = true;
		}
	}

	onFixedUpdate(): void {}
}
