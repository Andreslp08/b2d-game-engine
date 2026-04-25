import { Transform } from "../../common/components/transform";
import { Entity } from "../../ecs/entity";
import { System } from "../../ecs/system";
import { Culling } from "../../performance/culling";
import { CullingTarget } from "../../performance/enum/culling-type";
import { ScriptComponent } from "../../scripts/script-component";
import { TriggerArea } from "../components/trigger-area";

type TriggerPair = {
	entityA: Entity;
	entityB: Entity;
};

type TriggerEntry = {
	entity: Entity;
	areas: TriggerArea[];
};

export class TriggerAreaSystem extends System {
	private activePairs: Map<string, TriggerPair> = new Map();

	update(): void {}

	fixedUpdate(): void {
		const currentPairs: Map<string, TriggerPair> = new Map();
		const triggerEntities = this.getScene().getEntitiesByQuery({
			all: [Transform, TriggerArea],
			none: [Culling],
		});
		const triggerEntries = this.getTriggerEntries(triggerEntities);

		for (let i = 0; i < triggerEntries.length; i++) {
			for (let j = i + 1; j < triggerEntries.length; j++) {
				const entryA = triggerEntries[i];
				const entryB = triggerEntries[j];

				if (!this.entriesIntersect(entryA, entryB)) continue;

				const pairKey = this.getPairKey(entryA.entity, entryB.entity);
				const pair = { entityA: entryA.entity, entityB: entryB.entity };
				currentPairs.set(pairKey, pair);
				this.notifyTrigger(
					pair,
					this.activePairs.has(pairKey) ? "onTriggerStay" : "onTriggerEnter"
				);
			}
		}

		for (const [pairKey, pair] of this.activePairs) {
			if (currentPairs.has(pairKey)) continue;
			this.notifyTrigger(pair, "onTriggerExit");
		}

		this.activePairs = currentPairs;
	}

	private getTriggerEntries(entities: Entity[]): TriggerEntry[] {
		const entries: TriggerEntry[] = [];

		for (const entity of entities) {
			if (Entity.isBeingCulling(entity, [CullingTarget.ALL, CullingTarget.LOGIC])) continue;

			const areas = entity.getComponents(TriggerArea).filter((area) => area.active);
			if (areas.length === 0) continue;

			entries.push({ entity, areas });
		}

		return entries;
	}

	private entriesIntersect(entryA: TriggerEntry, entryB: TriggerEntry): boolean {
		for (const areaA of entryA.areas) {
			if (areaA.isIgnoringEntity(entryB.entity)) continue;

			for (const areaB of entryB.areas) {
				if (areaB.isIgnoringEntity(entryA.entity)) continue;
				if (areaA.intersects(areaB)) return true;
			}
		}

		return false;
	}

	private getPairKey(entityA: Entity, entityB: Entity): string {
		return entityA.id < entityB.id
			? `${entityA.id}:${entityB.id}`
			: `${entityB.id}:${entityA.id}`;
	}

	private notifyTrigger(
		pair: TriggerPair,
		eventName: "onTriggerEnter" | "onTriggerStay" | "onTriggerExit"
	) {
		const entityAScripts = pair.entityA.getComponents(ScriptComponent);
		const entityBScripts = pair.entityB.getComponents(ScriptComponent);

		for (const scriptComponent of entityAScripts) {
			scriptComponent[eventName](pair.entityB);
		}

		for (const scriptComponent of entityBScripts) {
			scriptComponent[eventName](pair.entityA);
		}
	}
}
