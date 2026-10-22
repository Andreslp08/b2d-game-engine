import { contextBridge, ipcRenderer } from 'electron';

const environmentArgument = process.argv.find((argument) =>
  argument.startsWith('--edq-environment='),
);
const environment = environmentArgument?.slice('--edq-environment='.length);

contextBridge.exposeInMainWorld('__EDQ_RUNTIME__', {
  platform: 'electron',
  environment: environment === 'development' || environment === 'staging' ? environment : 'production',
});

contextBridge.exposeInMainWorld('b2dHost', {
  exit: (): Promise<void> => ipcRenderer.invoke('b2d:exit'),
});
