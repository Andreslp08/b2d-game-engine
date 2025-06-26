import { VIEWPORT_HEIGHT_IN_METERS, VIEWPORT_WIDTH_IN_METERS } from "../common/constants";
import { Component } from "../ecs/component";
import Vector2 from "../math/vector2";
import { CullingTarget, CullingType } from "./enum/culling-type";

export class CullingConfigComponent extends Component {
	cullingType: CullingType = CullingType.FRUSTRUM;
	distanceRadius: Vector2 = new Vector2(VIEWPORT_WIDTH_IN_METERS/1.8, VIEWPORT_HEIGHT_IN_METERS/1.8);
	frustrumStrict: boolean = false;
	cullingTarget: CullingTarget = CullingTarget.ALL;
}

export class Culling extends Component {
	
}

