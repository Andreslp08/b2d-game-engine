import React from "react";
import { GRID_ITEMS_CLASSNAME } from "../constants";

type GridProps = {
	children: React.ReactNode;
};

const gridClassName =
	"w-full grid z-1 grid-cols-1  md:grid-cols-2 xl:grid-cols-3  2xl:grid-cols-4 gap-5";
export const Grid = ({ children }: GridProps) => {
	const childrenArray = React.Children.toArray(children);
	const isGridCell = childrenArray.every(
		(child) => React.isValidElement(child) && child.type === GridCell,
	);
	if (!isGridCell) throw new Error("Grid children must be GridCell");
	return <div className={gridClassName}>{children}</div>;
};

type GridCellProps = {
	children: React.ReactNode;
};
export const GridCell = ({ children }: GridCellProps) => {
	return <div className={`${GRID_ITEMS_CLASSNAME}`}>{children}</div>;
};

export const EmptyGridCell = () => {
	return <div className={`${GRID_ITEMS_CLASSNAME}  border-3 border-[#fdfdff1c]`}></div>;
};
