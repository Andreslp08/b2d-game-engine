import { AssetsManager } from "../../../common/assets-manager/assets-manager";
import { GameObject } from "../../../common/entities/game-object";
import { Parallax } from "../../../graphics/components/parallax";
import { RenderLayerTypes } from "../../../graphics/enum/render-layer-types.enum";
import Vector2 from "../../../math/vector2";
import { Collider } from "../../../physics/components/collider";
import { StaticBody } from "../../../physics/components/static-body";
import { TileAnimation, TileTextureData } from "../../definitions";
import type { TileMap, TileMapBounds } from "../../tilemap";
import {
	TiledLayer,
	TiledMapData,
	TiledObject,
	TiledProperty,
	TiledTileset,
} from "./tiled-map.types";

interface TiledLayerContext {
	offset: Vector2;
	opacity: number;
	parallax: Vector2;
	parallaxOriginOffset: Vector2;
	renderLayer?: RenderLayerTypes;
	visible: boolean;
}

interface TiledTileVisual {
	animation?: TileAnimation;
	texture: TileTextureData;
}

export interface TiledMapObjectData {
	className: string;
	gid?: number;
	id: number;
	layerClassName: string;
	layerName: string;
	layerProperties: ReadonlyMap<string, TiledProperty["value"]>;
	name: string;
	position: Vector2;
	properties: ReadonlyMap<string, TiledProperty["value"]>;
	rotation: number;
	size: Vector2;
}

export interface TiledMapLoadResult {
	bounds: TileMapBounds;
	objects: readonly TiledMapObjectData[];
	tileMap: TileMap;
}

export class TiledMapAdapter {
	private readonly objects: TiledMapObjectData[] = [];

	constructor(private readonly tileMap: TileMap) {}

	async generate(path: string): Promise<TiledMapLoadResult> {
		const response = await fetch(path);
		if (!response.ok) {
			throw new Error(`Unable to load Tiled map from '${path}'`);
		}

		const mapData = await response.json() as TiledMapData;
		this.generateLayers(mapData, mapData.layers, {
			offset: Vector2.ZERO.clone(),
			opacity: 1,
			parallax: new Vector2(1, 1),
			parallaxOriginOffset: Vector2.ZERO.clone(),
			visible: true,
		});
		return { bounds: this.tileMap.getBounds(), objects: this.objects, tileMap: this.tileMap };
	}

	private generateLayers(
		mapData: TiledMapData,
		layers: TiledLayer[],
		parentContext: TiledLayerContext,
	): void {
		for (const layer of layers) {
			const context = this.getLayerContext(mapData, layer, parentContext);

			if (layer.type === "group" && layer.layers) {
				this.generateLayers(mapData, layer.layers, context);
				continue;
			}
			if (layer.type === "objectgroup") this.collectObjects(mapData, layer, context);

			const collisionType = this.getStringProperty(layer.properties, "engine.collision")?.toLowerCase();
			if (collisionType) {
				if (layer.type !== "tilelayer" || collisionType !== "static") {
					throw new Error(`Unsupported Tiled collision '${collisionType}' on layer`);
				}
				this.generateStaticColliders(layer, context);
				continue;
			}
			if (!context.visible) continue;
			if (!context.renderLayer) continue;

			const zIndex = this.getNumberProperty(layer.properties, "engine.zIndex") ?? 0;
			if (layer.type === "tilelayer") this.generateTileLayer(mapData, layer, context, zIndex);
			if (layer.type === "objectgroup") this.generateObjectLayer(mapData, layer, context, zIndex);
		}
	}

	private collectObjects(mapData: TiledMapData, layer: TiledLayer, context: TiledLayerContext): void {
		for (const object of layer.objects ?? []) {
			this.objects.push({
				className: object.class ?? object.type ?? "",
				gid: object.gid === undefined ? undefined : object.gid & 0x0fffffff,
				id: object.id,
				layerClassName: layer.class ?? "",
				layerName: layer.name,
				layerProperties: new Map(layer.properties?.map((property) => [property.name, property.value])),
				name: object.name,
				position: new Vector2(
					context.offset.x + object.x / mapData.tilewidth,
					context.offset.y + object.y / mapData.tileheight,
				),
				properties: new Map(object.properties?.map((property) => [property.name, property.value])),
				rotation: object.rotation ?? 0,
				size: new Vector2(object.width / mapData.tilewidth, object.height / mapData.tileheight),
			});
		}
	}

