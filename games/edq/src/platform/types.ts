export type Environment = "development" | "staging" | "production";

export type Platform = "web" | "electron";

export type Runtime = {
	environment: Environment;
	platform: Platform;
};
