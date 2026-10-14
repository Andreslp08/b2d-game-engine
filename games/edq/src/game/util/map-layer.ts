import type { TiledMapLoadResult } from "engine/tiles/adapters/tiled/tiled-map-adapter";

export const isFromLayer = (
	object: TiledMapLoadResult["objects"][number],
	className: string,
): boolean => {
	return object.className === className || object.layerClassName === className;
};