	private getLayerContext(
		mapData: TiledMapData,
		layer: TiledLayer,
		parentContext: TiledLayerContext,
	): TiledLayerContext {
		const layerName = this.getStringProperty(layer.properties, "engine.renderLayer");
		const renderLayer = layerName && Object.values(RenderLayerTypes).includes(layerName as RenderLayerTypes)
			? layerName as RenderLayerTypes
			: parentContext.renderLayer;
		const parallax = parentContext.parallax.clone().multiply(new Vector2(
			layer.parallaxx ?? 1,
			layer.parallaxy ?? 1,
		));
		const parallaxOrigin = new Vector2(
			(mapData.parallaxoriginx ?? 0) / mapData.tilewidth,
			(mapData.parallaxoriginy ?? 0) / mapData.tileheight,
		);

		return {
			offset: parentContext.offset.clone().add(new Vector2(
				((layer.offsetx ?? 0) / mapData.tilewidth) + (layer.x ?? 0),
				((layer.offsety ?? 0) / mapData.tileheight) + (layer.y ?? 0),
			)),
			opacity: parentContext.opacity * (layer.opacity ?? 1),
			parallax,
			parallaxOriginOffset: new Vector2(
				-parallaxOrigin.x * (1 - parallax.x),
				-parallaxOrigin.y * (1 - parallax.y),
			),
			renderLayer,
			visible: parentContext.visible && layer.visible !== false,
		};
	}

	private generateTileLayer(
		mapData: TiledMapData,
		layer: TiledLayer,
		context: TiledLayerContext,
		zIndex: number,
	): void {
		for (const tiledChunk of layer.chunks ?? []) {
			for (let row = 0; row < tiledChunk.height; row++) {
				let column = 0;
				while (column < tiledChunk.width) {
					const gid = tiledChunk.data[row * tiledChunk.width + column] & 0x0fffffff;
					if (gid === 0) {
						column++;
						continue;
					}

					let length = 1;
					while (
						column + length < tiledChunk.width &&
						(tiledChunk.data[row * tiledChunk.width + column + length] & 0x0fffffff) === gid
					) length++;

					const tile = this.getTileVisual(mapData, gid, context.opacity);
					this.addVisualChunk({
						animation: tile.animation,
						collidable: false,
						texture: tile.texture,
						renderLayer: context.renderLayer,
						worldPosition: this.getVisualPosition(context, tiledChunk.x + column + 0.5, tiledChunk.y + row + 0.5),
						cellSizeInGameUnits: new Vector2(1, 1),
						gridSize: new Vector2(length, 1),
					}, context, { zIndex });
					column += length;
				}
			}
		}
	}

	private generateObjectLayer(
		mapData: TiledMapData,
		layer: TiledLayer,
		context: TiledLayerContext,
		zIndex: number,
	): void {
		for (const object of layer.objects ?? []) {
			if (object.gid === undefined || object.visible === false) continue;
			this.addObject(mapData, object, context, zIndex);
		}
	}

	private addObject(
		mapData: TiledMapData,
		object: TiledObject,
		context: TiledLayerContext,
		zIndex: number,
	): void {
		const size = new Vector2(object.width / mapData.tilewidth, object.height / mapData.tileheight);
		const tile = this.getTileVisual(mapData, object.gid! & 0x0fffffff, context.opacity * (object.opacity ?? 1));
		this.addVisualChunk({
			animation: tile.animation,
			collidable: false,
			texture: tile.texture,
			renderLayer: context.renderLayer,
			worldPosition: this.getVisualPosition(
				context,
				object.x / mapData.tilewidth + size.x / 2,
				object.y / mapData.tileheight - size.y / 2,
			),
			cellSizeInGameUnits: size,
			gridSize: new Vector2(1, 1),
		}, context, { rotation: object.rotation ?? 0, zIndex });
	}

	private generateStaticColliders(layer: TiledLayer, context: TiledLayerContext): void {
		const rows = new Map<number, Set<number>>();
		for (const chunk of layer.chunks ?? []) {
			for (let row = 0; row < chunk.height; row++) {
				for (let column = 0; column < chunk.width; column++) {
					if ((chunk.data[row * chunk.width + column] & 0x0fffffff) === 0) continue;
					const y = chunk.y + row;
					const columns = rows.get(y) ?? new Set<number>();
					columns.add(chunk.x + column);
					rows.set(y, columns);
				}
			}
		}

		while (rows.size > 0) {
			const startY = Math.min(...rows.keys());
			const startX = Math.min(...rows.get(startY)!);
			let width = 1;
			while (rows.get(startY)!.has(startX + width)) width++;

			let height = 1;
			while (this.rowContainsRange(rows.get(startY + height), startX, width)) height++;

			for (let y = startY; y < startY + height; y++) {
				const columns = rows.get(y)!;
				for (let x = startX; x < startX + width; x++) columns.delete(x);
				if (columns.size === 0) rows.delete(y);
			}

			this.addStaticCollider(
				new Vector2(context.offset.x + startX + width / 2, context.offset.y + startY + height / 2),
				new Vector2(width, height),
			);
		}
	}

