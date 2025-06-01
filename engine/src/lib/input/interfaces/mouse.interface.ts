export interface WheelEvent{
	direction:-1|0|1
}
export interface WheelEventListener{
	(wheelEvent:WheelEvent)
}

export interface ClickEvent{
	button:'left'|'right';
}
export interface ClickEventListener{
	(clickEvent:ClickEvent)
}