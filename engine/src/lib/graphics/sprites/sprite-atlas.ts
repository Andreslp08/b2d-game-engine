import { GameImage } from "../../common/assets-manager/assets-manager";
import { Component } from "../../ecs/component";
import Vector2 from "../../math/vector2";

export class SpriteFrame {
	constructor(
		private _name: string,
		private _clipPosition: Vector2,
		private _clipSize: Vector2
	) {}

	public get clipPosition(): Vector2 {
		return this._clipPosition;
	}

	public get clipSize(): Vector2 {
		return this._clipSize;
	}

	public get name(): string {
		return this._name;
	}
}

export class SpriteAtlasManager {
	private static atlases: Map<string, SpriteAtlas> = new Map<string, SpriteAtlas>();

    public static getAtlas(name: string): SpriteAtlas {
        return SpriteAtlasManager.atlases.get(name);
    }
    
	public static createAtlas(name: string, image: GameImage, frames: SpriteFrame[]): SpriteAtlas {
		SpriteAtlasManager.atlases.set(name, new SpriteAtlas(image, frames));
        return SpriteAtlasManager.getAtlas(name);
	}
}

export class SpriteAtlas {
	private frames: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
	constructor(private image: GameImage, frames: SpriteFrame[]) {
		frames.forEach((frame) => this.frames.set(frame.name, frame));
	}

    getFrame(name: string): SpriteFrame {
        return this.frames.get(name);
    }
}


export class SpriteAnimator extends Component{
    
}

const atlas = SpriteAtlasManager.createAtlas("test", null, []);
atlas.getFrame('idle-1');