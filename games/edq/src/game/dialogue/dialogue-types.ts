import type { Scene } from "engine/scenes/scene";

export type DialogueLines = {
	speakerName: string;
	text: string;
};

export type Dialogue = {
	id: string;
	lines: DialogueLines[];
};

export type DialogueEventTypes =
	| "dialogueChanged"
	| "dialogueStarted"
	| "dialogueFinished"
	| "started"
	| "finished"
	| "lineChanged"
	| "lastDialogueLine";

export type DialogueParams = {
	scene: Scene;
	dialogues: Dialogue[];
};

export type DialogueEvent = {
	currentDialogue: Dialogue;
	currentLine: DialogueLines;
};

export type DialogueListener = (currentDialong: DialogueEvent) => void;
