import { ScriptComponent } from "engine/scripts/script-component";
import { GameEvent } from "engine/common/events/game-event";
import { PlayerSkin } from "../../config/constants";

export class PlayerSkinComponent extends ScriptComponent {
	onChangeSkin: GameEvent<PlayerSkin> = new GameEvent();
	constructor(private skin: PlayerSkin = PlayerSkin.SKIN1) {
		super();
	}

	changeSkin(skin: PlayerSkin) {
		this.skin = skin;
		this.onChangeSkin.emit(skin);
	}
    getCurrentSkin() {
        return this.skin;
    }
}
