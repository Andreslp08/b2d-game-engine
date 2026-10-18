import { ScriptComponent } from "@b2d-engine/core/scripts/script-component";

export enum PlayerInputPermission {
	Movement = "movement",
	WeaponUse = "weapon-use",
	Dash = "dash",
}

/** Owns only the permissions that allow player systems to process their input. */
export class PlayerInputController extends ScriptComponent {
	private readonly permissions = new Map<PlayerInputPermission, boolean>([
		[PlayerInputPermission.Movement, true],
		[PlayerInputPermission.WeaponUse, true],
		[PlayerInputPermission.Dash, true],
	]);

	enable(permission: PlayerInputPermission): void {
		this.permissions.set(permission, true);
	}

	disable(permission: PlayerInputPermission): void {
		this.permissions.set(permission, false);
	}

	enableAll(): void {
		for (const permission of this.permissions.keys()) this.enable(permission);
	}

	disableAll(): void {
		for (const permission of this.permissions.keys()) this.disable(permission);
	}

	isEnabled(permission: PlayerInputPermission): boolean {
		return this.permissions.get(permission) ?? false;
	}
}
