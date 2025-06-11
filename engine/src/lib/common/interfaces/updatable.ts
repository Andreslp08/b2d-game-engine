export interface Updatable {
	update(deltaTime: number): void;
	fixedUpdate(deltaTime: number): void;
}
