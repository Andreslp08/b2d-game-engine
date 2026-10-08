import { GameAtlas } from "../common/assets-manager/game-atlas";
import { GameImage } from "../common/assets-manager/game-image";
import { RenderLayerTypes } from "../graphics/enum/render-layer-types.enum";
import Vector2 from "../math/vector2";

export interface TileTextureData {
	image: GameImage;
	framePosition: Vector2;
	frameSize: { w: number; h: number };
	scale?: Vector2;
	opacity?: number;
}

export interface TileAnimationFrame {
	duration: number;
	texture: TileTextureData;
}

export interface TileAnimation {
	frames: TileAnimationFrame[];
}

export type TileTexture = TileTextureData | { atlas: GameAtlas; image: GameImage; frame: string | number };

export interface ITileChunk {
	animation?: TileAnimation;
	collidable: boolean;
	texture: TileTexture;
	renderLayer?: RenderLayerTypes;
	worldPosition: Vector2;
	cellSizeInGameUnits: Vector2;
	gridSize: Vector2;
}
