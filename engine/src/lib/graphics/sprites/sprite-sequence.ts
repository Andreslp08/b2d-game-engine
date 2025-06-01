
import { ITranform } from "../../input/interfaces/transform.interface";
import { Sprite } from "./components/sprite";


export class SpriteSequence {
	sprites: Sprite[] = [];
	name: string;

	constructor(name:string) {
		this.name = name;	
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
		this.sprites = this.sprites.filter((sprite) => sprite.id !== id);
		return this;
	}

	removeAllSprites() {
		this.sprites = [];
		return this;
	}
}
