import { Component } from "../../ecs/component";
import Vector2 from "../../math/vector2";
import { ParticleRenderType } from "../enum/enum";
import { Particle } from "../particle";

export class ParticleEmitter extends Component {
	particleRenderType: ParticleRenderType;
	particles: Particle[] = [];
	emissionRate: number;
	burstCount: number;
	duration: number;
	loop: boolean;
	maxParticles: number;
	playing: boolean;
	prewarm: boolean;
	localSpace: boolean;
	lifetime: { min: number; max: number };
	speed: { min: number; max: number };
	angle: { min: number; max: number };
	size: { startMin: Vector2; startMax: Vector2; endMin: Vector2; endMax: Vector2 };
	opacity: { start: number; end: number };
	gravity: Vector2;
	positionOffset: Vector2;
	startColors: string[];
	endColors: string[];
	emissionAccumulator: number;
	elapsedTime: number;
	hasBurst: boolean;
	destroyOnComplete: boolean;

	constructor() {
		super();
		this.unique = false;
		this.particleRenderType = ParticleRenderType.CIRCLE;
		this.emissionRate = 0;
		this.burstCount = 0;
		this.duration = 0;
		this.loop = false;
		this.maxParticles = 100;
		this.playing = true;
		this.prewarm = false;
		this.localSpace = true;
		this.lifetime = { min: 0.4, max: 1 };
		this.speed = { min: 1, max: 5 };
		this.angle = { min: 0, max: 360 };
		this.size = {
			startMin: new Vector2(0.1, 0.1),
			startMax: new Vector2(0.2, 0.2),
			endMin: new Vector2(0, 0),
			endMax: new Vector2(0.05, 0.05),
		};
		this.opacity = { start: 1, end: 0 };
		this.gravity = new Vector2(0, 0);
		this.positionOffset = new Vector2(0, 0);
		this.startColors = ["#ffffff"];
		this.endColors = ["#ffffff"];
		this.emissionAccumulator = 0;
		this.elapsedTime = 0;
		this.hasBurst = false;
		this.destroyOnComplete = false;
	}
}
