import { app, BrowserWindow, ipcMain, net, protocol } from 'electron';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import started from 'electron-squirrel-startup';

/**
 * Declares b2d:// as a secure, standard web origin before Electron is ready.
 * This lets EDQ load modules, assets, and fetch requests through the protocol.
 */
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'b2d',
    privileges: { secure: true, standard: true, supportFetchAPI: true },
  },
]);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const getWindowIconPath = () => {
  const iconPath =
    process.platform === 'darwin'
      ? 'macos/icon.icns'
      : process.platform === 'linux'
        ? 'linux/icons/512x512.png'
        : 'windows/icon.ico';
  const iconRoot = app.isPackaged
    ? path.join(process.resourcesPath, 'electron-icons')
    : path.resolve(__dirname, '../../assets/electron-icons');

  return path.join(iconRoot, iconPath);
};

/** Creates the fullscreen game window and loads EDQ from the b2d:// origin. */
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    fullscreen: true,
    icon: getWindowIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      additionalArguments: [
        `--edq-environment=${app.isPackaged ? 'production' : 'development'}`,
      ],
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadURL('b2d://app/index.html');
};

/**
 * Registers the b2d:// file handler after Electron is ready.
 * It maps requests to the web build in development and to packaged resources in production.
 */
app.whenReady().then(() => {
	/** Root directory containing the EDQ web build for the active environment. */
  const edqDist = app.isPackaged
    ? path.join(process.resourcesPath, 'dist')
    : path.resolve(__dirname, '../../../../games/edq/dist');

  /**
   * Resolves b2d://app/... requests to files below edqDist.
   * The root check blocks attempts to escape the build directory with ../ paths.
   */
  protocol.handle('b2d', (request) => {
    const requestPath = decodeURIComponent(new URL(request.url).pathname);
    const filePath = path.resolve(edqDist, `.${requestPath === '/' ? '/index.html' : requestPath}`);

    if (!filePath.startsWith(`${edqDist}${path.sep}`)) {
      return new Response('Not found', { status: 404 });
    }

    return net.fetch(pathToFileURL(filePath).toString());
  });

  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

ipcMain.handle('b2d:exit', (event) => {
  const senderUrl = event.senderFrame ? new URL(event.senderFrame.url) : null;
  if (!senderUrl || senderUrl.protocol !== 'b2d:' || senderUrl.host !== 'app') {
    throw new Error('Unauthorized exit request');
  }

  app.quit();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
