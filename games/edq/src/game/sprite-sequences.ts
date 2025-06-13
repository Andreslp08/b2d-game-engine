import { AssetsManager } from "engine/common/assets-manager/assets-manager";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import { SpriteSequence } from "engine/graphics/sprites/sprite-sequence";
import Vector2 from "engine/math/vector2";

const RightRunningImage = AssetsManager.getImage("/assets/textures/PlayerRight.png");
const idleImage = AssetsManager.getImage("/assets/textures/PlayerRight.png");
const JumpImage = AssetsManager.getImage("/assets/textures/PlayerJumpRight.png");

// ruuning sequence
export const PlayerRunningSequence = new SpriteSequence("right-running");
Array.from({ length: 6 }).forEach((_, index) => {
	if(index === 0) return
	const sprite = new Sprite(
		`run-${index}`,
		RightRunningImage,
		new Vector2(397 * index, 0),
		new Vector2(397, 651),
		{
			position: new Vector2(0, 0),
			rotation: 0,
			size: new Vector2(1, 1),
		}
	);

	PlayerRunningSequence.addSprite(sprite);
});

export const PlayerIdle = new SpriteSequence("player-idle");
Array.from({ length: 1 }).forEach((_, index) => {
	const sprite = new Sprite(
		`idle-${index}`,
		idleImage,
		new Vector2(397 * index, 0),
		new Vector2(397, 651),
		{
			position: new Vector2(0, 0),
			rotation: 0,
			size: new Vector2(1, 1),
		}
	);

	PlayerIdle.addSprite(sprite);
});

// jumping sequence
export const PlayerJumpSequence = new SpriteSequence("player-jumping");

Array.from({ length: 3 }).forEach((_, index) => {
	if (index === 0) return;
	const sprite = new Sprite(
		`jump-${index}`,
		JumpImage,
		new Vector2(397 * index, 0),
		new Vector2(397, 651),
		{
			position: new Vector2(0, 0),
			rotation: 0,
			size: new Vector2(1, 1),
		}
	);

	PlayerJumpSequence.addSprite(sprite);
});
