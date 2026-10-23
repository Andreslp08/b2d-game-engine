import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initGame } from "./game/game.ts";
import "./ui/styles/main.css";
window.onload = () => {
	initGame();
};

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
