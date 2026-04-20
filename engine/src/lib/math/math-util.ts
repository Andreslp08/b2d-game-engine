import { Transform } from "../common/components/transform";
import { Entity } from "../ecs/entity";
import Vector2 from "./vector2";

export class MathUtil {
	static degToRad(grades: number): number {
		return grades * (Math.PI / 180);
	}

	static radToDeg(radians: number): number {
		return radians / (Math.PI / 180);
	}
	static lerp(a: number, b: number, t: number): number {
		return a + (b - a) * t;
	}

	static clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, value));
	}

	static moveTowards(current: number, target: number, maxDelta: number): number {
		if (Math.abs(target - current) <= maxDelta) return target;
		return current + Math.sign(target - current) * maxDelta;
	}

	static getDistanceBetweenEntities(entityA: Entity, entityB: Entity): number {
		const transformA = entityA.getComponent(Transform);
		const transformB = entityB.getComponent(Transform);
		if (!transformA || !transformB) return 0;

		const ax1 = transformA.position.x - transformA.size.x / 2;
		const ax2 = transformA.position.x + transformA.size.x / 2;
		const ay1 = transformA.position.y - transformA.size.y / 2;
		const ay2 = transformA.position.y + transformA.size.y / 2;

		const bx1 = transformB.position.x - transformB.size.x / 2;
		const bx2 = transformB.position.x + transformB.size.x / 2;
		const by1 = transformB.position.y - transformB.size.y / 2;
		const by2 = transformB.position.y + transformB.size.y / 2;

		const dx = Math.max(0, Math.max(ax1 - bx2, bx1 - ax2));
		const dy = Math.max(0, Math.max(ay1 - by2, by1 - ay2));
		return Math.sqrt(dx * dx + dy * dy);
	}

	static getDistanceBetweenPoints(pointA: Vector2, pointB: Vector2): number {
		const dx = pointA.x - pointB.x;
		const dy = pointA.y - pointB.y;
		const distance = Math.sqrt(dx * dx + dy * dy);
		return distance;
	}

	static lerpVector(a: Vector2, b: Vector2, t: number): Vector2 {
		return new Vector2(this.lerp(a.x, b.x, t), this.lerp(a.y, b.y, t));
	}

	static parseHexColor(color: string): { r: number; g: number; b: number } | null {
		const normalized = color.replace("#", "");
		if (normalized.length !== 6) return null;

		const value = Number.parseInt(normalized, 16);
		if (Number.isNaN(value)) return null;

		return {
			r: (value >> 16) & 255,
			g: (value >> 8) & 255,
			b: value & 255,
		};
	}

	static lerpHexColor(from: string, to: string, t: number): string {
		const start = this.parseHexColor(from);
		const end = this.parseHexColor(to);
		if (!start || !end) return from;

		const r = Math.round(this.lerp(start.r, end.r, t));
		const g = Math.round(this.lerp(start.g, end.g, t));
		const b = Math.round(this.lerp(start.b, end.b, t));
		return `rgb(${r}, ${g}, ${b})`;
	}
}
