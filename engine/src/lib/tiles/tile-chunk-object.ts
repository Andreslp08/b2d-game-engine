import { ITranform } from "../input/interfaces/transform.interface";
import { GameObject } from "../common/entities/game-object";
import { ITileChunk, TileTexture, TileTextureData } from "./definitions";
import Vector2 from "../math/vector2";
import { Transform } from "../common/components/transform";
import { Collider } from "../physics/components/collider";
import { TileChunkBatch } from "./components/tile-chunk-batch";

type Parameters = ITileChunk;

export class TileChunk extends GameObject implements ITileChunk {
	chunkId: string;
	collidable: boolean;
	texture: TileTexture;
	worldPosition: Vector2;
	cellSizeInGameUnits: Vector2;
	gridSize: Vector2;

	constructor(parameters: Parameters) {
		const transform: ITranform = {
			position: new Vector2(0, 0),
			size: new Vector2(1, 1),
			rotation: 0,
		};
		super(transform);
		this.chunkId = '';
		if (parameters.renderLayer !== undefined) this.renderLayer = parameters.renderLayer;
		this.collidable = parameters.collidable;
		this.texture = parameters.texture;
		this.worldPosition = parameters.worldPosition;
		this.cellSizeInGameUnits = parameters.cellSizeInGameUnits;
		this.gridSize = parameters.gridSize;

		const transformComponent = this.getComponent(Transform);
		if (transformComponent) {
			transformComponent.position = this.worldPosition
				.clone()
				.add(
					new Vector2(
						(this.gridSize.x - 1) * this.cellSizeInGameUnits.x * 0.5,
						(this.gridSize.y - 1) * this.cellSizeInGameUnits.y * 0.5,
					),
				);
			transformComponent.size = new Vector2(
				this.gridSize.x * this.cellSizeInGameUnits.x,
				this.gridSize.y * this.cellSizeInGameUnits.y,
			);
		}
		this.addTag("tile-chunk");
		this.generateTiles();
		this.createCollider();
	}

	createCollider() {
		if (this.collidable) {
			const size = new Vector2(
				this.gridSize.x * this.cellSizeInGameUnits.x,
				this.gridSize.y * this.cellSizeInGameUnits.y,
			);
			this.addComponent(new Collider(new Vector2(0, 0), size));
		}
	}

	generateTiles() {
		this.addComponent(new TileChunkBatch(this.getTextureData(), this.cellSizeInGameUnits, this.gridSize));
	}

	private getTextureData(): TileTextureData {
		if (!("atlas" in this.texture)) return this.texture;

		const atlas = this.texture.atlas.nativeElement;
		if (!atlas?.frames) {
			throw new Error("Tile chunk atlas is not loaded");
		}

		const frame = typeof this.texture.frame === "number"
			? Object.values(atlas.frames)[this.texture.frame]
			: atlas.frames[this.texture.frame];
		if (!frame) {
			throw new Error(`Texture frame ${this.texture.frame} does not exist in the atlas`);
		}

		return {
			image: this.texture.image,
			framePosition: new Vector2(frame.frame.x, frame.frame.y),
			frameSize: { w: frame.frame.w, h: frame.frame.h },
		};
	}

	getFinalSize(): Vector2 {
		return new Vector2(
			this.gridSize.x * this.cellSizeInGameUnits.x,
			this.gridSize.y * this.cellSizeInGameUnits.y,
		);
	}
}
