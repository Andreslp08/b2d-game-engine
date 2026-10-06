import Vector2 from "../math/vector2";
import { Scene } from "../scenes/scene";
import { TiledMapAdapter, type TiledMapLoadResult } from "./adapters/tiled/tiled-map-adapter";
import { ITileChunk } from "./definitions";
import { TileChunk } from "./tile-chunk-object";

type TileChunkDirection = "horizontal" | "vertical";
type TileChunkDefinition = ITileChunk & { chunkId: string };

interface ITileMapArgs {
	scene: Scene;
}

export interface TileMapBounds {
	position: Vector2;
	size: Vector2;
}

export interface TileChunkEntityOptions {
	chunkId?: string;
	rotation?: number;
	zIndex?: number;
}

export class TilePattern {
	private readonly chunks: ITileChunk[] = [];

	add(chunk: ITileChunk, position: Vector2) {
		this.chunks.push({
			collidable: chunk.collidable,
			texture: chunk.texture,
			renderLayer: chunk.renderLayer,
			worldPosition: position.clone(),
			cellSizeInGameUnits: chunk.cellSizeInGameUnits.clone(),
			gridSize: chunk.gridSize.clone(),
		});

		return this;
	}

	getChunks() {
		return this.chunks.map((chunk) => ({
			collidable: chunk.collidable,
			texture: chunk.texture,
			renderLayer: chunk.renderLayer,
			worldPosition: chunk.worldPosition.clone(),
			cellSizeInGameUnits: chunk.cellSizeInGameUnits.clone(),
			gridSize: chunk.gridSize.clone(),
		}));
	}
}

export class TileMap implements ITileMapArgs {
	chunks: Map<string, TileChunk> = new Map();
	scene: Scene;
	private lastPattern?: TileChunkDefinition[];
	private repeatCount = 0;
	private nextChunkId = 0;

	constructor(params: ITileMapArgs) {
		this.scene = params.scene;
	}

	static async generateMapFromTiled(scene: Scene, path: string): Promise<TiledMapLoadResult> {
		const tileMap = new TileMap({ scene });
		return new TiledMapAdapter(tileMap).generate(path);
	}

	addChunk(params: ITileChunk, length = 1, direction: TileChunkDirection = "horizontal") {
		return this.addChunks(params, length, direction, params.worldPosition);
	}

	addChunkEntity(params: ITileChunk, options: TileChunkEntityOptions = {}): TileChunk {
		const chunk = new TileChunk(params);
		chunk.chunkId = options.chunkId ?? `chunk_${this.nextChunkId++}`;
		chunk.setZindex(options.zIndex ?? 1);
		chunk.transform.rotation = options.rotation ?? 0;
		this.scene.addEntity(chunk);
		this.chunks.set(chunk.chunkId, chunk);
		return chunk;
	}

	createPattern() {
		return new TilePattern();
	}

	addPattern(pattern: TilePattern, origin: Vector2) {
		const chunks = pattern.getChunks();
		if (chunks.length === 0) return this;

		const definitions = chunks.map((chunk) => ({
			...chunk,
			chunkId: `chunk_${this.nextChunkId++}`,
			worldPosition: origin.clone().add(chunk.worldPosition),
		}));
		for (const chunkDefinition of definitions) {
			this.addChunkEntity(chunkDefinition, { chunkId: chunkDefinition.chunkId });
		}
		this.lastPattern = definitions;
		this.repeatCount = 0;

		return this;
	}

	repeat(amount: number, direction: TileChunkDirection) {
		const pattern = this.lastPattern;
		if (!pattern || pattern.length === 0) return this;

		const step = this.getPatternStep(pattern, direction);
		for (let i = 1; i <= amount; i++) {
			const repeatIndex = this.repeatCount + i;
			for (const chunkDefinition of pattern) {
				const repeatedDefinition = {
					...chunkDefinition,
					chunkId: `${chunkDefinition.chunkId}_${direction}_${repeatIndex}`,
					worldPosition: chunkDefinition.worldPosition
						.clone()
						.add(step.clone().multiplyBy(repeatIndex)),
				};
				this.addChunkEntity(repeatedDefinition, { chunkId: repeatedDefinition.chunkId });
			}
		}
		this.repeatCount += amount;

		return this;
	}

	fill(rows: number) {
		return this.repeat(rows, "vertical");
	}

	getBounds(): TileMapBounds {
		if (this.chunks.size === 0) {
			return { position: Vector2.ZERO.clone(), size: Vector2.ZERO.clone() };
		}

		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;

		for (const chunk of this.chunks.values()) {
			const size = chunk.getFinalSize();
			const position = chunk.transform.position;
			minX = Math.min(minX, position.x - size.x / 2);
			minY = Math.min(minY, position.y - size.y / 2);
			maxX = Math.max(maxX, position.x + size.x / 2);
			maxY = Math.max(maxY, position.y + size.y / 2);
		}

		return {
			position: new Vector2(minX, minY),
			size: new Vector2(maxX - minX, maxY - minY),
		};
	}

	private addChunks(
		params: ITileChunk,
		length: number,
		direction: TileChunkDirection,
		startPosition: Vector2,
	) {
		const count = length > 1 ? length : 1;
		const step = this.getStep(params, direction);
		const pattern: TileChunkDefinition[] = [];

		for (let i = 0; i < count; i++) {
			const chunkDefinition: TileChunkDefinition = {
				...params,
				renderLayer: params.renderLayer,
				chunkId: `chunk_${this.nextChunkId++}`,
				worldPosition: startPosition.clone().add(step.clone().multiplyBy(i)),
			};
			this.addChunkEntity(chunkDefinition, { chunkId: chunkDefinition.chunkId });
			pattern.push(chunkDefinition);
		}
		this.lastPattern = pattern;
		this.repeatCount = 0;

		return this;
	}

	private getStep(params: ITileChunk, direction: TileChunkDirection) {
		return new Vector2(
			direction === "horizontal" ? params.cellSizeInGameUnits.x * params.gridSize.x : 0,
			direction === "vertical" ? params.cellSizeInGameUnits.y * params.gridSize.y : 0,
		);
	}

	private getPatternStep(pattern: TileChunkDefinition[], direction: TileChunkDirection) {
		let min = Infinity;
		let max = -Infinity;

		for (const chunk of pattern) {
			const position = direction === "horizontal" ? chunk.worldPosition.x : chunk.worldPosition.y;
			const size = direction === "horizontal"
				? chunk.cellSizeInGameUnits.x * chunk.gridSize.x
				: chunk.cellSizeInGameUnits.y * chunk.gridSize.y;
			min = Math.min(min, position);
			max = Math.max(max, position + size);
		}

		return direction === "horizontal" ? new Vector2(max - min, 0) : new Vector2(0, max - min);
	}
}
