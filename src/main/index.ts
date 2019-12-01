import * as os from 'os';
import * as path from 'path';
import { format as formatUrl } from 'url';
import shrinkRay from '@abcnews/shrink-ray';
import { app, ipcMain, BrowserWindow, Menu } from 'electron';

const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const IS_DARWIN = String(os.platform) === 'darwin';
const BROWSER_WINDOW_WIDTH = 256;
const BROWSER_WINDOW_HEIGHT = IS_DARWIN ? BROWSER_WINDOW_WIDTH : 320;

const BROWSER_WINDOW_CONFIG = {
  width: BROWSER_WINDOW_WIDTH,
  height: BROWSER_WINDOW_HEIGHT,
  minWidth: BROWSER_WINDOW_WIDTH,
  minHeight: BROWSER_WINDOW_HEIGHT,
  maxWidth: BROWSER_WINDOW_WIDTH,
  maxHeight: BROWSER_WINDOW_HEIGHT,
  frame: !IS_DARWIN,
  webPreferences: {
    nodeIntegration: true,
  }
};

let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow(BROWSER_WINDOW_CONFIG);

  if (IS_DEVELOPMENT) {
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL(
      `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
    );
  } else {
    Menu.setApplicationMenu(null);
    mainWindow.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      })
    );
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('devtools-opened', () => {
    if (mainWindow) {
      mainWindow.focus();
    }
    setImmediate(() => {
      if (mainWindow) {
        mainWindow.focus();
      }
    });
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.handle('file-path', async (_event, file: string) => {
  return await shrinkRay(file, {
    onProgress: progress => {
      mainWindow.webContents.send('progress', progress);
    },
  });
});
