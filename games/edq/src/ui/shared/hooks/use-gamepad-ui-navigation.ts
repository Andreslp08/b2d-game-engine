import { useEffect } from "react";
import { GamePadButton } from "@b2d-engine/core/input/gamepad-manager";
import { GamepadManager } from "@b2d-engine/core/input/gamepad-manager";

const FOCUSABLE_SELECTOR =
	'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Direction = "up" | "down" | "left" | "right";

const getFocusableElements = (activeLayer: string): HTMLElement[] => {
	const activeLayerRoot = Array.from(
		document.querySelectorAll<HTMLElement>("[data-gamepad-ui-layer]"),
	).find((element) => element.dataset.gamepadUiLayer === activeLayer);

	return Array.from((activeLayerRoot ?? document).querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
		(element) => element.getClientRects().length > 0 && !element.hasAttribute("disabled"),
	);
};

const isInDirection = (x: number, y: number, direction: Direction): boolean => {
	switch (direction) {
		case "up":
			return y < 0;
		case "down":
			return y > 0;
		case "left":
			return x < 0;
		case "right":
			return x > 0;
	}
};

const moveFocus = (activeLayer: string, direction: Direction): void => {
	const elements = getFocusableElements(activeLayer);
	if (elements.length === 0) return;

	const activeElement = document.activeElement;
	if (!(activeElement instanceof HTMLElement) || !elements.includes(activeElement)) {
		elements[0].focus({ preventScroll: true });
		return;
	}

	const activeRect = activeElement.getBoundingClientRect();
	const activeX = activeRect.left + activeRect.width / 2;
	const activeY = activeRect.top + activeRect.height / 2;
	let nextElement: HTMLElement | undefined;
	let nextScore = Number.POSITIVE_INFINITY;

	for (const element of elements) {
		if (element === activeElement) continue;
		const rect = element.getBoundingClientRect();
		const x = rect.left + rect.width / 2 - activeX;
		const y = rect.top + rect.height / 2 - activeY;
		if (!isInDirection(x, y, direction)) continue;

		const primaryDistance = direction === "left" || direction === "right" ? Math.abs(x) : Math.abs(y);
		const secondaryDistance = direction === "left" || direction === "right" ? Math.abs(y) : Math.abs(x);
		const score = primaryDistance + secondaryDistance * 2;
		if (score >= nextScore) continue;
		nextElement = element;
		nextScore = score;
	}

	nextElement?.focus({ preventScroll: true });
	nextElement?.scrollIntoView({ block: "nearest", inline: "nearest" });
};

/** Enables spatial focus navigation for the currently visible React UI layer. */
export const useGamepadUINavigation = (activeLayer: string | null): void => {
	useEffect(() => {
		if (!activeLayer) return;

		const focusFrame = window.requestAnimationFrame(() => {
			getFocusableElements(activeLayer)[0]?.focus({ preventScroll: true });
		});
		const unsubscribe = GamepadManager.onButtonPressed.subscribe(({ button }) => {
				switch (button) {
				case GamePadButton.button_12:
					moveFocus(activeLayer, "up");
					break;
				case GamePadButton.button_13:
					moveFocus(activeLayer, "down");
					break;
				case GamePadButton.button_14:
					moveFocus(activeLayer, "left");
					break;
				case GamePadButton.button_15:
					moveFocus(activeLayer, "right");
					break;
				case GamePadButton.button_0:
					if (document.activeElement instanceof HTMLElement) document.activeElement.click();
					else getFocusableElements(activeLayer)[0]?.focus({ preventScroll: true });
					break;
			}
		});

		return () => {
			window.cancelAnimationFrame(focusFrame);
			unsubscribe();
		};
	}, [activeLayer]);
};
