import React from "react";

type GridProps = {
	children: React.ReactNode;
};

export const Grid = ({ children }: GridProps) => {
	const childrenArray = React.Children.toArray(children);
	const isGridCell = childrenArray.every(
		(child) => React.isValidElement(child) && child.type === GridCell,
	);
	if (!isGridCell) throw new Error("Grid children must be GridCell");
	return <div className="w-full grid  grid-cols-1  md:grid-cols-2 xl:grid-cols-3  2xl:grid-cols-4 gap-5">{children}</div>;
};

type GridCellProps = {
	children: React.ReactNode;
};
export const GridCell = ({ children }: GridCellProps) => {
	return <div>{children}</div>;
};
