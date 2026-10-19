import { startParticleEditorGame } from "@/features/particle-editor/game";
import { useParticleEditorStore } from "@/features/particle-editor/store/particle-editor-store";
import { useEffect, useRef } from "react";

export const ParticlePreview = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const gameRootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current || !gameRootRef.current) return;
		const preview = startParticleEditorGame(gameRootRef.current, containerRef.current);
		preview.sync(useParticleEditorStore.getState().systems);
		const unsubscribe = useParticleEditorStore.subscribe((state) => preview.sync(state.systems));
		return () => {
			unsubscribe();
			preview.destroy();
		};
	}, []);

	return (
		<div ref={containerRef} className="relative h-full bg-neutral-950 ">
			<div ref={gameRootRef} className="h-full w-full" />
			<div className="pointer-events-none absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 font-mono text-xs text-neutral-300">
				WASD to move, wheel to zoom
			</div>
		</div>
	);
};
