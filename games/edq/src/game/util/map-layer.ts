import type { TiledMapLoadResult } from "@b2d-engine/core/tiles/adapters/tiled/tiled-map-adapter";

export const isFromLayer = (
	object: TiledMapLoadResult["objects"][number],
	className: string,
): boolean => {
	return object.className === className || object.layerClassName === className;
};
