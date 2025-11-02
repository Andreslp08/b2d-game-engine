import { DrawDebugLine } from "../../debug/components/draw-line";
import { Renderer } from "./render";

export class DebugShapesRenderer extends Renderer {
	render(renderingContext: CanvasRenderingContext2D): void {
        this.entity.getComponents(DrawDebugLine).forEach((line) => {
            if(!line.start || !line.end) return;
            if(!line.color) return;
            if(line.debugMode === false) return;
			renderingContext.beginPath();
            renderingContext.lineWidth = line.width || 0.01;
			renderingContext.moveTo(line.start.x, line.start.y);
			renderingContext.lineTo(line.end.x, line.end.y);
			renderingContext.strokeStyle = line.color;
			renderingContext.stroke();
		});
	}
}
