import  { GameObject } from "engine/common/entities/game-object";
import { Time } from "engine/common/interfaces/time";
import type { Updatable } from "engine/common/interfaces/updatable";
import { WorldCameras } from "engine/graphics/cameras/camera-managers";
import  { WorldCamera } from "engine/graphics/cameras/world-camera";
import { RenderLayerTypes } from "engine/graphics/enum/render-layer-types.enum";
import type { ITranform } from "engine/input/interfaces/transform.interface";
import { MathUtil } from "engine/math/math-util";
import Vector2 from "engine/math/vector2";
import { ScriptComponent } from "engine/scripts/script-component";
import { UIComponent } from "engine/ui/components/ui-component";
import { UIObject } from "engine/ui/entities/ui-object";

export class HealthBarComponent extends UIComponent implements Updatable {
	private visible = true;
	private displayedHealth = 0;
	constructor(
		public transform: ITranform,
		private health: number = 100,
		private maxHealth: number = 100
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
		const cameraFOV = WorldCameras.currentCamera.getFieldOfView();
		const position = this.transform.position.multiplyBy(cameraFOV);
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

	fixedUpdate(): void {
		
	}
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
		private showHealthBar: boolean = true
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
		const currentCamera = WorldCameras.currentCamera as WorldCamera;
		if (currentCamera) {
			const gameObj = this.entity as GameObject;
			const currentCamera = WorldCameras.currentCamera as WorldCamera;

			if (currentCamera) {
				// Posición ideal para centrar la barra arriba del objeto
				const topCenter = gameObj.transform.position
					.clone()
					.substract(new Vector2(0, gameObj.transform.size.y / 2));
				const screenPos = currentCamera.getScreenPositionFromWorldPosition(topCenter);

				this.healthUI.setPosition(
					screenPos,
					this.healthUI._healthBar.transform.size.x / 2,
					this.healthUI._healthBar.transform.size.y
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
