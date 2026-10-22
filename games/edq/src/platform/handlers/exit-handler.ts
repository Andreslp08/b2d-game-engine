import { platform } from "../declaration";

export interface ExitHandler {
	exit(): Promise<void>;
}

export class ElectronExitHandler implements ExitHandler {
	async exit(): Promise<void> {
		if (!window.b2dHost?.exit) {
			throw new Error("b2dHost.exit is unavailable");
		}

		await window.b2dHost.exit();
	}
}

export class WebExitHandler implements ExitHandler {
	async exit(): Promise<void> {
		window.location.replace("https://www.andreslp.com.co/projects/bound-to-red-skies");
	}
}

export class ExitHandlerFactory {
	static create(): ExitHandler {
		switch (platform) {
			case "electron":
				return new ElectronExitHandler();
			case "web":
				return new WebExitHandler();
		}
	}
}
