import { Time } from "../../common/interfaces/time";
import { Entity } from "../../ecs/entity";
import { Cameras } from "../../graphics/cameras/camera-manager";
import { OrthographicCamera } from "../../graphics/cameras/orthographic-camera";
import { ScreenCamera } from "../../graphics/cameras/screen-camera";
import { RenderLayerTypes } from "../../graphics/enum/render-layer-types.enum";
import { Screen } from "../../graphics/screen/screen";
import { KeyBoardManager } from "../../input/interfaces/keyboard-manager";
import Vector2 from "../../math/vector2";
import { ScriptComponent } from "../../scripts/script-component";
import { UIComponent } from "../../ui/components/ui-component";

export interface CameraNavigatorOptions {
	speed?: number;
	fastMultiplier?: number;
	zoomStep?: number;
	minZoom?: number;
	maxZoom?: number;
}

class CameraNavigatorUI extends UIComponent {
	constructor(private readonly navigator: CameraNavigator) {
		super({ position: Vector2.ZERO.clone(), size: Vector2.ZERO.clone(), rotation: 0 });
	}

	render(context: CanvasRenderingContext2D): void {
		const camera = Cameras.currentCamera as OrthographicCamera;
		const screenCamera = Cameras.currentScreenCamera as ScreenCamera;
		if (!camera || !screenCamera) return;

		const cameraPosition = this.navigator.getPosition();
		const uiSize = Screen.getInstance().getUISize();
		const aimPosition = new Vector2(uiSize.x / 2, uiSize.y / 2);
		const pointerText = `X ${cameraPosition.x.toFixed(2)}  Y ${cameraPosition.y.toFixed(2)}`;

		context.save();
		context.font = "12px monospace";
		context.textBaseline = "middle";
		context.fillStyle = "rgba(0, 0, 0, 0.75)";
		context.fillRect(10, 10, 230, 24);
		context.fillStyle = "#a8d8ff";
		context.fillText("WASD / ARROWS  |  SHIFT FAST  |  WHEEL ZOOM", 18, 22);

		context.strokeStyle = "#a8d8ff";
		context.lineWidth = 1;
		context.beginPath();
		context.moveTo(aimPosition.x - 12, aimPosition.y);
		context.lineTo(aimPosition.x + 12, aimPosition.y);
		context.moveTo(aimPosition.x, aimPosition.y - 12);
		context.lineTo(aimPosition.x, aimPosition.y + 12);
		context.arc(aimPosition.x, aimPosition.y, 5, 0, Math.PI * 2);
		context.stroke();

		const pointerPadding = 8;
		const pointerWidth = context.measureText(pointerText).width + pointerPadding * 2;
		context.fillStyle = "rgba(0, 0, 0, 0.75)";
		context.fillRect(aimPosition.x + 14, aimPosition.y + 14, pointerWidth, 24);
		context.fillStyle = "#ffffff";
		context.fillText(pointerText, aimPosition.x + 14 + pointerPadding, aimPosition.y + 26);
		context.restore();
	}
}

export class CameraNavigator extends ScriptComponent {
	private readonly speed: number;
	private readonly fastMultiplier: number;
	private readonly zoomStep: number;
	private readonly minZoom: number;
	private readonly maxZoom: number;
	private position = Vector2.ZERO.clone();
	private zoom = 1;
	private readonly ui = new Entity();
	private readonly onWheel = (event: WheelEvent) => {
		if (event.deltaY === 0) return;

		const direction = event.deltaY < 0 ? 1 : -1;
		this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom + direction * this.zoomStep));
		event.preventDefault();
	};

	constructor(options: CameraNavigatorOptions = {}) {
		super();
		this.speed = options.speed ?? 10;
		this.fastMultiplier = options.fastMultiplier ?? 4;
		this.zoomStep = options.zoomStep ?? 0.1;
		this.minZoom = options.minZoom ?? 0.25;
		this.maxZoom = options.maxZoom ?? 3;
		this.ui.renderLayer = RenderLayerTypes.UI;
		this.ui.addComponent(new CameraNavigatorUI(this));
	}

	onStart(): void {
		const camera = Cameras.currentCamera;
		this.position = camera?.getPosition().clone() ?? Vector2.ZERO.clone();
		this.zoom = camera?.getFieldOfView() ?? 1;
		window.addEventListener("wheel", this.onWheel, { passive: false });
		const scene = this.entity.getScene();
		if (scene && !this.ui.getScene()) scene.addEntity(this.ui);
	}

	onLateUpdate(): void {
		const camera = Cameras.currentCamera;
		if (!camera) return;

		const horizontal = Number(KeyBoardManager.keyDown("d") || KeyBoardManager.keyDown("arrowright"))
			- Number(KeyBoardManager.keyDown("a") || KeyBoardManager.keyDown("arrowleft"));
		const vertical = Number(KeyBoardManager.keyDown("s") || KeyBoardManager.keyDown("arrowdown"))
			- Number(KeyBoardManager.keyDown("w") || KeyBoardManager.keyDown("arrowup"));
		const magnitude = Math.hypot(horizontal, vertical);
		const speed = this.speed * (KeyBoardManager.keyDown("shift") ? this.fastMultiplier : 1);

		if (magnitude > 0) {
			this.position.add(
				new Vector2(horizontal / magnitude, vertical / magnitude).scale(speed * Time.unscaledDeltaTime),
			);
		}

		camera.setPosition(this.position.clone());
		camera.setFieldOfView(this.zoom);
	}

	onDestroy(): void {
		window.removeEventListener("wheel", this.onWheel);
		this.ui.destroy();
	}

	getPosition(): Vector2 {
		return this.position.clone();
	}
}

export function createCameraNavigator(options?: CameraNavigatorOptions): Entity {
	const navigator = new Entity();
	navigator.addComponent(new CameraNavigator(options));
	return navigator;
}
