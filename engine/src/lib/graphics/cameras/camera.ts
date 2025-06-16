import { Scene } from "../scenes/scene";
import Vector2 from "../../math/vector2";
import { Renderable } from "../../common/interfaces/renderable";
import { RenderLayerTypes } from "../enum/render-layer-types.enum";

export class Camera implements Renderable {

	protected _fieldOfView: number = 1;
	renderLayer: RenderLayerTypes;
	protected position: Vector2;
	scene: Scene;
	private _fade:boolean = false;
	private _fadeAlpha:number = 0;
	private _fadeColor:string = "#000";
	private renderFilters:string = "";

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

	public getRawPosition(): Vector2 {
		return this.position;
	}

	public setXPosition(x: number): void {
		this.position.x = x;
	}

	public setYPosition(y: number): void {
		this.position.y = y;
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

	
	setRenderFilters(filters: string): void {
		this.renderFilters = filters;
	}

	
	getRenderFilters(): string {
		return this.renderFilters;
	}

	setFieldOfView(fieldOfView: number): void {
		this._fieldOfView = fieldOfView;
	}

	getFieldOfView(): number {
		return this._fieldOfView;
	}


	render(context: CanvasRenderingContext2D): void {}
}
