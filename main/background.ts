import { app, dialog, ipcMain } from 'electron';
import serve from 'electron-serve';
import path from 'path';
import { createWindow } from './helpers';

const isProd: boolean = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();
  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  
  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
    ipcMain.on('get-music-directory', async (event, arg) => {
      const directory = await dialog.showOpenDialog({ properties: ['openDirectory'] });
      event.returnValue = directory;
    });
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});
