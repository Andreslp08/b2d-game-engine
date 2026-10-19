import { startSpriteEditorGame } from "@/features/sprite-editor/game";
import { useEffect, useRef } from "react";

export const SpritePreview = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const gameRootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current || !gameRootRef.current) return;
		return startSpriteEditorGame(gameRootRef.current, containerRef.current);
	}, []);

	return (
		<div ref={containerRef} className="relative h-full w-full overflow-hidden bg-neutral-900">
			<div ref={gameRootRef} className="h-full w-full" />
		</div>
	);
};
