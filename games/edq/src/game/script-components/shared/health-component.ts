import { GameObject } from "@b2d-engine/core/common/entities/game-object";
import { Time } from "@b2d-engine/core/common/interfaces/time";
import type { Updatable } from "@b2d-engine/core/common/interfaces/updatable";
import { Cameras } from "@b2d-engine/core/graphics/cameras/camera-manager";
import { OrthographicCamera } from "@b2d-engine/core/graphics/cameras/orthographic-camera";
import { Screen } from "@b2d-engine/core/graphics/screen/screen";
import { RenderLayerTypes } from "@b2d-engine/core/graphics/enum/render-layer-types.enum";
import type { ITranform } from "@b2d-engine/core/common/interfaces/transform";
import { MathUtil } from "@b2d-engine/core/math/math-util";
import Vector2 from "@b2d-engine/core/math/vector2";
import { ScriptComponent } from "@b2d-engine/core/scripts/script-component";
import { UIComponent } from "@b2d-engine/core/ui/components/ui-component";
import { UIObject } from "@b2d-engine/core/ui/entities/ui-object";

export class HealthBarComponent extends UIComponent implements Updatable {
	private visible = true;
	private displayedHealth = 0;
	constructor(
		public transform: ITranform,
		private health: number = 100,
		private maxHealth: number = 100,
	) {
		super(transform);
		this.displayedHealth = this.health;
	}

	setVisible(visible: boolean) {
		this.visible = visible;
	}

	isVisible(): boolean {
		return this.visible;
	}

	setHealth(health: number) {
		if (health < 0) health = 0;
		if (health > this.maxHealth) health = 100;
		this.health = health;
	}

	getHealth(): number {
		return this.health;
	}

	setMaxHealth(maxHealth: number) {
		this.maxHealth = maxHealth;
	}

	getMaxHealth(): number {
		return this.maxHealth;
	}

	render(context: CanvasRenderingContext2D): void {
		const position = this.transform.position;
		const size = this.transform.size;
		if (!this.visible) return;
		if (!this.transform) return;

		const r = 1;

		context.save();
		// Dibujar fondo negro
		context.beginPath();
		context.roundRect(position.x, position.y, size.x, size.y, r);
		context.fillStyle = "#000";
		context.fill();

		// Dibujar barra roja proporcional
		const percentage = this.displayedHealth / this.maxHealth;
		if (percentage > 0) {
			context.beginPath();
			context.roundRect(position.x, position.y, size.x * percentage, size.y, r);
			context.fillStyle = "#f00";
			context.fill();
		}
		context.restore();
	}

	update(): void {
		this.displayedHealth = MathUtil.lerp(this.displayedHealth, this.health, 5 * Time.deltaTime);
	}

	fixedUpdate(): void {}
}

export class HealthUI extends UIObject {
	_healthBar: HealthBarComponent;

	constructor() {
		super();
		this.renderLayer = RenderLayerTypes.UI;
		this._healthBar = new HealthBarComponent({
			position: new Vector2(0, 0),
			rotation: 0,
			size: new Vector2(40, 5),
		});
		this.addComponent(this._healthBar);
	}

	setPosition(position: Vector2, offsetX: number = 0, offsetY: number = 0) {
		this._healthBar.setPosition(position.substract(new Vector2(offsetX, offsetY)));
	}

	getHealth(): number {
		return this._healthBar.getHealth();
	}

	setHealth(health: number) {
		this._healthBar.setHealth(health);
		this._healthBar.update();
	}

	showHealthBar(show: boolean) {
		this._healthBar.setVisible(show);
	}

	setMaxHealth(maxHealth: number) {
		this._healthBar.setMaxHealth(maxHealth);
	}

	getMaxHealth(): number {
		return this._healthBar.getMaxHealth();
	}
}

export class HealthComponent extends ScriptComponent {
	protected healthUI: HealthUI;
	constructor(
		private health: number = 100,
		private maxHealth: number = 100,
		private showHealthBar: boolean = true,
	) {
		super();
		this.health = health;
		this.healthUI = new HealthUI();
	}

	public setDamage(damage: number) {
		this.setHealth(this.health - damage);
	}

	public setHealth(health: number) {
		if (health < 0.1) {
			health = 0;
		}
		if (health > this.maxHealth) {
			health = this.maxHealth;
		}
		this.health = health;
	}

	public getHealth(): number {
		return this.health;
	}

	public getMaxHealth(): number {
		return this.maxHealth;
	}

	public setMaxHealth(maxHealth: number) {
		this.maxHealth = maxHealth;
	}

	onUpdate(): void {
		// if(this.health <= 0) {
		// 	Time.timeScale = 0.1;
		// }
	}

	setHealthBarVisible(show: boolean) {
		this.showHealthBar = show;
	}

	isHealthBarVisible(): boolean {
		return this.showHealthBar;
	}

	onLateUpdate(): void {
		const scene = this.entity.getScene();
		if (scene && (this.healthUI.getScene() === null || this.healthUI.getScene() !== scene)) {
			scene.addEntity(this.healthUI);
		}
		this.healthUI.showHealthBar(this.showHealthBar);
		this.healthUI.setHealth(this.health);
		this.healthUI.setMaxHealth(this.maxHealth);
		const gameObj = this.entity as GameObject;
		const currentCamera = Cameras.currentCamera as OrthographicCamera;
		if (currentCamera) {
			const gameObj = this.entity as GameObject;
			const currentCamera = Cameras.currentCamera as OrthographicCamera;

			if (currentCamera) {
				// PosiciÃ³n ideal para centrar la barra arriba del objeto
				const topCenter = gameObj.transform.position
					.clone()
					.substract(new Vector2(0, gameObj.transform.size.y / 2));
				const canvasPos = currentCamera.getCanvasPositionFromWorldPosition(topCenter);
				const screenPos = Screen.getInstance().canvasToUISpace(canvasPos);

				this.healthUI.setPosition(
					screenPos,
					this.healthUI._healthBar.transform.size.x / 2,
					this.healthUI._healthBar.transform.size.y,
				);
			}
		}
	}

	onDestroy(): void {
		const scene = this.entity.getScene();
		if (scene) {
			scene.destroyEntity(this.healthUI);
		}
	}
}
