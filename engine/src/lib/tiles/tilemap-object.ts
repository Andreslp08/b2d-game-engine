import { Transform } from "../common/components/transform";
import { Component } from "../ecs/component";
import { Entity } from "../ecs/entity";
import { Sprite } from "../graphics/sprites/components/sprite";
import { SpriteAnimation } from "../graphics/sprites/components/sprite-animation";
import Vector2 from "../math/vector2";
import { CullingConfigComponent } from "../performance/culling";

export interface ITile {
	id: string;
	region: string;
	collidable: boolean;
	sprite: Sprite | SpriteAnimation;
}

type TileLayerOptions = {
	name: string;
	cellSizeInGameUnits: Vector2;
	gridSize: Vector2;
	worldPosition: Vector2;
};

export class TileLayer extends Component {
	regions: Set<string> = new Set();
	tileData: ITile[][] = [];
	name: string = "";
	cellSizeInGameUnits: Vector2;
	gridSize: Vector2;
	worldPosition: Vector2;

	constructor(options: TileLayerOptions) {
		super();
		this.unique = false;
		this.name = options.name;
		this.cellSizeInGameUnits = options.cellSizeInGameUnits;
		this.gridSize = options.gridSize;
		this.worldPosition = options.worldPosition;
	}

	addRegion(region: string): string {
		this.regions.add(region);
		return this.regions[region];
	}

	removeRegion(region: string): void {
		this.regions.delete(region);
	}

	clearRegions(): void {
		this.regions.clear();
	}

	hasRegion(region: string): boolean {
		return this.regions.has(region);
	}

	createTileData(tileData: ITile[][]): void {
		this.tileData = tileData;
        this.positionTiles();
	}

	setZindex(zIndex: number): void {
		super.setZindex(zIndex);
		this.tileData.forEach((row) => {
			row.forEach((tile) => {
				tile.sprite.setZindex(zIndex);
			});
		});
	}

	// position the tiles
	private positionTiles(): void {
		for (let i = 0; i < this.tileData.length; i++) {
			for (let j = 0; j < this.tileData[i].length; j++) {
				const tile = this.tileData[i][j];
				const sprite = tile.sprite;
				if (sprite instanceof Sprite) {
                    this.entity.addComponent(sprite);
                    sprite.setZindex(this.zIndex);
					sprite.setUseEntityTransform(false);
					sprite.setWorldTransform({
						position: new Vector2(
							this.worldPosition.x + j * this.cellSizeInGameUnits.x,
							this.worldPosition.y + i * this.cellSizeInGameUnits.y
						),
						size: new Vector2(this.cellSizeInGameUnits.x, this.cellSizeInGameUnits.y),
						rotation: 0,
					});
				}
			}
		}

        const transform = this.entity.getComponent(Transform);
        const position = this.worldPosition;
        const size = new Vector2(20,20);
        if(!transform) {
            this.entity.addComponent(new Transform({position, size, rotation:0}));
        } else{
            transform.position = position;
            transform.size = size;
        }

	}
}

export class TileMapObject extends Entity {

    constructor(){
        super();
        this.addComponent(new Transform({position: new Vector2(0,0), size: new Vector2(0,0), rotation: 0}));
        this.addComponent(new CullingConfigComponent());
    }
	getOrderedTileLayers(): TileLayer[] {
		return this.getComponents(TileLayer).sort((a, b) => a.getZindex() - b.getZindex());
	}

	addLayer(layer: TileLayer): void {
		this.addComponent(layer);
	}

	removeLayer(layer: TileLayer): void {
		this.deleteComponentById(layer.getId());
	}
}
