import { GameAssetsTypes } from "engine/common/interfaces/assets";

export const PRELOAD_ASSETS: { type: GameAssetsTypes; name: string; path: string }[] = [
	// { type: GameAssetsTypes.Image, name: "Analgesic", path: "/assets/textures/Analgesic.png" },
	// { type: GameAssetsTypes.Image, name: "Boss", path: "/assets/textures/Boss.png" },
	// { type: GameAssetsTypes.Image, name: "Car1", path: "/assets/textures/Car1.png" },
	// { type: GameAssetsTypes.Image, name: "Car2", path: "/assets/textures/Car2.png" },
	// { type: GameAssetsTypes.Image, name: "Car3", path: "/assets/textures/Car3.png" },
	// { type: GameAssetsTypes.Image, name: "Car4", path: "/assets/textures/Car4.png" },
	// { type: GameAssetsTypes.Image, name: "Cloud", path: "/assets/textures/Cloud.png" },
	// { type: GameAssetsTypes.Image, name: "Crosshair1", path: "/assets/textures/Crosshair1.png" },
	// { type: GameAssetsTypes.Image, name: "Floor", path: "/assets/textures/Floor.png" },
	// { type: GameAssetsTypes.Image, name: "Hand", path: "/assets/textures/Hand.png" },
	// { type: GameAssetsTypes.Image, name: "House1", path: "/assets/textures/House1.png" },
	// { type: GameAssetsTypes.Image, name: "House2", path: "/assets/textures/House2.png" },
	// { type: GameAssetsTypes.Image, name: "House3", path: "/assets/textures/House3.png" },
	// { type: GameAssetsTypes.Image, name: "House4", path: "/assets/textures/House4.png" },
	// { type: GameAssetsTypes.Image, name: "Marker", path: "/assets/textures/Marker.png" },
	// { type: GameAssetsTypes.Image, name: "Megaphone", path: "/assets/textures/Megaphone.png" },
	// { type: GameAssetsTypes.Image, name: "NoVirus", path: "/assets/textures/NoVirus.png" },
	// { type: GameAssetsTypes.Image, name: "None", path: "/assets/textures/None.png" },
	// { type: GameAssetsTypes.Image, name: "Shield", path: "/assets/textures/Shield.png" },
	// {
	// 	type: GameAssetsTypes.Image,
	// 	name: "SickManRight",
	// 	path: "/assets/textures/SickManRight.png",
	// },
	// { type: GameAssetsTypes.Image, name: "SickManLeft", path: "/assets/textures/SickManLeft.png" },
	// { type: GameAssetsTypes.Image, name: "SneezeGuy", path: "/assets/textures/SneezeGuy.png" },
	// { type: GameAssetsTypes.Image, name: "spritesheet:soldier", path: "/assets/textures/Soldier.png" },
	// { type: GameAssetsTypes.Image, name: "spritesheet:player_right", path: "/assets/textures/PlayerRight.png" },
	// {
	// 	type: GameAssetsTypes.Image,
	// 	name: "SoldierWeapon",
	// 	path: "/assets/textures/SoldierWeapon.png",
	// },
	// { type: GameAssetsTypes.Image, name: "Spray", path: "/assets/textures/Spray.png" },
	// { type: GameAssetsTypes.Image, name: "SprayLeft", path: "/assets/textures/SprayLeft.png" },
	// { type: GameAssetsTypes.Image, name: "SprayRight", path: "/assets/textures/SprayRight.png" },
	// { type: GameAssetsTypes.Image, name: "Store1", path: "/assets/textures/Store1.png" },
	// { type: GameAssetsTypes.Image, name: "Store2", path: "/assets/textures/Store2.png" },
	// { type: GameAssetsTypes.Image, name: "Store3", path: "/assets/textures/Store3.png" },
	// { type: GameAssetsTypes.Image, name: "Store4", path: "/assets/textures/Store4.png" },
	// { type: GameAssetsTypes.Image, name: "Tape", path: "/assets/textures/Tape.png" },
	// { type: GameAssetsTypes.Image, name: "Tree", path: "/assets/textures/Tree.png" },
	// { type: GameAssetsTypes.Image, name: "Virus", path: "/assets/textures/Virus.png" },
	// { type: GameAssetsTypes.Image, name: "WaterWeapon", path: "/assets/textures/WaterWeapon.png" },
	// { type: GameAssetsTypes.Image, name: "WorkBoss", path: "/assets/textures/WorkBoss.jpg" },
	// { type: GameAssetsTypes.Image, name: "crosshair", path: "/assets/textures/crosshair.png" },

	// UI
	{
		type: GameAssetsTypes.Image,
		name: "ui:segment-bar-container",
		path: "/assets/ui/segment-bar-container.png",
	},
	{ type: GameAssetsTypes.Image, name: "ui:health-icon", path: "/assets/ui/health-icon.png" },
	{ type: GameAssetsTypes.Image, name: "ui:shield-icon", path: "/assets/ui/shield-icon.png" },
	// spritesheets
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:city",
		path: "/assets/textures/city.png",
	},
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:desert-eagle",
		path: "/assets/textures/desert-eagle.png",
	},
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:desert-eagle-bullet",
		path: "/assets/textures/desert-eagle-bullet.png",
	},
	{ type: GameAssetsTypes.Image, name: "spritesheet:box", path: "/assets/textures/Box.png" },
	{ type: GameAssetsTypes.Image, name: "spritesheet:city", path: "/assets/textures/city.png" },
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:player-idle",
		path: "/assets/textures/player-idle.png",
	},
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:player-idle-no-arms",
		path: "/assets/textures/player-idle-no-arms.png",
	},
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:player-right-arm",
		path: "/assets/textures/player-right-arm.png",
	},
	{
		type: GameAssetsTypes.Image,
		name: "spritesheet:soldier-idle",
		path: "/assets/textures/soldier-idle.png",
	},

	// ATLAS
	{
		type: GameAssetsTypes.Atlas,
		name: "atlas:player-idle",
		path: "/assets/atlas/player-idle.json",
	},
	{
		type: GameAssetsTypes.Atlas,
		name: "atlas:player-idle-no-arms",
		path: "/assets/atlas/player-idle-no-arms.json",
	},
	{
		type: GameAssetsTypes.Atlas,
		name: "atlas:soldier-idle",
		path: "/assets/atlas/soldier-idle.json",
	},
];
