import { useEffect, useRef } from "react";
import { GameplayAction, InputManagerInstance } from "../../../game/input/input-manager";
import { InputContextPriority } from "../../../game/input/context-priority";
import { InputActionPhase } from "@b2d-engine/core/input/input-manager";

type UseEscapeBackOptions = {
	onBack: () => void;
	enabled?: boolean;
	preventDefault?: boolean;
	stopPropagation?: boolean;
};

const isEditableTarget = (target: EventTarget | null): boolean => {
	if (!(target instanceof HTMLElement)) return false;

	return (
		target.isContentEditable ||
		target.tagName === "INPUT" ||
		target.tagName === "TEXTAREA" ||
		target.tagName === "SELECT"
	);
};

/** Runs a menu's back action when Escape is pressed. */
export const useEscapeBack = ({
	onBack,
	enabled = true,
	preventDefault = true,
	stopPropagation = true,
}: UseEscapeBackOptions) => {
	const onBackRef = useRef(onBack);

	useEffect(() => {
		onBackRef.current = onBack;
	}, [onBack]);

	useEffect(() => {
		if (!enabled) return;

		const releaseContext = InputManagerInstance.pushContext({
			id: "ui-escape-back",
			priority: InputContextPriority.Menu,
			dispatchMode: "immediate",
			actions: [{ action: GameplayAction.Back, phases: [InputActionPhase.Pressed] }],
			onAction: (inputEvent) => {
				if (
					!(inputEvent.nativeEvent instanceof KeyboardEvent) ||
					inputEvent.nativeEvent.defaultPrevented ||
					isEditableTarget(inputEvent.nativeEvent.target)
				) {
					return;
				}

				if (preventDefault) inputEvent.nativeEvent.preventDefault();
				if (stopPropagation) inputEvent.nativeEvent.stopPropagation();
				onBackRef.current();
			},
		});

		return () => {
			releaseContext();
		};
	}, [enabled, preventDefault, stopPropagation]);
};
