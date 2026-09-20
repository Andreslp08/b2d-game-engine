import { useEffect, useRef } from "react";

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

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape" || event.defaultPrevented || isEditableTarget(event.target)) {
				return;
			}

			if (preventDefault) event.preventDefault();
			if (stopPropagation) event.stopPropagation();

			onBackRef.current();
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [enabled, preventDefault, stopPropagation]);
};
