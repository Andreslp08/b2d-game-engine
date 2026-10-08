export interface TiledProperty {
	name: string;
	value: string | number | boolean;
}

export interface TiledChunk {
	data: number[];
	height: number;
	width: number;
	x: number;
	y: number;
}

export interface TiledObject {
	class?: string;
	gid?: number;
	height: number;
	id: number;
	name: string;
	opacity?: number;
	properties?: TiledProperty[];
	rotation?: number;
	type?: string;
	visible?: boolean;
	width: number;
	x: number;
	y: number;
}

export interface TiledLayer {
	class?: string;
	chunks?: TiledChunk[];
	layers?: TiledLayer[];
	name: string;
	offsetx?: number;
	offsety?: number;
	opacity?: number;
	parallaxx?: number;
	parallaxy?: number;
	objects?: TiledObject[];
	properties?: TiledProperty[];
	type: "group" | "objectgroup" | "tilelayer";
	visible?: boolean;
	x?: number;
	y?: number;
}

export interface TiledTile {
	animation?: { duration: number; tileid: number }[];
	id: number;
	image?: string;
	imageheight?: number;
	imagewidth?: number;
	properties?: TiledProperty[];
}

export interface TiledTileset {
	columns: number;
	firstgid: number;
	margin?: number;
	properties?: TiledProperty[];
	spacing?: number;
	tileheight: number;
	tiles?: TiledTile[];
	tilewidth: number;
}

export interface TiledMapData {
	layers: TiledLayer[];
	parallaxoriginx?: number;
	parallaxoriginy?: number;
	tileheight: number;
	tilesets: TiledTileset[];
	tilewidth: number;
}
