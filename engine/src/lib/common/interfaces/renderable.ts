export interface Renderable {
	render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void;
}
