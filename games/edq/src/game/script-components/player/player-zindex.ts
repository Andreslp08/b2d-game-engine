import { ScriptComponent } from "engine/scripts/script-component";
import { WeaponHolder } from "../weapon/weapon";
import type { GameObject } from "engine/common/entities/game-object";
import { PlayerSpriteController } from "./sprite-controller";
import { PlayerAimingArm } from "./player-aiming-arm";

export class PlayerZIndexManager extends ScriptComponent {
	public static readonly BODY = 1;
	public static readonly WEAPON = 2;
	public static readonly ARMS = 3;

	onUpdate(): void {
		const player = this.entity as GameObject;
		if (!player) return;
		const weaponHolder = player.getComponent(WeaponHolder);
        const spriteController = player.getComponent(PlayerSpriteController);
        const aimingArm = player.getComponent(PlayerAimingArm);
		if (!weaponHolder || !spriteController || !aimingArm) return;
		const weapon = weaponHolder.weapon;
		if (weapon){
            weapon.setZindex(PlayerZIndexManager.WEAPON);
        }
        aimingArm.setArmZIndex(PlayerZIndexManager.ARMS);
        player.setZindex(PlayerZIndexManager.BODY);
	}

    getFinalPlayerZIndex(){
        return PlayerZIndexManager.ARMS;
    }
}
