import { Updatable } from "../../common/interfaces/updatable";
import { Scene } from "../scenes/scene";
import Vector2 from "../../math/vector2";
import { Renderable } from "../../common/interfaces/renderable";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";

export class Camera implements Renderable, Updatable {
	renderLayer: RenderLayerTypes;
	protected position: Vector2;
	scene: Scene;
	private _fade:boolean = false;
	private _fadeAlpha:number = 0;
	private _fadeColor:string = "#000";

	constructor(initialPosition: Vector2, scene: Scene) {
		this.renderLayer = RenderLayerTypes.World;
		this.position = initialPosition;
		this.scene = scene;
	}

	public setPosition(vector2: Vector2): void {
		this.position = vector2;
	}
	public getPosition(): Vector2 {
		return this.position;
	}

	public fadeCamera(fade: boolean, alpha: number, color?: string): void {
		this._fade = fade;
		this._fadeAlpha = alpha;
		this._fadeColor = color || "#000";	
	}

	public get isFade(): boolean {
		return this._fade;
	}
	public get fadeAlpha(): number {
		return this._fadeAlpha;
	}
	public get fadeColor(): string {
		return this._fadeColor;
	}


	render(context: CanvasRenderingContext2D): void {}
	update(deltaTime: number): void {}
}
