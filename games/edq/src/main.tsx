import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { preloadGame } from "./game/game.ts";
import "./ui/styles/main.css";
import { useGameStore } from "./store/store.ts";

const setLoading = useGameStore.getState().setLoadingGame;
setLoading(true);
window.onload = () => {
	preloadGame();
};

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>
);
