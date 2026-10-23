import { GameObject } from "@b2d-engine/core/common/entities/game-object";
import Vector2 from "@b2d-engine/core/math/vector2";
import { ScriptComponent } from "@b2d-engine/core/scripts/script-component";
import { TriggerArea } from "@b2d-engine/core/trigger-area";
import { Damageable } from "../script-components/shared/damageable";
import type { Entity } from "@b2d-engine/core/ecs/entity";
import { ContactDamage } from "../script-components/shared/contact-damage";
import { PlayerLifeController } from "../script-components/player/player-life-controller";
import { Time } from "@b2d-engine/core/common/interfaces/time";

type Params = {
	position: Vector2;
	size: Vector2;
};

class ToxicWaterController extends ScriptComponent{

    delay: number = 0.7;
    shouldDamage: boolean = false;
    player: GameObject;
    damageStartTime = 0;
    damageAmount: number = 25;

    onTriggerEnter(entity: GameObject) {
        const player = entity.getTags().includes("player");
        if(!player) return
        this.player = entity;
        const playerLife =  this.player.getComponent(PlayerLifeController);
        if(!playerLife) return
		if (playerLife.isDead) return
        this.damageStartTime = Time.time;
        playerLife.setDamage(this.damageAmount, "health-only");
    }
    onTriggerExit(entity: GameObject) {
             const player = entity.getTags().includes("player");
        if(!player) return
        this.player = undefined;
        this.damageStartTime = 0;
        this.shouldDamage = false;
    
    }

    onFixedUpdate(): void {
        if(!this.player) return
        const playerLife =  this.player.getComponent(PlayerLifeController);
        if(!playerLife) return
		if (playerLife.isDead) return
        if(Time.time - this.damageStartTime >= this.delay){
            console.log('toxic water hurt')
            this.damageStartTime = Time.time;
            playerLife.setDamage(this.damageAmount, "health-only");
        }
    }
}

export const createToxicWater = ({ position, size }: Params) => {
	const object = new GameObject({
		position,
		rotation: 0,
		size,
	});

    const triggerArea = new TriggerArea(new Vector2(0, 0), size);
    const controller = new ToxicWaterController();
    object.addComponent(triggerArea);
    object.addComponent(controller);
    return object;
};
