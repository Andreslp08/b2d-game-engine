import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { RenderLayerTypes } from "engine/graphics/enum/render-layer-types.enum";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import Vector2 from "engine/math/vector2";
import { TileLayer, TileMapObject } from "engine/tiles/tilemap-object";



const block1Tile = ({region}: {region: string})=>{
	const block1Image = AssetsManager.getImageByName("spritesheet:box");
    return {
				collidable: true,
				id: "box",
				region: region,
				sprite: new Sprite({
					framePosition: new Vector2(0, 0),
					frameSize: { w: 3137, h: 1834 },
					image: block1Image,
					useEntityTransform: false,
					worldTransform: {
						position: new Vector2(0, 0),
						rotation: 0,
						size: new Vector2(2, 1),
					},
				}),
			}
}
export const MapOne = () => {
	const tilemap = new TileMapObject();
	tilemap.renderLayer = RenderLayerTypes.World;
	const layer1 = new TileLayer({
		worldPosition: new Vector2(0, 0),
		gridSize: new Vector2(200, 3),
		cellSizeInGameUnits: new Vector2(2, 1),
		name: "layer1",
	});
	tilemap.addComponent(layer1);
	const region1 = layer1.addRegion("region1");
	const region2 = layer1.addRegion("region2");
	const region3 = layer1.addRegion("region3");
    //create an arra of tiles of block1 200 elements in 5 rows
    const block1Tiles = Array.from({ length: 20 }, (_, index) => block1Tile({region: region1}));
    
    const block2Tiles = Array.from({ length: 20 }, (_, index) => block1Tile({region: region2}));
  
    const block3Tiles = Array.from({ length: 20 }, (_, index) => block1Tile({region: region3}));

	layer1.createTileData([block1Tiles, block2Tiles, block3Tiles]);
	return tilemap;
};
