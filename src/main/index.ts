import * as path from 'path';
import { format as formatUrl } from 'url';
import shrinkRay from '@abcnews/shrink-ray';
import { app, ipcMain, BrowserWindow, Menu } from 'electron';

const isDevelopment = process.env.NODE_ENV !== 'production';

let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 256,
    height: 256,
    minWidth: 256,
    minHeight: 256,
    maxWidth: 256,
    maxHeight: 256,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (isDevelopment) {
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
