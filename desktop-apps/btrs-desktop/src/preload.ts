import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('__PLATFORM__', 'electron');

contextBridge.exposeInMainWorld('b2dHost', {
  exit: (): Promise<void> => ipcRenderer.invoke('b2d:exit'),
});
