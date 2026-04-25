type Listener<T> = (event: T) => void;

export class GameEvent<T> {
  private listeners: Listener<T>[] = [];

  subscribe(listener: Listener<T>) {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  unsubscribe(listener: Listener<T>) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }
  unsubscribeAll() {
    this.listeners = [];
  }

  emit(event: T) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}