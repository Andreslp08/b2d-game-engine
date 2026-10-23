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

/** Runs a menu's back action when Escape or the gamepad cancel button is pressed. */
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
				const nativeEvent = inputEvent.nativeEvent;
				if (
					nativeEvent instanceof KeyboardEvent &&
					(nativeEvent.defaultPrevented || isEditableTarget(nativeEvent.target))
				)
					return;

				if (nativeEvent instanceof KeyboardEvent) {
					if (preventDefault) nativeEvent.preventDefault();
					if (stopPropagation) nativeEvent.stopPropagation();
				}
				onBackRef.current();
			},
		});

		return () => {
			releaseContext();
		};
	}, [enabled, preventDefault, stopPropagation]);
};
