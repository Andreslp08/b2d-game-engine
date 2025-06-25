import { GameAtlas } from "../../common/assets-manager/game-atlas";
import { GameImage } from "../../common/assets-manager/game-image";
import { Entity } from "../../ecs/entity";
import Vector2 from "../../math/vector2";
import { Sprite } from "./components/sprite";

export class SpriteSheet {
	sprites: Sprite[] = [];
	name: string;

	constructor(name: string) {
		this.name = name;
	}

	static genereateSpritesheetFromAtlas(
		name: string,
		atlas: GameAtlas,
		image: GameImage
	): SpriteSheet {
		const spritesheet = new SpriteSheet(name);
		if (!atlas || !atlas.nativeElement) throw new Error(`Atlas ${name} not found`);
		if (!atlas.nativeElement.frames) throw new Error(`Atlas ${name} has an invalid format`);
		if (!image) throw new Error(`Image ${name} not found`);
		if (!image.loaded) throw new Error(`Image ${name} not loaded`);
		const atlasData = atlas.nativeElement;
		const frames = atlasData.frames;
		for (const key in frames) {
			const frameContent = frames[key];
			const frame = frameContent.frame;
			const sourceSize = frameContent.sourceSize;
			const spriteSourceSize = frameContent.spriteSourceSize;
			const sprite = new Sprite({
				image: image,
				framePosition: new Vector2(frame.x, frame.y),
				frameSize: { w: frame.w, h: frame.h },
				spriteSourceSize,
				sourceSize,
				trimmed: frameContent.trimmed,

			});
			spritesheet.addSprite(sprite);
		}
		return spritesheet;
	}

	updateSpritesEntity(entity: Entity) {
		this.sprites.forEach((sprite) => sprite.setEntity(entity));
	}

	addSprite(sprite: Sprite) {
		this.sprites.push(sprite);
		return this;
	}

	removeSprite(sprite: Sprite) {
		this.sprites.splice(this.sprites.indexOf(sprite), 1);
		return this;
	}

	removeSpriteByIndex(index: number) {
		this.sprites.splice(index, 1);
		return this;
	}

	removeSpriteById(id: string) {
		this.sprites = this.sprites.filter((sprite) => sprite.getId() !== id);
		return this;
	}

	removeAllSprites() {
		this.sprites = [];
		return this;
	}
}
