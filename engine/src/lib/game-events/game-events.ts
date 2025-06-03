// export interface EventListener<TEventMap> {
//   on<K extends keyof TEventMap>(
//     eventName: K,
//     callback: (event: { name: K; data: TEventMap[K] }) => void
//   ): void;

//   off<K extends keyof TEventMap>(
//     eventName: K,
//     callback: (event: { name: K; data: TEventMap[K] }) => void
//   ): void;

//   emit<K extends keyof TEventMap>(eventName: K, data: TEventMap[K]): void;
// }


// export interface TransformEventMap {
//   "transform.position.updated": { x: number; y: number };
//   "transform.rotation.updated": number;
// }

// export interface GameEventMap {
//   "game.pause.changed": boolean;
//   "game.scene.loaded": { sceneName: string };
// }





// export class TransformEventListener implements EventListener<TransformEventMap>{
//   on<K extends keyof TransformEventMap>(eventName: K, callback: (event: { name: K; data: TransformEventMap[K]; }) => void): void {
//     throw new Error("Method not implemented.");
//   }
//   off<K extends keyof TransformEventMap>(eventName: K, callback: (event: { name: K; data: TransformEventMap[K]; }) => void): void {
//     throw new Error("Method not implemented.");
//   }
//   emit<K extends keyof TransformEventMap>(eventName: K, data: TransformEventMap[K]): void {
//     throw new Error("Method not implemented.");
//   }

// }

// const x = new TransformEventListener();
// x.on('transform.position.updated', (event)=>{
//   event.data.
// })