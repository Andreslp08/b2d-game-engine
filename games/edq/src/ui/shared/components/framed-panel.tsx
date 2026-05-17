import type React from "react";

type Props = {
	contentClassName?: string;
	className?: string;
	strokeWidth?: number | string;
	children?: React.ReactNode;
};

export const FramedPanel: React.FC<Props> = (props) => {
	const { contentClassName, className, strokeWidth = 20, children } = props;

	return (
		<div
			className={`stroke-content ${className ?? ""}`}
			style={
				{
					"--stroke-width": typeof strokeWidth === "number" ? `${strokeWidth}px` : strokeWidth,
				} as React.CSSProperties
			}
		>

			<div className={contentClassName ?? "p-3"}>{children}</div>
		</div>
	);
};
