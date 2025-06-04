import { AssetsManager } from "engine/common/index";
import { Sprite } from "engine/graphics/sprites/components/sprite";
import  { SpriteSequence } from "engine/graphics/sprites/sprite-sequence";
import Vector2 from "engine/math/vector2";

const RightRunningImage = AssetsManager.getImage("/assets/textures/PlayerRight.png");

export const RightRunningSequence = new SpriteSequence("right-running");
RightRunningSequence.addSprite(
	new Sprite(
		"run-1",
		RightRunningImage,
		{
			position: new Vector2(397, 0),
			rotation: 0,
			size: new Vector2(397, 651),
		},
	)
)
	.addSprite(
		new Sprite(
			"run-2",
			RightRunningImage,
			{
				position: new Vector2(397 * 2, 0),
				rotation: 0,
				size: new Vector2(397, 651),
			},
		)
	)
	.addSprite(
		new Sprite(
			"run-3",
			RightRunningImage,
			{
				position: new Vector2(397 * 3, 0),
				rotation: 0,
				size: new Vector2(397, 651),
			},
		)
	)
	.addSprite(
		new Sprite(
			"run-4",
			RightRunningImage,
			{
				position: new Vector2(397 * 4, 0),
				rotation: 0,
				size: new Vector2(397, 651),
			},
		)
	)
	.addSprite(
		new Sprite(
			"run-5",
			RightRunningImage,
			{
				position: new Vector2(397 * 5, 0),
				rotation: 0,
				size: new Vector2(397, 651),
			},
		)
	)
	.addSprite(
		new Sprite(
			"run-6",
			RightRunningImage,
			{
				position: new Vector2(397 * 6, 0),
				rotation: 0,
				size: new Vector2(397, 651),
			},
		)
	)
	.addSprite(
		new Sprite(
			"run-7",
			RightRunningImage,
			{
				position: new Vector2(397 * 7, 0),
				rotation: 0,
				size: new Vector2(397, 651),
			},
		)
	);

export const LeftRunningSequence = new SpriteSequence("left-running");
LeftRunningSequence.sprites = RightRunningSequence.sprites.map((sprite) => new Sprite(sprite.id, sprite.image, sprite.imageClipTransform));
const idleImage = AssetsManager.getImage("/assets/textures/PlayerRight.png");

export const PlayerIdle = new SpriteSequence("player-idle");
const x = 	new Sprite(
		"run-1",
		idleImage,
		{
			position: new Vector2(0, 0),
			rotation: 0,
			size: new Vector2(397, 651),
		},
	)
	PlayerIdle.addSprite(
		x
	);


const JumpImage = AssetsManager.getImage("/assets/textures/PlayerJumpRight.png");

export const PlayerJumpSequence = new SpriteSequence("player-jumping");
PlayerJumpSequence
// .addSprite(
// 	new Sprite(
// 		"run-1",
// 		JumpImage,
// 		{
// 			position: new Vector2(0, 0),
// 			rotation: 0,
// 			size: new Vector2(397, 651),
// 		},
// 		null
// 	)
// )
	.addSprite(
		new Sprite(
			"run-2",
			JumpImage,
			{
				position: new Vector2(397, 0),
				rotation: 0,
				size: new Vector2(397, 651),
			},
		)
	)
	.addSprite(
		new Sprite(
			"run-3",
			JumpImage,
			{
				position: new Vector2(397 * 2, 0),
				rotation: 0,
				size: new Vector2(397, 651),
			},
		)
	)
	// .addSprite(
	// 	new Sprite(
	// 		"run-4",
	// 		JumpImage,
	// 		{
	// 			position: new Vector2(397 * 3, 0),
	// 			rotation: 0,
	// 			size: new Vector2(397, 651),
	// 		},
	// 		null
	// 	)
	// )
	// .addSprite(
	// 	new Sprite(
	// 		"run-5",
	// 		JumpImage,
	// 		{
	// 			position: new Vector2(397 * 4, 0),
	// 			rotation: 0,
	// 			size: new Vector2(397, 651),
	// 		},
	// 		null
	// 	)
	// )
	// .addSprite(
	// 	new Sprite(
	// 		"run-6",
	// 		JumpImage,
	// 		{
	// 			position: new Vector2(397 * 5, 0),
	// 			rotation: 0,
	// 			size: new Vector2(397, 651),
	// 		},
	// 		null
	// 	)
	// )
	// .addSprite(
	// 	new Sprite(
	// 		"run-7",
	// 		JumpImage,
	// 		{
	// 			position: new Vector2(397 * 6, 0),
	// 			rotation: 0,
	// 			size: new Vector2(397, 651),
	// 		},
	// 		null
	// 	)
	// );
