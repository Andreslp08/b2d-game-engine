import { GameObject } from "engine/common/entities/game-object";
import { Entity } from "engine/ecs/entity";
import { ScriptComponent } from "engine/scripts/script-component";
import { UIComponent } from "engine/ui/components/ui-component";
import { UIObject } from "engine/ui/entities/ui-object";
import { HealthComponent } from "../script-components/health-component";
import { SegmentBarUI } from "./components/segment-bar-ui";
import Vector2 from "engine/math/vector2";
import { ShieldComponent } from "../script-components/shield-component";


class HudUI extends UIObject {
    private _healthUI: SegmentBarUI;
    private _shieldUI: SegmentBarUI;
    constructor() {
        super();
        const healthX = 10;
        const healthY = 15;
        this._healthUI = new SegmentBarUI(new Vector2(healthX, healthY), "/assets/ui/health-icon.png");
        this.addComponent(this._healthUI);
        const shieldX = 10;
        const shieldY = 70;
        this._shieldUI = new SegmentBarUI(new Vector2(shieldX, shieldY), "/assets/ui/shield-icon.png");
        this._shieldUI.setSegmentColor("#A7A7A7");
        this.addComponent(this._shieldUI);

    }

    attachTo(entity: GameObject) {
        this.updateHud(entity);
    }

    private updateHud(entity: GameObject) {
        const healthComponent = entity.getComponent(HealthComponent);
        const shieldComponent = entity.getComponent(ShieldComponent);
        if (healthComponent) {
            this._healthUI.setValue(healthComponent.getHealth());
            this._healthUI.setMaxValue(healthComponent.getMaxHealth());
        }
        if (shieldComponent) {
            this._shieldUI.setValue(shieldComponent.getShield());
            this._shieldUI.setMaxValue(shieldComponent.getMaxShield());

        }

        
    }
}


export class PlayerHud extends ScriptComponent {
	private hudUI: HudUI;

	constructor(entity: Entity) {
		super(entity);
		this.hudUI = new HudUI();
	}

	onUpdate(deltaTime: number): void {
		if (!this.entity) return;
		const scene = this.entity.getScene();
		if (scene && (this.hudUI.getScene() === null || this.hudUI.getScene() !== scene)) {
			scene.addEntity(this.hudUI);
		}
		this.hudUI.attachTo(this.entity as GameObject);
	}
}
