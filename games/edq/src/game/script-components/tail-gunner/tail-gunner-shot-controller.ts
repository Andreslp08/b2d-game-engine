import { Transform } from "engine/common/components/transform";
import type { GameObject } from "engine/common/entities/game-object";
import Vector2 from "engine/math/vector2";
import { ScriptComponent } from "engine/scripts/script-component";
import { createTailGunnerBomb } from "../../prefabs/tail-gunner-bomb";

export class TailGunnerShotController extends ScriptComponent {
	shot(target: GameObject): void {
		const scene = this.entity.getScene();
		const shooterTransform = this.entity.getComponent(Transform);
		const targetTransform = target?.getComponent(Transform);
		if (!scene || !shooterTransform || !targetTransform) return;

		const bomb = createTailGunnerBomb(
			shooterTransform.position.clone().add(new Vector2(1.3, -0.5)),
			targetTransform.position.clone(),
			this.entity,
		);
		scene.addEntity(bomb);
	}
}
