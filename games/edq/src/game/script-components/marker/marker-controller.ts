import type { Entity } from "@b2d-engine/core/ecs/entity";
import type { GameObject } from "@b2d-engine/core/common/entities/game-object";
import { ScriptComponent } from "@b2d-engine/core/scripts/script-component";
import type { MarkerParams } from "../../interfaces/marker";

export class MarkerController extends ScriptComponent {
	constructor(
		private props: Pick<
			MarkerParams,
			"onEnter" | "onExit" | "onStay" | "triggerForEntitiesWithTags"
		>,
	) {
		super();
	}

	private includeTags(entityTags: string[]) {
		if (
			this.props.triggerForEntitiesWithTags &&
			this.props.triggerForEntitiesWithTags.length > 0
		)
			return this.props.triggerForEntitiesWithTags.some((tag) => entityTags.includes(tag));
		return true;
	}

	onTriggerEnter(entity: Entity): void {
		if (!this.includeTags(entity.getTags())) return;
		this.props.onEnter?.(entity as GameObject);
	}

	onTriggerExit(entity: Entity): void {
		if (!this.includeTags(entity.getTags())) return;
		this.props.onExit?.(entity as GameObject);
	}

	onTriggerStay(entity: Entity): void {
		if (!this.includeTags(entity.getTags())) return;
		this.props.onStay?.(entity as GameObject);
	}
}