	private rowContainsRange(columns: Set<number> | undefined, startX: number, width: number): boolean {
		if (!columns) return false;
		for (let x = startX; x < startX + width; x++) {
			if (!columns.has(x)) return false;
		}
		return true;
	}

	private addStaticCollider(position: Vector2, size: Vector2): void {
		const entity = new GameObject({ position, rotation: 0, size });
		const collider = new Collider(Vector2.ZERO.clone(), size);
		collider.ignoreZIndex = true;
		entity.addComponent(collider);
		entity.addComponent(new StaticBody());
		this.tileMap.scene.addEntity(entity);
	}

	private addVisualChunk(
		params: Parameters<TileMap["addChunkEntity"]>[0],
		context: TiledLayerContext,
		options: Parameters<TileMap["addChunkEntity"]>[1],
	): void {
		const chunk = this.tileMap.addChunkEntity(params, options);
		if (context.parallax.x !== 1 || context.parallax.y !== 1) {
			chunk.addComponent(new Parallax(context.parallax.clone()));
		}
	}

	private getVisualPosition(context: TiledLayerContext, x: number, y: number): Vector2 {
		return new Vector2(
			context.offset.x + context.parallaxOriginOffset.x + x,
			context.offset.y + context.parallaxOriginOffset.y + y,
		);
	}

	private getTileVisual(mapData: TiledMapData, gid: number, opacity: number): TiledTileVisual {
		const tileset = [...mapData.tilesets]
			.sort((a, b) => b.firstgid - a.firstgid)
			.find((candidate) => candidate.firstgid <= gid);
		if (!tileset) throw new Error(`Tiled gid ${gid} does not belong to a tileset`);

		const localTileId = gid - tileset.firstgid;
		const tile = tileset.tiles?.find((candidate) => candidate.id === localTileId);
		const texture = this.getTilesetTexture(tileset, localTileId, opacity);
		const animation = tile?.animation?.map((frame) => ({
			duration: frame.duration,
			texture: this.getTilesetTexture(tileset, frame.tileid, opacity),
		}));

		return {
			texture,
			animation: animation && animation.length > 0 ? { frames: animation } : undefined,
		};
	}

	private getTilesetTexture(
		tileset: TiledTileset,
		localTileId: number,
		opacity: number,
	): TileTextureData {
		const tile = tileset.tiles?.find((candidate) => candidate.id === localTileId);
		const assetId = this.getStringProperty(tile?.properties, "engine.assetId")
			?? this.getStringProperty(tileset.properties, "engine.assetId");
		if (!assetId) throw new Error(`Tiled tileset '${tileset.firstgid}' is missing 'engine.assetId'`);
		const image = AssetsManager.getImageByName(assetId);
		if (!image) throw new Error(`Tiled asset '${assetId}' has not been preloaded`);

		if (tile?.image) {
			return {
				image,
				framePosition: Vector2.ZERO.clone(),
				frameSize: { w: tile.imagewidth ?? tileset.tilewidth, h: tile.imageheight ?? tileset.tileheight },
				opacity,
			};
		}
		if (tileset.columns <= 0) throw new Error(`Tiled tileset '${tileset.firstgid}' has no tile columns`);
		const column = localTileId % tileset.columns;
		const row = Math.floor(localTileId / tileset.columns);
		return {
			image,
			framePosition: new Vector2(
				(tileset.margin ?? 0) + column * (tileset.tilewidth + (tileset.spacing ?? 0)),
				(tileset.margin ?? 0) + row * (tileset.tileheight + (tileset.spacing ?? 0)),
			),
			frameSize: { w: tileset.tilewidth, h: tileset.tileheight },
			opacity,
		};
	}

	private getStringProperty(properties: TiledProperty[] | undefined, name: string): string | undefined {
		const value = properties?.find((property) => property.name === name)?.value;
		return typeof value === "string" ? value : undefined;
	}

	private getNumberProperty(properties: TiledProperty[] | undefined, name: string): number | undefined {
		const value = properties?.find((property) => property.name === name)?.value;
		return typeof value === "number" ? value : undefined;
	}
}
