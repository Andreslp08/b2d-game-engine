/** Normalized vertical wheel direction emitted by {@link MouseManager.onWheel}. */
export interface WheelEvent{
	direction:-1|0|1
}
/** Handles a normalized mouse-wheel event. */
export interface WheelEventListener{
	(wheelEvent:WheelEvent)
}

/** Describes the button associated with a click callback. */
export interface ClickEvent{
	button:'left'|'right';
}
/** Handles a normalized mouse-click event. */
export interface ClickEventListener{
	(clickEvent:ClickEvent)
}
